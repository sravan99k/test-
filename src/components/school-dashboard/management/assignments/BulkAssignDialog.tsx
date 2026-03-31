import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, UserCheck, ChevronRight, CheckCircle2, Calculator, Settings2, GraduationCap } from 'lucide-react';
import { db, auth } from '@/integrations/firebase';
import { collection, getDocs, doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Teacher {
    id: string;
    name: string;
    count: number;
}

interface BulkAssignDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    studentIds: string[]; // IDs manually selected via checkboxes
    availableStudents?: any[]; // For filtering by grade/section inside modal
    currentAssignments?: Record<string, string[]>; // studentId -> teacherIds[]
    onSuccess: () => void;
    initialAction?: 'assign' | 'unassign' | 'update';
    initialTeacherId?: string;
    initialGrade?: string;
    initialSection?: string;
}

export function BulkAssignDialog({
    open,
    onOpenChange,
    studentIds,
    availableStudents = [],
    currentAssignments = {},
    onSuccess,
    initialAction = 'assign',
    initialTeacherId,
    initialGrade,
    initialSection
}: BulkAssignDialogProps) {
    const { toast } = useToast();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [replaceExisting, setReplaceExisting] = useState(false);

    // Mode: 'selected' (via checkboxes) or 'filtered' (grade/section)
    const [assignMode, setAssignMode] = useState<'selected' | 'filtered'>('selected');
    const [selectedGrades, setSelectedGrades] = useState<string[]>([]);
    const [selectedSections, setSelectedSections] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            loadTeachers();
            setReplaceExisting(false); // Reset on every open
            if (initialTeacherId) setSelectedTeacherId(initialTeacherId);
            if (initialGrade) setSelectedGrades([initialGrade]);
            if (initialSection) setSelectedSections([initialSection]);

            if ((studentIds.length === 0 && availableStudents.length > 0) || initialGrade || initialSection) {
                setAssignMode('filtered');
            } else {
                setAssignMode('selected');
            }
        }
    }, [open, studentIds, initialTeacherId, initialGrade, initialSection]);

    const loadTeachers = async () => {
        try {
            if (!auth.currentUser) return;
            const userDocSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (!userDocSnap.exists()) return;

            const userData = userDocSnap.data();
            const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData;

            const path = (isIndependent || !organizationId)
                ? `users/${adminId}/schools/${schoolId}/teachers`
                : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/teachers`;

            const snap = await getDocs(collection(db, path));
            setTeachers(snap.docs.map(d => ({
                id: d.id,
                name: d.data().name || `${d.data().firstName || ''} ${d.data().lastName || ''}`.trim() || 'Unknown',
                count: d.data().studentCount || 0
            })));
        } catch (error) {
            console.error('Failed to load teachers', error);
        }
    };

    const targetedStudents = useMemo(() => {
        if (assignMode === 'selected') {
            return studentIds;
        }
        return availableStudents
            .filter(s => {
                const gradeMatch = selectedGrades.length === 0 || selectedGrades.includes(s.grade);
                const sectionMatch = selectedSections.length === 0 || selectedSections.includes(s.section);
                return gradeMatch && sectionMatch;
            })
            .map(s => s.id);
    }, [assignMode, studentIds, availableStudents, selectedGrades, selectedSections]);

    const hasExistingAssignments = useMemo(() => {
        return targetedStudents.some(id => (currentAssignments[id] || []).length > 0);
    }, [targetedStudents, currentAssignments]);

    const selectedTeacher = teachers.find(t => t.id === selectedTeacherId);
    const currentCount = selectedTeacher?.count || 0;
    const newCount = currentCount + targetedStudents.length;

    const handleAction = async () => {
        if (!selectedTeacherId) return;
        if (targetedStudents.length === 0) return;

        setLoading(true);
        try {
            if (!auth.currentUser) return;
            const userDocSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const userData = userDocSnap.data()!;
            const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData;

            const schoolPath = (isIndependent || !organizationId)
                ? `users/${adminId}/schools/${schoolId}`
                : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

            const CHUNK_SIZE = 450;
            for (let i = 0; i < targetedStudents.length; i += CHUNK_SIZE) {
                const chunk = targetedStudents.slice(i, i + CHUNK_SIZE);
                const batch = writeBatch(db);

                chunk.forEach(studentId => {
                    // 1. Handle Replacement if enabled
                    if (replaceExisting) {
                        const existingTeacherIds = currentAssignments[studentId] || [];
                        existingTeacherIds.forEach(tid => {
                            // Don't unassign if it's the same teacher we are assigning to
                            if (tid !== selectedTeacherId) {
                                const oldRef = doc(db, `${schoolPath}/assignments/_list/teachers/${tid}/students`, studentId);
                                batch.delete(oldRef);
                            }
                        });
                    }

                    // 2. Add New Assignment
                    const ref = doc(db, `${schoolPath}/assignments/_list/teachers/${selectedTeacherId}/students`, studentId);
                    batch.set(ref, {
                        assignedAt: serverTimestamp(),
                        status: 'active'
                    });
                });

                await batch.commit();
            }

            toast({
                title: 'Operation Complete',
                description: `Successfully processed ${targetedStudents.length} students.`,
            });
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error('Batch error', error);
            toast({ title: 'Batch Failed', description: 'Could not complete the bulk operation.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const grades = Array.from(new Set(availableStudents.map(s => s.grade))).sort((a, b) => parseInt(a) - parseInt(b));
    const sections = Array.from(new Set(availableStudents.filter(s => selectedGrades.includes(s.grade)).map(s => s.section))).sort();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
                <div className="bg-[#0F172A] p-10 text-white relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Users className="h-24 w-24" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-4">
                            Assign Students to Teacher
                        </DialogTitle>
                        <DialogDescription className="text-blue-200/60 font-medium text-base">
                            High-performance control for student management
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-8 bg-white max-h-[70vh] overflow-y-auto">


                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            Step 1: Select Students to Assign
                        </Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setAssignMode('selected')}
                                className={cn(
                                    "p-4 rounded-2xl border-2 transition-all text-left group",
                                    assignMode === 'selected' ? "border-blue-600 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
                                )}
                            >
                                <div className={cn("h-8 w-8 rounded-lg mb-2 flex items-center justify-center transition-colors", assignMode === 'selected' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400")}>
                                    <UserCheck className="h-4 w-4" />
                                </div>
                                <p className={cn("text-xs font-black", assignMode === 'selected' ? "text-blue-900" : "text-gray-500")}>Checked Students</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1">{studentIds.length} are ready</p>
                            </button>
                            <button
                                onClick={() => setAssignMode('filtered')}
                                className={cn(
                                    "p-4 rounded-2xl border-2 transition-all text-left",
                                    assignMode === 'filtered' ? "border-blue-600 bg-blue-50/50" : "border-gray-100 hover:border-gray-200"
                                )}
                            >
                                <div className={cn("h-8 w-8 rounded-lg mb-2 flex items-center justify-center transition-colors", assignMode === 'filtered' ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400")}>
                                    <Users className="h-4 w-4" />
                                </div>
                                <p className={cn("text-xs font-black", assignMode === 'filtered' ? "text-blue-900" : "text-gray-500")}>Whole Class</p>
                                <p className="text-[10px] font-bold text-gray-400 mt-1">Pick Grade & Section</p>
                            </button>
                        </div>
                    </div>

                    {assignMode === 'filtered' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Filter Grade</Label>
                                <div className="flex flex-wrap gap-2">
                                    {grades.map(g => (
                                        <Badge
                                            key={g}
                                            variant={selectedGrades.includes(g) ? "default" : "outline"}
                                            className={cn("cursor-pointer font-black px-4 py-2 rounded-xl transition-all", selectedGrades.includes(g) ? "bg-blue-600" : "hover:bg-gray-50")}
                                            onClick={() => setSelectedGrades(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])}
                                        >
                                            Grade {g}
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            {selectedGrades.length > 0 && (
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-wider text-gray-400">Filter Section</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {sections.map(s => (
                                            <Badge
                                                key={s}
                                                variant={selectedSections.includes(s) ? "secondary" : "outline"}
                                                className={cn("cursor-pointer font-black px-4 py-2 rounded-xl transition-all", selectedSections.includes(s) ? "bg-indigo-100 text-indigo-700" : "hover:bg-gray-100")}
                                                onClick={() => setSelectedSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s])}
                                            >
                                                {s}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            Step 2: Choose Teacher to Assign →
                        </Label>
                        <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                            <SelectTrigger className="h-14 rounded-2xl border-gray-100 bg-gray-50/50 shadow-inner focus:ring-blue-100 transition-all font-bold">
                                <SelectValue placeholder="Select a teacher to assign students..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-100 shadow-2xl p-2">
                                {teachers.map(t => (
                                    <SelectItem key={t.id} value={t.id} className="py-4 px-4 rounded-xl focus:bg-blue-50">
                                        <div className="flex items-center justify-between w-full gap-8">
                                            <span className="font-bold text-gray-800">{t.name}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-12 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-400" style={{ width: `${Math.min(100, (t.count / 40) * 100)}%` }} />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-400">{t.count}</span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {hasExistingAssignments && (
                        <div className="bg-gray-50 p-6 rounded-3xl border border-dashed border-gray-200 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label className="text-sm font-black text-gray-900">Replace Existing Teachers</Label>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Remove students from current assignments</p>
                                </div>
                                <button
                                    onClick={() => setReplaceExisting(!replaceExisting)}
                                    className={cn(
                                        "w-12 h-6 rounded-full transition-all relative p-1",
                                        replaceExisting ? "bg-red-500" : "bg-gray-200"
                                    )}
                                >
                                    <div className={cn(
                                        "h-4 w-4 bg-white rounded-full transition-all flex items-center justify-center",
                                        replaceExisting ? "translate-x-6" : "translate-x-0"
                                    )}>
                                        {replaceExisting && <div className="h-1.5 w-1.5 bg-red-500 rounded-full" />}
                                    </div>
                                </button>
                            </div>
                            {replaceExisting && (
                                <div className="bg-red-50/50 p-3 rounded-xl flex items-center gap-2 border border-red-100 animate-in slide-in-from-top-2">
                                    <Settings2 className="h-3 w-3 text-red-500" />
                                    <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Caution: This will clear all other teacher assignments for these students</p>
                                </div>
                            )}
                        </div>
                    )}

                    {targetedStudents.length > 0 && (
                        <div className="bg-[#F8FAFC] rounded-3xl p-6 border border-gray-100 flex items-center justify-between animate-in zoom-in-95 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-600 font-black text-sm border border-gray-50">
                                    {targetedStudents.length}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Total Students</p>
                                    <p className="text-sm font-black text-blue-900 leading-none mt-1">Ready to Process</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-bold text-gray-300 line-through decoration-gray-400/30">{currentCount}</span>
                                <ChevronRight className="h-5 w-5 text-blue-300" />
                                <span className="text-2xl font-black text-blue-600">
                                    {Math.max(0, newCount)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="bg-gray-50/50 p-8 flex flex-row items-center justify-between backdrop-blur-md">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} className="font-bold text-gray-400 hover:text-gray-900 rounded-2xl h-12 px-6">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAction}
                        disabled={loading || !selectedTeacherId || targetedStudents.length === 0}
                        className="h-14 px-10 rounded-[1.25rem] font-black text-sm uppercase tracking-widest shadow-2xl transition-all gap-4 active:scale-95 bg-blue-600 hover:bg-blue-700 shadow-blue-200"
                    >
                        {loading ? 'Processing...' : (
                            <>
                                <CheckCircle2 className="h-5 w-5" />
                                Assign to Teacher
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
