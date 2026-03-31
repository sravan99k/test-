import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StudentDetailsDialog } from './StudentDetailsDialog';
import { Search, Plus, Upload, Loader2, Pencil, Trash2, MoreHorizontal, Mail, Phone, ShieldCheck, AlertTriangle, AlertCircle, FileText, XCircle, CircleDashed, Download } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, Column } from '../shared/DataTable';
import { BulkActionBar } from '../shared/BulkActionBar';
import { StudentForm } from './StudentForm';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { fetchStudentsPaginated, Student } from '@/services/schoolDataService';
import { useToast } from '@/hooks/use-toast';
import { DocumentSnapshot } from 'firebase/firestore';
import { useStudentCSVImport } from '@/hooks/management/useStudentCSVImport';
import { Progress } from '@/components/ui/progress';
import { BulkAssignDialog } from '../assignments/BulkAssignDialog';
import { deleteDoc, doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db, auth } from '@/integrations/firebase';
import { GradeSectionFilters } from '../shared/GradeSectionFilters';
import { useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useManagement } from '@/contexts/ManagementContext';
import { downloadCSVTemplate, getStudentCSVColumns } from '@/utils/csvTemplates';

export function StudentManagementView() {
    const { toast } = useToast();
    const { students: rawStudents, teachers, assignments, isLoading: loading, refreshStudents } = useManagement();
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
    const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [showCSVImportModal, setShowCSVImportModal] = useState(false);

    const { importCSV, isImporting, importProgress } = useStudentCSVImport();

    // Filter states
    const [gradeFilter, setGradeFilter] = useState('all');
    const [sectionFilter, setSectionFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // Handlers & Logic
    const { filteredStudents, gradeCounts, sectionCounts, activeSections } = useMemo(() => {
        const gCounts: Record<string, number> = {};
        const filtered = rawStudents.filter(s => {
            // Calculate counts for ALL grades from raw list
            const grade = s.grade || 'N/A';
            gCounts[grade] = (gCounts[grade] || 0) + 1;

            // Apply filters
            const matchesGrade = gradeFilter === 'all' || s.grade === gradeFilter;
            const matchesSection = sectionFilter === 'all' || s.section === sectionFilter;
            const matchesSearch = !searchQuery ||
                s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                s.id.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesGrade && matchesSection && matchesSearch;
        });

        // Calculate section counts only for the currently selected grade
        const sCounts: Record<string, number> = {};
        const aSections = new Set<string>();
        rawStudents.forEach(s => {
            if (s.grade === gradeFilter) {
                const sect = s.section || 'N/A';
                sCounts[sect] = (sCounts[sect] || 0) + 1;
                aSections.add(sect);
            }
        });

        return {
            filteredStudents: filtered,
            gradeCounts: gCounts,
            sectionCounts: sCounts,
            activeSections: Array.from(aSections).sort()
        };
    }, [rawStudents, gradeFilter, sectionFilter, searchQuery]);

    const handleDeleteStudent = async () => {
        if (!studentToDelete) return;
        setIsDeleting(true);
        try {
            const userDocRef = doc(db, 'users', auth.currentUser!.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) throw new Error('User document not found');

            const userData = userDocSnap.data();
            const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData;

            const schoolPath = (isIndependent || !organizationId)
                ? `users/${adminId}/schools/${schoolId}`
                : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

            // 1. Delete from students collection
            await deleteDoc(doc(db, `${schoolPath}/students`, studentToDelete.id));

            // 2. Delete from grades list
            if (studentToDelete.grade && studentToDelete.section) {
                await deleteDoc(doc(db, `${schoolPath}/grades/_list/${studentToDelete.grade}/${studentToDelete.section}/students`, studentToDelete.id)).catch(() => { });
            }

            // 3. Delete from users collections (by email or studentId)
            const userQuery = await getDocs(query(collection(db, "users"), where("studentId", "==", studentToDelete.id), limit(1)));
            if (!userQuery.empty) {
                await deleteDoc(doc(db, "users", userQuery.docs[0].id));
            }

            toast({ title: 'Success', description: 'Student deleted successfully' });
            refreshStudents(); // Refresh global cache
            setSelectedIds(prev => prev.filter(id => id !== studentToDelete.id));
            setStudentToDelete(null);
            setDeleteConfirmationText('');
        } catch (error: any) {
            console.error('Delete error:', error);
            toast({ title: 'Error', description: error.message || 'Failed to delete student', variant: 'destructive' });
        } finally {
            setIsDeleting(false);
        }
    };

    const columns: Column<Student>[] = [
        {
            header: 'Student ID',
            accessor: (row) => <span className="font-medium text-[#111827]">{row.id}</span>,
            sortKey: 'id',
            sortable: true
        },
        {
            header: 'Name',
            accessor: (row) => <span className="text-[#111827] font-medium">{row.name}</span>,
            sortKey: 'name',
            sortable: true
        },
        {
            header: 'Grade',
            accessor: (row) => <span className="text-[#111827]">Class {row.grade}</span>,
            sortKey: 'grade',
            sortable: true
        },
        {
            header: 'Section',
            accessor: (row) => <span className="text-[#111827]">{row.section}</span>,
            sortKey: 'section',
            sortable: true
        },
        {
            header: 'Wellbeing Status',
            accessor: (row) => {
                if (!row.last_assessment || row.last_assessment === 'No data') {
                    return (
                        <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="w-fit capitalize font-semibold gap-1.5 py-1 bg-gray-50 text-gray-500 border-gray-200">
                                <CircleDashed className="h-3.5 w-3.5 text-gray-400" />
                                No Data
                            </Badge>
                            <span className="text-[10px] text-gray-400 font-medium ml-1">
                                Pending Assessment
                            </span>
                        </div>
                    );
                }

                const colors = {
                    low: "bg-emerald-50 text-emerald-700 border-emerald-100",
                    medium: "bg-amber-50 text-amber-700 border-amber-100",
                    high: "bg-rose-50 text-rose-700 border-rose-100"
                };
                const Icons = {
                    low: ShieldCheck,
                    medium: AlertTriangle,
                    high: AlertCircle
                };
                const Icon = Icons[row.risk_level] || ShieldCheck;

                return (
                    <div className="flex flex-col gap-1">
                        <Badge variant="outline" className={`w-fit capitalize font-semibold gap-1.5 py-1 ${colors[row.risk_level]}`}>
                            <Icon className="h-3.5 w-3.5" />
                            {row.risk_level} Risk
                        </Badge>
                        <span className="text-[10px] text-gray-400 font-medium ml-1">
                            Score: {row.wellbeing_score}/100
                        </span>
                    </div>
                );
            },
            sortKey: 'wellbeing_score',
            sortable: true
        },
        {
            header: 'Contact',
            accessor: (row) => (
                <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-1.5 px-1">
                        <Mail className="h-3.5 w-3.5 text-gray-300" aria-label="Email" />
                        <span className="text-gray-600 font-medium">{row.email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-1">
                        <Phone className="h-3.5 w-3.5 text-gray-300" aria-label="Phone" />
                        <span className="text-gray-500 font-medium">{row.phone}</span>
                    </div>
                </div>
            ),
            sortKey: 'email',
            sortable: true
        },
        {
            header: 'Assigned To',
            accessor: (row) => {
                const assignedIds = assignments[row.id] || [];
                const assignedTeachers = assignedIds
                    .map(id => teachers.find(t => t.id === id)?.name)
                    .filter(Boolean);

                return (
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                        {assignedTeachers.length > 0 ? (
                            assignedTeachers.map((name, i) => (
                                <Badge key={i} variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold py-0.5 text-[10px] uppercase">
                                    {name}
                                </Badge>
                            ))
                        ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-400 border-gray-100 font-medium py-0.5 text-[10px] uppercase italic">
                                Unassigned
                            </Badge>
                        )}
                    </div>
                );
            }
        },
        {
            header: 'Last Sync',
            accessor: (row) => (
                <div className="flex flex-col">
                    <span className="text-gray-700 font-medium text-sm">
                        {row.last_assessment && row.last_assessment !== 'No data'
                            ? new Date(row.last_assessment).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                            : 'Pending'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">
                        Assessment
                    </span>
                </div>
            ),
            sortKey: 'last_assessment',
            sortable: true
        },
        {
            header: 'Actions',
            accessor: (row) => (
                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setViewingStudent(row);
                        }}
                        title="View Details"
                    >
                        <FileText className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingStudent(row);
                                }}
                                className="text-gray-700 font-medium"
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setStudentToDelete(row);
                                }}
                                className="text-red-600 font-medium"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            importCSV(file, () => refreshStudents());
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-5">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                    {/* Search Bar - Unified */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-gray-400 pointer-events-none" />
                        <Input
                            id="student-search-bar"
                            placeholder="Find students by name, email or counselor ID..."
                            className="pl-11 h-12 bg-white border-gray-200 focus:bg-gray-50/50 shadow-sm transition-all text-base rounded-xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XCircle className="h-4.5 w-4.5" />
                            </button>
                        )}
                    </div>

                    {/* Quick Access Actions */}
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
                                    Add New Student
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                                <StudentForm onSuccess={() => { setShowAddDialog(false); refreshStudents(); }} onCancel={() => setShowAddDialog(false)} />
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Intelligent Grade/Section Pills */}
                <div className="bg-gray-50/40 p-1.5 rounded-2xl border border-gray-100">
                    <GradeSectionFilters
                        gradeCounts={gradeCounts}
                        selectedGrade={gradeFilter}
                        onGradeChange={(g) => {
                            setGradeFilter(g);
                            setSectionFilter('all');
                        }}
                        activeSections={activeSections}
                        sectionCounts={sectionCounts}
                        selectedSection={sectionFilter}
                        onSectionChange={setSectionFilter}
                        totalStudents={rawStudents.length}
                    />
                </div>
            </div>

            <Card id="student-table" className="border-none shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden ring-1 ring-gray-100">
                <CardContent className="p-0">
                    <DataTable
                        data={filteredStudents}
                        columns={columns}
                        getRowId={(row) => row.id}
                        onSelectionChange={setSelectedIds}
                        searchable={false}
                        pageSize={15}
                        loading={loading && rawStudents.length === 0}
                        emptyMessage={
                            <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in duration-500">
                                <div className="bg-blue-50 p-6 rounded-full mb-6 ring-8 ring-blue-50/50">
                                    <Search className="h-10 w-10 text-blue-500 opacity-80" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No Students Found</h3>
                                <p className="text-gray-500 max-w-[320px] mb-8 leading-relaxed">
                                    We couldn't find any results matching your current filters or search query.
                                </p>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setGradeFilter('all');
                                        setSectionFilter('all');
                                        setSearchQuery('');
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

            <BulkActionBar
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                actions={[
                    { label: 'Give Teacher', onClick: () => setShowAssignDialog(true), variant: 'default' },
                    { label: 'Remove Student', onClick: () => console.log('Delete feature coming soon'), variant: 'destructive', icon: <Trash2 className="h-4 w-4 mr-2" /> }
                ]}
            />

            <Dialog open={isImporting} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            Importing Students
                        </DialogTitle>
                        <DialogDescription>
                            {importProgress.status}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{importProgress.current} / {importProgress.total}</span>
                        </div>
                        <Progress value={importProgress.total ? (importProgress.current / importProgress.total) * 100 : 0} />
                    </div>
                </DialogContent>
            </Dialog>

            <BulkAssignDialog
                open={showAssignDialog}
                onOpenChange={setShowAssignDialog}
                studentIds={selectedIds}
                onSuccess={() => {
                    setSelectedIds([]);
                    refreshStudents();
                    toast({ title: 'Success', description: 'Assignments updated.' });
                }}
            />

            {/* Edit Dialog */}
            <Dialog open={!!editingStudent} onOpenChange={(open) => !open && setEditingStudent(null)}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Student</DialogTitle>
                        <DialogDescription>Update student details</DialogDescription>
                    </DialogHeader>
                    {editingStudent && (
                        <StudentForm
                            mode="edit"
                            initialData={editingStudent}
                            onSuccess={() => {
                                setEditingStudent(null);
                                refreshStudents();
                            }}
                            onCancel={() => setEditingStudent(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!studentToDelete} onOpenChange={(open) => !open && setStudentToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <Trash2 className="h-5 w-5" />
                            Delete Student
                        </DialogTitle>
                        <DialogDescription>
                            This action cannot be undone. This will permanently delete the student record.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <p className="text-sm text-gray-500">
                            Type <span className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-900">{studentToDelete?.name}/{studentToDelete?.id}</span> to confirm.
                        </p>
                        <Input
                            placeholder="Type Name/ID to confirm"
                            value={deleteConfirmationText}
                            onChange={(e) => setDeleteConfirmationText(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => { setStudentToDelete(null); setDeleteConfirmationText(''); }} disabled={isDeleting}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteStudent}
                            disabled={isDeleting || deleteConfirmationText !== `${studentToDelete?.name}/${studentToDelete?.id}`}
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Delete Student
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <StudentDetailsDialog
                student={viewingStudent}
                open={!!viewingStudent}
                onOpenChange={(open) => !open && setViewingStudent(null)}
            />

            {/* CSV Import Modal */}
            <Dialog open={showCSVImportModal} onOpenChange={setShowCSVImportModal}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Import Students from CSV</DialogTitle>
                        <DialogDescription>
                            Follow these simple steps to import student data from a CSV file.
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
                                        onClick={() => downloadCSVTemplate('student')}
                                        className="bg-blue-600 hover:bg-blue-700"
                                        size="lg"
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Download Student Template
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
                                        Open the downloaded file and fill in the student information. Required fields are marked.
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-medium text-gray-800 mb-2 text-sm">Required Fields:</h4>
                                            <div className="space-y-1">
                                                {getStudentCSVColumns().filter(col => col.required).map(column => (
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
                                                {getStudentCSVColumns().filter(col => !col.required).slice(0, 4).map(column => (
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
                                                                refreshStudents();
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
                                <li>Section defaults to "A" if not specified</li>
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
