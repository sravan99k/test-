import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Upload, Loader2, Search, Pen, Trash2, MoreHorizontal, Mail, Phone, Pencil, ChevronLeft, ChevronRight, XCircle, Download, FileText, AlertCircle } from 'lucide-react';
import { DataTable, Column } from '../shared/DataTable';
import { cn } from '@/lib/utils';
import { BulkActionBar } from '../shared/BulkActionBar';
import { TeacherForm } from './TeacherForm';
import { ReassignDialog } from './ReassignDialog';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/integrations/firebase';
import { collection, getDocs, doc, getDoc, deleteDoc, query, where, limit, updateDoc, serverTimestamp } from 'firebase/firestore';
import { deleteUser, signInWithEmailAndPassword } from 'firebase/auth';
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Progress } from '@/components/ui/progress';
import { useTeacherCSVImport } from '@/hooks/management/useTeacherCSVImport';
import { useManagement } from '@/contexts/ManagementContext';
import { downloadCSVTemplate, getTeacherCSVColumns } from '@/utils/csvTemplates';

interface Teacher {
    id: string;
    teacherID?: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    assignedGrades?: string[];
    experience: string;
    dateAdded?: any;
    qualification?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
}

export function TeacherManagementView() {
    const { toast } = useToast();
    const { teachers, students, assignments, isLoading: loading, refreshTeachers } = useManagement();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [subjectFilter, setSubjectFilter] = useState('all');
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [bulkDeleteInput, setBulkDeleteInput] = useState('');
    const [showCSVImportModal, setShowCSVImportModal] = useState(false);

    // Get unique subjects for filtering
    const subjects = useMemo(() => {
        const set = new Set(teachers.map(t => t.subject).filter(Boolean));
        return Array.from(set).sort();
    }, [teachers]);

    const filteredTeachers = useMemo(() => {
        return teachers.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.teacherID?.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSubject = subjectFilter === 'all' || t.subject === subjectFilter;
            return matchesSearch && matchesSubject;
        });
    }, [teachers, searchTerm, subjectFilter]);

    // Form state for editing teacher
    const [editForm, setEditForm] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        ID: "",
        subject: "General",
        qualification: "",
        experience: "0",
        dateOfBirth: "",
        gender: "",
        address: "",
        assignedGrades: [] as string[]
    });

    const handleEditChange = (field: string, value: string | string[]) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleEditClick = (teacher: Teacher) => {
        const [firstName, ...lastNameParts] = teacher.name.split(' ');
        const lastName = lastNameParts.join(' ');

        setEditingTeacher(teacher);
        setEditForm({
            firstName,
            lastName,
            phone: teacher.phone || "",
            ID: teacher.teacherID || "",
            subject: teacher.subject || "General",
            qualification: teacher.qualification || "",
            experience: teacher.experience ? teacher.experience.replace(' years', '') : "0",
            dateOfBirth: teacher.dateOfBirth || "",
            gender: teacher.gender || "",
            address: teacher.address || "",
            assignedGrades: teacher.assignedGrades || []
        });
    };

    const handleSaveTeacher = async () => {
        if (!editingTeacher) return;

        try {
            setIsSaving(true);
            if (!auth.currentUser) throw new Error('Not authenticated');

            const userDocSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (!userDocSnap.exists()) throw new Error('User document not found');

            const userData = userDocSnap.data();
            const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData;

            let teacherPath = '';
            if (isIndependent) {
                teacherPath = `users/${adminId}/schools/${schoolId}/teachers/${editingTeacher.id}`;
            } else {
                teacherPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/teachers/${editingTeacher.id}`;
            }

            await updateDoc(doc(db, teacherPath), {
                firstName: editForm.firstName,
                lastName: editForm.lastName,
                name: `${editForm.firstName} ${editForm.lastName}`,
                phone: editForm.phone,
                teacherID: editForm.ID,
                subject: editForm.subject,
                experience: editForm.experience ? `${editForm.experience} years` : '0 years',
                assignedGrades: editForm.assignedGrades,
                qualification: editForm.qualification,
                dateOfBirth: editForm.dateOfBirth,
                gender: editForm.gender,
                address: editForm.address,
                updatedAt: serverTimestamp()
            });

            toast({ title: 'Success', description: 'Teacher updated successfully' });
            refreshTeachers();
            setEditingTeacher(null);
        } catch (error) {
            console.error('Error updating teacher:', error);
            toast({ title: 'Error', description: 'Failed to update teacher', variant: 'destructive' });
        } finally {
            setIsSaving(false);
        }
    };

    // Reassign state
    const [reassignDialogState, setReassignDialogState] = useState<{
        open: boolean;
        teacherId: string;
        teacherName: string;
        mode: 'delete' | 'reassign';
    }>({ open: false, teacherId: '', teacherName: '', mode: 'reassign' });

    const { importCSV, isImporting, importProgress } = useTeacherCSVImport();

    // Removal of local loadTeachers logic

    const handleDeleteClick = (teacher: Teacher) => {
        // Check assignments first via ReassignDialog logic
        setReassignDialogState({
            open: true, // ReassignDialog will check student count on open
            teacherId: teacher.id,
            teacherName: teacher.name,
            mode: 'delete'
        });
    };

    const handleReassignSuccess = async (shouldDelete?: boolean) => {
        if (shouldDelete) {
            // Proceed to delete teacher
            await performDelete(reassignDialogState.teacherId);
        }
        setReassignDialogState(prev => ({ ...prev, open: false }));
        refreshTeachers(); // Refresh list to update counts or remove teacher
    };

    const performDelete = async (teacherId: string) => {
        try {
            setIsDeleting(true);
            if (!auth.currentUser) return;
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const userData = userDoc.data();
            const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData || {};
            const schoolPath = isIndependent
                ? `users/${adminId}/schools/${schoolId}`
                : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

            await deleteDoc(doc(db, `${schoolPath}/teachers`, teacherId));

            // Find teacher to get email for user account deletion
            // Use local find or fallback to passed checking
            const teacher = teachers.find(t => t.id === teacherId) || teacherToDelete;

            // Delete user document if email exists
            if (teacher?.email) {
                const userQuery = await getDocs(
                    query(
                        collection(db, 'users'),
                        where('email', '==', teacher.email),
                        limit(1)
                    )
                );

                if (!userQuery.empty) {
                    const userDoc = userQuery.docs[0];
                    await deleteDoc(doc(db, 'users', userDoc.id));
                }
            }

            // Only show toast and refresh if NOT doing a batch operation 
            // (Batch operation handles its own refresh/toast to avoid spam)
            if (teacherToDelete && teacherToDelete.id === teacherId) {
                toast({ title: 'Deleted', description: 'Teacher deleted successfully.' });
                refreshTeachers();
            }
        } catch (e) {
            console.error(e);
            throw e; // Re-throw for batch handling
        } finally {
            if (teacherToDelete && teacherToDelete.id === teacherId) {
                setIsDeleting(false);
                setTeacherToDelete(null);
                setDeleteConfirmationText('');
            }
        }
    };

    const columns: Column<Teacher>[] = [
        {
            header: 'Teacher ID',
            accessor: (row) => <span className="font-medium text-[#111827]">{row.teacherID || row.id}</span>,
            sortable: true,
            sortKey: 'teacherID'
        },
        { header: 'Name', accessor: (row) => <span className="font-medium text-[#111827]">{row.name}</span>, sortable: true },
        { header: 'Subject', accessor: (row) => <span className="text-[#111827]">{row.subject || 'N/A'}</span>, sortable: true },
        {
            header: 'Contact',
            accessor: (row) => (
                <div className="flex flex-col items-start gap-1 text-sm">
                    <div className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-[#6B7280] flex-shrink-0" />
                        <span className="text-[#111827]">{row.email || 'N/A'}</span>
                    </div>
                    {row.phone && (
                        <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-[#6B7280] flex-shrink-0" />
                            <span className="text-[#6B7280] font-medium">{row.phone}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Assigned Classes',
            accessor: (row) => {
                // Calculate assigned classes dynamically from actual student assignments
                const teacherStudentIds = Object.entries(assignments)
                    .filter(([_, tIds]) => (tIds as string[]).includes(row.id))
                    .map(([sId]) => sId);

                const assignedClasses = new Set<string>();
                teacherStudentIds.forEach(sId => {
                    const student = students.find(s => s.id === sId);
                    if (student && student.grade && student.section) {
                        assignedClasses.add(`${student.grade}${student.section}`);
                    }
                });

                const classes = Array.from(assignedClasses).sort();

                return (
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {classes.length > 0 ? (
                            classes.map((cls) => (
                                <Badge key={cls} variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 uppercase font-bold text-[10px]">{cls}</Badge>
                            ))
                        ) : (
                            <Badge variant="outline" className="text-gray-400 border-gray-100 font-medium bg-gray-50/50">Unassigned</Badge>
                        )}
                    </div>
                );
            }
        },

        {
            header: 'Date Added',
            accessor: (row) => (
                <div className="flex flex-col">
                    <span className="text-gray-700 font-medium text-sm">
                        {row.dateAdded ? (
                            row.dateAdded.seconds
                                ? new Date(row.dateAdded.seconds * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                                : new Date(row.dateAdded).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                        ) : 'N/A'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">
                        {row.dateAdded ? (
                            row.dateAdded.seconds
                                ? new Date(row.dateAdded.seconds * 1000).getFullYear()
                                : new Date(row.dateAdded).getFullYear()
                        ) : ''}
                    </span>
                </div>
            ),
            sortable: true
        },
        {
            header: 'Actions',
            accessor: (row) => (
                <div className="flex justify-start pl-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4 text-[#6B7280]" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); handleEditClick(row); }}
                                className="text-[#2563EB]"
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => { e.stopPropagation(); setTeacherToDelete(row); }}
                                className="text-[#DC2626]"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove Teacher
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-5">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                    {/* Unified Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
                        <Input
                            id="teacher-search-bar"
                            placeholder="Search by name, email or teacher ID..."
                            className="pl-11 h-12 bg-white border-gray-200 focus:bg-gray-50/50 shadow-sm transition-all text-base rounded-xl"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="h-4.5 w-4.5" />
                            </button>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2.5 h-12">
                        <Button
                            variant="outline"
                            className="h-full px-5 border-gray-200 hover:bg-gray-50 gap-2 font-semibold text-gray-600 rounded-xl"
                            onClick={() => setShowCSVImportModal(true)}
                        >
                            <Upload className="h-4 w-4 text-blue-500" />
                            Import CSV
                        </Button>
                        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                            <DialogTrigger asChild>
                                <Button className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-100 transition-all flex items-center gap-2 group">
                                    <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
                                    Add New Teacher
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <TeacherForm onSuccess={() => { setShowAddDialog(false); refreshTeachers(); }} onCancel={() => setShowAddDialog(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Subject Filtering Pills */}
                <div className="bg-gray-50/40 p-2 rounded-2xl border border-gray-100 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-2 min-w-max">
                        <button
                            onClick={() => setSubjectFilter('all')}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                                subjectFilter === 'all'
                                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                            )}
                        >
                            All Subjects
                        </button>
                        {subjects.map(subject => (
                            <button
                                key={subject}
                                onClick={() => setSubjectFilter(subject)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
                                    subjectFilter === subject
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                                )}
                            >
                                {subject}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Card id="teacher-table" className="border-none shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden ring-1 ring-gray-100">
                <CardContent className="p-0">
                    <DataTable
                        data={filteredTeachers}
                        columns={columns}
                        selection={selectedIds}
                        getRowId={(row) => row.id}
                        onSelectionChange={setSelectedIds}
                        searchable={false}
                        pageSize={15}
                        loading={loading}
                        entityName="teachers"
                        emptyMessage={
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-500">
                                <div className="bg-blue-50 p-6 rounded-full mb-6 ring-8 ring-blue-50/50">
                                    <Search className="h-10 w-10 text-blue-500 opacity-80" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Teachers Found</h3>
                                <p className="text-gray-500 max-w-[320px] mb-8 leading-relaxed">
                                    We couldn't find any staff members matching your current filters or search query.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSubjectFilter('all');
                                        setSearchTerm('');
                                    }}
                                    className="bg-white hover:bg-gray-50 border-gray-200 text-gray-700 font-semibold px-8 rounded-xl"
                                >
                                    Clear All Filters
                                </Button>
                            </div>
                        }
                    />
                </CardContent>
            </Card>

            {/* Bulk Actions */}
            <BulkActionBar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                actions={[
                    {
                        label: 'Delete Selected',
                        icon: <Trash2 className="h-4 w-4" />,
                        onClick: () => {
                            setShowBulkDeleteConfirm(true);
                        },
                        variant: 'destructive',
                    }
                ]}
            />

            {/* Reassign / Delete Dialog */}
            <ReassignDialog
                open={reassignDialogState.open}
                onOpenChange={(open) => setReassignDialogState(prev => ({ ...prev, open }))}
                fromTeacherId={reassignDialogState.teacherId}
                fromTeacherName={reassignDialogState.teacherName}
                mode={reassignDialogState.mode}
                onSuccess={handleReassignSuccess}
            />

            {/* Import Progress */}
            <Dialog open={isImporting} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Importing Teachers</DialogTitle>
                        <DialogDescription>{importProgress.status}</DialogDescription>
                    </DialogHeader>
                    <Progress value={importProgress.total ? (importProgress.current / importProgress.total) * 100 : 0} />
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog - Exact logic from TeachersListPage */}
            {teacherToDelete && (
                <Dialog open={!!teacherToDelete} onOpenChange={(open) => !open && setTeacherToDelete(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <div className="flex items-center gap-3">
                                <div className="bg-red-100 p-2 rounded-full">
                                    <Trash2 className="h-5 w-5 text-red-600" />
                                </div>
                                <DialogTitle>Delete {teacherToDelete?.name}</DialogTitle>
                            </div>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="text-sm text-muted-foreground">
                                <p>This action cannot be undone. This will permanently delete the teacher record.</p>
                                <p className="mt-2">
                                    Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{teacherToDelete?.name}/{teacherToDelete?.id.substring(0, 4)}</span> to confirm.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Input
                                    placeholder={`Type name/id to confirm`}
                                    value={deleteConfirmationText}
                                    onChange={(e) => setDeleteConfirmationText(e.target.value)}
                                    className={deleteConfirmationText && deleteConfirmationText !== `${teacherToDelete?.name}/${teacherToDelete?.id.substring(0, 4)}` ? 'border-red-500' : ''}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => { setTeacherToDelete(null); setDeleteConfirmationText(''); }} disabled={isDeleting}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => performDelete(teacherToDelete.id)}
                                    disabled={isDeleting || deleteConfirmationText !== `${teacherToDelete?.name}/${teacherToDelete?.id.substring(0, 4)}`}
                                >
                                    {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete Teacher'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            {/* Edit Teacher Dialog - Matching UI and Logic from TeachersListPage */}
            <Dialog open={!!editingTeacher} onOpenChange={(open) => !open && setEditingTeacher(null)}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Teacher</DialogTitle>
                        <DialogDescription>
                            Update teacher details below. Changes will be saved immediately.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-firstName">First Name *</Label>
                                <Input
                                    id="edit-firstName"
                                    value={editForm.firstName}
                                    onChange={(e) => handleEditChange("firstName", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-lastName">Last Name *</Label>
                                <Input
                                    id="edit-lastName"
                                    value={editForm.lastName}
                                    onChange={(e) => handleEditChange("lastName", e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">Phone</Label>
                                <Input
                                    id="edit-phone"
                                    type="tel"
                                    value={editForm.phone}
                                    onChange={(e) => handleEditChange("phone", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-id">Teacher ID</Label>
                                <Input
                                    id="edit-id"
                                    value={editForm.ID}
                                    onChange={(e) => handleEditChange("ID", e.target.value)}
                                    placeholder="e.g., T001, TEA123"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-subject">Subject</Label>
                                <Input
                                    id="edit-subject"
                                    value={editForm.subject}
                                    onChange={(e) => handleEditChange("subject", e.target.value)}
                                    placeholder="e.g., Mathematics"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-qualification">Qualification</Label>
                                <Input
                                    id="edit-qualification"
                                    value={editForm.qualification}
                                    onChange={(e) => handleEditChange("qualification", e.target.value)}
                                    placeholder="e.g., M.Ed, B.Ed"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-experience">Experience (years)</Label>
                                <Input
                                    id="edit-experience"
                                    type="number"
                                    value={editForm.experience}
                                    onChange={(e) => handleEditChange("experience", e.target.value)}
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-dob">Date of Birth</Label>
                                <Input
                                    id="edit-dob"
                                    type="date"
                                    value={editForm.dateOfBirth}
                                    onChange={(e) => handleEditChange("dateOfBirth", e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-gender">Gender</Label>
                                <Select
                                    value={editForm.gender}
                                    onValueChange={(value) => handleEditChange("gender", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="edit-address">Address</Label>
                            <Input
                                id="edit-address"
                                value={editForm.address}
                                onChange={(e) => handleEditChange("address", e.target.value)}
                                placeholder="Enter full address"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Assigned Grades/Classes</Label>
                            <div className="flex flex-wrap gap-2">
                                {editForm.assignedGrades && editForm.assignedGrades.length > 0 ? (
                                    editForm.assignedGrades.map((grade, index) => (
                                        <Badge key={index} variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-700 border-blue-100 uppercase">
                                            {grade}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const updatedGrades = [...editForm.assignedGrades];
                                                    updatedGrades.splice(index, 1);
                                                    handleEditChange("assignedGrades", updatedGrades);
                                                }}
                                                className="ml-2 text-blue-400 hover:text-blue-600"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No grades/classes assigned</p>
                                )}
                            </div>
                            <div className="mt-2 flex gap-2">
                                <Input
                                    id="add-grade"
                                    placeholder="Add grade/class (e.g., 10A, 11B)"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                            e.preventDefault();
                                            const newGrade = e.currentTarget.value.trim().toUpperCase();
                                            if (!editForm.assignedGrades.includes(newGrade)) {
                                                handleEditChange("assignedGrades", [...editForm.assignedGrades, newGrade]);
                                            }
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const input = document.getElementById('add-grade') as HTMLInputElement;
                                        if (input.value.trim()) {
                                            const newGrade = input.value.trim().toUpperCase();
                                            if (!editForm.assignedGrades.includes(newGrade)) {
                                                handleEditChange("assignedGrades", [...editForm.assignedGrades, newGrade]);
                                            }
                                            input.value = '';
                                        }
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setEditingTeacher(null)}
                                disabled={isSaving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveTeacher}
                                disabled={isSaving || !editForm.firstName || !editForm.lastName}
                                className="bg-blue-600 hover:bg-blue-700 font-bold"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Save Changes'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Bulk Delete Confirmation Dialog */}
            <Dialog open={showBulkDeleteConfirm} onOpenChange={(open) => { if (!open) { setShowBulkDeleteConfirm(false); setBulkDeleteInput(''); } }}>
                <DialogContent>
                    <DialogHeader>
                        <div className="flex items-center gap-3">
                            <div className="bg-red-100 p-2 rounded-full">
                                <Trash2 className="h-5 w-5 text-red-600" />
                            </div>
                            <DialogTitle>Delete {selectedIds.length} Selected Teachers?</DialogTitle>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="text-sm text-muted-foreground">
                            <p>This action cannot be undone. This will permanently delete the {selectedIds.length} selected teacher records.</p>
                            <p className="mt-2">
                                Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded">DELETE</span> to confirm.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Input
                                placeholder="Type DELETE to confirm"
                                value={bulkDeleteInput}
                                onChange={(e) => setBulkDeleteInput(e.target.value)}
                                className={bulkDeleteInput && bulkDeleteInput !== 'DELETE' ? 'border-red-500' : ''}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => { setShowBulkDeleteConfirm(false); setBulkDeleteInput(''); }} disabled={isDeleting}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={async () => {
                                    try {
                                        setIsDeleting(true);
                                        await Promise.all(selectedIds.map(id => performDelete(id)));
                                        setSelectedIds([]);
                                        toast({ title: 'Batch Delete', description: `Successfully deleted ${selectedIds.length} teachers.` });
                                        setShowBulkDeleteConfirm(false);
                                        setBulkDeleteInput('');
                                        refreshTeachers();
                                    } catch (error) {
                                        console.error("Batch delete error:", error);
                                        toast({ title: 'Error', description: 'Some teachers could not be deleted.', variant: 'destructive' });
                                    } finally {
                                        setIsDeleting(false);
                                    }
                                }}
                                disabled={isDeleting || bulkDeleteInput !== 'DELETE'}
                            >
                                {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...</> : 'Delete All Selected'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* CSV Import Modal */}
            <Dialog open={showCSVImportModal} onOpenChange={setShowCSVImportModal}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Import Teachers from CSV</DialogTitle>
                        <DialogDescription>
                            Follow these simple steps to import teacher data from a CSV file.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Quick Start Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <Download className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-blue-900 mb-2">Step 1: Download Template</h3>
                                    <p className="text-blue-800 text-sm mb-4">
                                        Start with our pre-formatted CSV template. It already has all the correct column headers.
                                    </p>
                                    <Button
                                        onClick={() => downloadCSVTemplate('teacher')}
                                        className="bg-blue-600 hover:bg-blue-700"
                                        size="lg"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Teacher Template
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Instructions Section */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-gray-100 p-3 rounded-full">
                                    <FileText className="h-6 w-6 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-2">Step 2: Fill Your Data</h3>
                                    <p className="text-gray-700 text-sm mb-4">
                                        Open the downloaded file and fill in the teacher information. Only the email field is required.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-800 mb-2 text-sm">Required Fields:</h4>
                                            <div className="space-y-1">
                                                {getTeacherCSVColumns().filter(col => col.required).map(column => (
                                                    <div key={column.name} className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                        <span className="text-sm text-gray-700">
                                                            <span className="font-mono bg-white px-1 rounded">{column.name}</span>
                                                            <span className="text-gray-500 ml-1">- {column.description}</span>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-800 mb-2 text-sm">Optional Fields:</h4>
                                            <div className="space-y-1">
                                                {getTeacherCSVColumns().filter(col => !col.required).slice(0, 4).map(column => (
                                                    <div key={column.name} className="flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-gray-300 rounded-full"></span>
                                                        <span className="text-sm text-gray-700">
                                                            <span className="font-mono bg-white px-1 rounded">{column.name}</span>
                                                            <span className="text-gray-500 ml-1">- {column.description}</span>
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Upload Section */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 p-3 rounded-full">
                                    <Upload className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-green-900 mb-2">Step 3: Upload Your File</h3>
                                    <p className="text-green-800 text-sm mb-4">
                                        Once you've filled in the data, upload your CSV file below.
                                    </p>

                                    <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center bg-white/50">
                                        <Upload className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                        <p className="text-green-700 font-medium mb-2">Choose your CSV file</p>
                                        <p className="text-green-600 text-sm mb-4">or drag and drop it here</p>
                                        <Button
                                            variant="outline"
                                            className="border-green-500 text-green-700 hover:bg-green-50"
                                            asChild
                                        >
                                            <label className="cursor-pointer">
                                                Select File
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept=".csv"
                                                    onChange={(e) => {
                                                        if (e.target.files?.[0]) {
                                                            importCSV(e.target.files[0], () => {
                                                                setShowCSVImportModal(false);
                                                                refreshTeachers();
                                                            });
                                                        }
                                                    }}
                                                    disabled={isImporting}
                                                />
                                            </label>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Important Notes */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                Important Notes
                            </h3>
                            <ul className="text-yellow-800 text-sm space-y-1 list-disc list-inside">
                                <li>Column names are case-insensitive (e.g., "Email" works the same as "email")</li>
                                <li>Spaces and hyphens in column names are automatically handled</li>
                                <li>If password is not provided, a secure password will be auto-generated</li>
                                <li>Email addresses must be unique and valid</li>
                                <li>Missing required fields will cause the row to be skipped</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">


                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
