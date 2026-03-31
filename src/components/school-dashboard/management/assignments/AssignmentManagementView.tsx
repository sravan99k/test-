// Comprehensive Assignment Management View
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Users, UserX, ChevronRight, UserCheck, X,
    TrendingUp, Search, Beaker, Calculator,
    Languages, Book, Binary, Music, Palette, GraduationCap, Settings2,
    Sparkles, ArrowRightLeft, MousePointer2, ArrowRight, CheckCircle2, LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { DataTable, Column } from '../shared/DataTable';
import { collection, getDocs, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db, auth } from '@/integrations/firebase';
import { useToast } from '@/hooks/use-toast';
import { useManagement } from '@/contexts/ManagementContext';
import { Student } from '@/services/schoolDataService';
import { BulkAssignDialog } from './BulkAssignDialog';
import { ReassignDialog } from '../teachers/ReassignDialog';
import { cn } from '@/lib/utils';
import { GradeSectionFilters } from '../shared/GradeSectionFilters';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TeacherSummary {
    id: string;
    name: string;
    subject: string;
    count: number;
    capacity?: number;
}

export function AssignmentManagementView() {
    const { toast } = useToast();
    const {
        students: rawStudents,
        teachers: contextTeachers,
        assignments,
        isLoading: loading,
        refreshAssignments
    } = useManagement();

    const [selectedTeacherId, setSelectedTeacherId] = useState<string | 'unassigned' | 'all'>('unassigned');
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [showAssignDialog, setShowAssignDialog] = useState(false);
    const [dialogAction, setDialogAction] = useState<'assign' | 'unassign' | 'update'>('assign');

    // Shared Filters
    const [gradeFilter, setGradeFilter] = useState('all');
    const [sectionFilter, setSectionFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchingUnassigned, setIsSearchingUnassigned] = useState(false);
    const [teacherSearch, setTeacherSearch] = useState('');
    const [targetSubject, setTargetSubject] = useState<string>('all');
    const [reassignState, setReassignState] = useState<{ open: boolean; teacherId: string; teacherName: string }>({
        open: false,
        teacherId: '',
        teacherName: ''
    });
    const [unassignConfirm, setUnassignConfirm] = useState<{ open: boolean, studentId: string, teacherId: string, studentName: string, teacherName: string }>({ open: false, studentId: '', teacherId: '', studentName: '', teacherName: '' });

    const [filterMode, setFilterMode] = useState<'assigned' | 'waiting'>('waiting');

    // Drag and Drop States
    const [draggingOverId, setDraggingOverId] = useState<string | null>(null);
    const [preFilledData, setPreFilledData] = useState<{ teacherId?: string, grade?: string, section?: string }>({});

    // Unified Teachers with Counts
    const teachers = useMemo(() => {
        return contextTeachers.map(ct => {
            const count = Object.values(assignments).filter(ids => ids.includes(ct.id)).length;
            return {
                id: ct.id,
                name: ct.name,
                subject: ct.subject,
                count: count,
                capacity: 40 // Default capacity
            };
        });
    }, [contextTeachers, assignments]);

    const students = useMemo(() => {
        let list = [...rawStudents];

        // 1. Primary Filters: Grade & Section (The "Where")
        if (gradeFilter !== 'all') list = list.filter(s => s.grade === gradeFilter);
        if (sectionFilter !== 'all') list = list.filter(s => s.section === sectionFilter);

        // 2. Secondary Filter: Search (The "Who")
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            list = list.filter(s => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
        }

        // 3. Conditional Teacher/Mode Logic (The "Status")
        if (selectedTeacherId === 'unassigned') {
            // View: Looking at the Hub or General Unassigned List
            if (filterMode === 'assigned') {
                // User clicked "IN CLASS" - show everyone in the class who is already placed
                list = list.filter(s => (assignments[s.id] || []).length > 0);
            } else if (filterMode === 'waiting') {
                // User clicked "WAITING" - show everyone in the class missing this subject
                list = list.filter(s => {
                    const tids = assignments[s.id] || [];
                    if (targetSubject === 'all') return tids.length === 0;

                    const myTeachers = teachers.filter(t => tids.includes(t.id));
                    return !myTeachers.some(t => t.subject === targetSubject);
                });
            }
            // else if 'all' (ALL KIDS) - we show everyone in the grade/section (already filtered in Step 1)
        } else if (selectedTeacherId !== 'all') {
            // View: Focused on a Specific Teacher - SHOW ONLY THEIR STUDENTS
            list = list.filter(s => (assignments[s.id] || []).includes(selectedTeacherId));
        } else {
            // View: "All Teachers" mode with Assigned/Waiting toggles
            if (filterMode === 'assigned') {
                list = list.filter(s => (assignments[s.id] || []).length > 0);
            } else {
                list = list.filter(s => (assignments[s.id] || []).length === 0);
            }
        }

        return list;
    }, [rawStudents, assignments, selectedTeacherId, gradeFilter, sectionFilter, searchQuery, filterMode, targetSubject, teachers]);

    useEffect(() => {
        // Data is now managed by ManagementContext
    }, []);

    const handleUnassign = (studentId: string, teacherId: string, studentName: string, teacherName: string) => {
        // Show confirmation dialog instead of immediately deleting
        setUnassignConfirm({ open: true, studentId, teacherId, studentName, teacherName });
    };

    const handleConfirmedUnassign = async () => {
        try {
            if (!auth.currentUser) return;
            const { studentId, teacherId } = unassignConfirm;

            const userDocSnap = await getDoc(doc(db, 'users', auth.currentUser.uid));
            const userData = userDocSnap.data()!;
            const { schoolId, parentAdminId: adminId, organizationId, isIndependent } = userData;
            const schoolPath = (isIndependent || !organizationId)
                ? `users/${adminId}/schools/${schoolId}`
                : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

            const batch = writeBatch(db);
            const ref = doc(db, `${schoolPath}/assignments/_list/teachers/${teacherId}/students`, studentId);
            batch.delete(ref);
            await batch.commit();

            toast({ title: 'Success', description: `Student removed from ${unassignConfirm.teacherName}'s class` });
            setUnassignConfirm({ open: false, studentId: '', teacherId: '', studentName: '', teacherName: '' });
            refreshAssignments();
        } catch (e) {
            console.error(e);
            toast({ title: 'Error', description: 'Failed to unassign student', variant: 'destructive' });
        }
    };

    const { filteredTeachers, groupedTeachers } = useMemo(() => {
        const filtered = teachers.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                t.subject.toLowerCase().includes(teacherSearch.toLowerCase());
            const matchesSubject = targetSubject === 'all' || t.subject === targetSubject;
            return matchesSearch && matchesSubject;
        });

        const grouped = filtered.reduce((acc, t) => {
            const subject = t.subject || 'General';
            if (!acc[subject]) acc[subject] = [];
            acc[subject].push(t);
            return acc;
        }, {} as Record<string, TeacherSummary[]>);

        return { filteredTeachers: filtered, groupedTeachers: grouped };
    }, [teachers, teacherSearch, targetSubject]);

    const { gradeCounts, sectionCounts, activeSections, hubData } = useMemo(() => {
        const gCounts: Record<string, number> = {};
        const sCounts: Record<string, number> = {};
        const aSections = new Set<string>();

        // Hub grouping structure: Grade -> Section -> Stats
        const hub: Record<string, Record<string, { total: number, unassigned: number }>> = {};

        rawStudents.forEach(s => { // Changed from allStudents to rawStudents
            const grade = s.grade || 'N/A';
            const sect = s.section || 'N/A';

            // Counts for filters
            gCounts[grade] = (gCounts[grade] || 0) + 1;
            if (s.grade === gradeFilter) {
                sCounts[sect] = (sCounts[sect] || 0) + 1;
                aSections.add(sect);
            }

            // Hub Data
            if (!hub[grade]) hub[grade] = {};
            if (!hub[grade][sect]) hub[grade][sect] = { total: 0, unassigned: 0 };

            hub[grade][sect].total++;
            const tids = assignments[s.id] || [];
            const isUnassigned = targetSubject === 'all'
                ? tids.length === 0
                : !teachers.filter(t => tids.includes(t.id)).some(t => t.subject === targetSubject);

            if (isUnassigned) hub[grade][sect].unassigned++;
        });

        return {
            gradeCounts: gCounts,
            sectionCounts: sCounts,
            activeSections: Array.from(aSections).sort(),
            hubData: hub
        };
    }, [rawStudents, gradeFilter, assignments, targetSubject, teachers]); // Changed from allStudents to rawStudents

    const unassignedCount = useMemo(() => {
        if (targetSubject === 'all') {
            return students.filter(s => (assignments[s.id] || []).length === 0).length;
        }
        return students.filter(s => {
            const tids = assignments[s.id] || [];
            const assignedTeachersForSubject = teachers.filter(t => tids.includes(t.id) && t.subject === targetSubject);
            return assignedTeachersForSubject.length === 0;
        }).length;
    }, [students, assignments, targetSubject, teachers]);

    const sortedStudents = useMemo(() => {
        let list = [...students];
        if (isSearchingUnassigned) {
            list.sort((a, b) => {
                const aAssigned = (assignments[a.id] || []).length > 0;
                const bAssigned = (assignments[b.id] || []).length > 0;
                if (!aAssigned && bAssigned) return -1;
                if (aAssigned && !bAssigned) return 1;
                return 0;
            });
        }
        return list;
    }, [students, assignments, isSearchingUnassigned]);

    const getSubjectIcon = (subject: string) => {
        const s = subject.toLowerCase();
        if (s.includes('sci') || s.includes('bio')) return <Beaker className="h-4 w-4" />;
        if (s.includes('math')) return <Calculator className="h-4 w-4" />;
        if (s.includes('lang') || s.includes('eng')) return <Languages className="h-4 w-4" />;
        if (s.includes('comp')) return <Binary className="h-4 w-4" />;
        if (s.includes('mus')) return <Music className="h-4 w-4" />;
        if (s.includes('art')) return <Palette className="h-4 w-4" />;
        return <Book className="h-4 w-4" />;
    };

    const columns: Column<Student>[] = [
        {
            header: 'ID',
            accessor: (row) => <span className="font-mono text-[10px] text-muted-foreground">{row.id.substring(0, 4).toUpperCase()}</span>,
        },
        { header: 'Student', accessor: 'name', sortable: true },
        { header: 'Grade', accessor: 'grade', sortable: true },
        { header: 'Sec', accessor: 'section', sortable: true },
        {
            header: 'Assigned To',
            accessor: (row) => {
                const assignedTeacherIds = assignments[row.id] || [];
                const assignedTeachers = teachers.filter(t => assignedTeacherIds.includes(t.id));

                return assignedTeachers.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {assignedTeachers.map(teacher => (
                            <div key={teacher.id} className="flex items-center gap-1 group/row">
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 font-semibold py-1 pl-3 pr-1 rounded-xl gap-1.5 flex items-center">
                                    <GraduationCap className="h-3.5 w-3.5" />
                                    {teacher.name}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-5 w-5 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-md transition-all"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleUnassign(row.id, teacher.id, row.name, teacher.name);
                                        }}
                                        title="Remove student from this teacher"
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center gap-1.5 text-gray-400 font-medium text-xs px-2 py-1 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                        <UserX className="h-3 w-3" />
                        Not Assigned
                    </div>
                );
            }
        },
    ];

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const suggestions = useMemo(() => {
        const issues: { type: 'urgent' | 'info', message: string, actionLabel: string, action: () => void }[] = [];

        // 1. Identify grades with many unassigned
        Object.entries(hubData).forEach(([grade, sections]) => {
            const totalUnassigned = Object.values(sections).reduce((acc, s) => acc + s.unassigned, 0);
            if (totalUnassigned > 10) {
                issues.push({
                    type: 'urgent',
                    message: `Grade ${grade} has ${totalUnassigned} students waiting for ${targetSubject === 'all' ? 'teachers' : targetSubject}.`,
                    actionLabel: "Match Now",
                    action: () => { setGradeFilter(grade); setSelectedTeacherId('unassigned'); }
                });
            }
        });

        // 2. Identify available teachers
        const availableTeachers = teachers.filter(t => (t.count / (t.capacity || 40)) < 0.5 && (targetSubject === 'all' || t.subject === targetSubject));
        if (availableTeachers.length > 0 && unassignedCount > 0) {
            issues.push({
                type: 'info',
                message: `${availableTeachers[0].name} has plenty of space for new students.`,
                actionLabel: "Assign to them",
                action: () => { setSelectedTeacherId(availableTeachers[0].id); setShowAssignDialog(true); }
            });
        }

        return issues;
    }, [hubData, teachers, targetSubject, unassignedCount]);

    return (
        <div className="space-y-6">
            {/* Proactive Assistant Bar Removed by User */}


            <div className="flex flex-col md:flex-row h-[calc(100vh-280px)] gap-6">
                <Card id="assignment-teachers-sidebar" className="w-80 border-none shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden ring-1 ring-gray-100 flex flex-col bg-white shrink-0">
                    <CardHeader className="p-4 py-5 border-b bg-gray-50/50 shrink-0">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <CardTitle className="text-base font-black text-gray-900 tracking-tight">Your Teachers</CardTitle>

                        </div>
                        <div className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search teacher by name..."
                                    className="pl-10 h-11 bg-white border-gray-100 rounded-xl text-sm focus:ring-blue-100 transition-all font-medium"
                                    value={teacherSearch}
                                    onChange={(e) => setTeacherSearch(e.target.value)}
                                />
                            </div>

                            {/* Subject Filter Pills */}
                            <div className="flex flex-wrap items-center gap-1.5">
                                <Badge
                                    variant={targetSubject === 'all' ? 'default' : 'outline'}
                                    className={cn(
                                        "cursor-pointer px-3 py-1.5 rounded-lg font-bold transition-all text-[10px]",
                                        targetSubject === 'all' ? "bg-blue-600 text-white shadow-sm" : "hover:bg-gray-50 border-gray-200 text-gray-600"
                                    )}
                                    onClick={() => {
                                        setTargetSubject('all');
                                        setSelectedTeacherId('unassigned');
                                        setIsSearchingUnassigned(false);
                                        setFilterMode('assigned');
                                    }}
                                >
                                    All Subjects
                                </Badge>
                                {Array.from(new Set(teachers.map(t => t.subject))).map(sub => (
                                    <Badge
                                        key={sub}
                                        variant={targetSubject === sub ? 'default' : 'outline'}
                                        className={cn(
                                            "cursor-pointer px-3 py-1.5 rounded-lg font-bold transition-all text-[10px]",
                                            targetSubject === sub ? "bg-blue-600 text-white shadow-sm" : "hover:bg-gray-50 border-gray-200 text-gray-600"
                                        )}
                                        onClick={() => {
                                            setTargetSubject(sub);
                                            setSelectedTeacherId('unassigned');
                                            setIsSearchingUnassigned(false);
                                            setFilterMode('assigned');
                                        }}
                                    >
                                        {sub}
                                    </Badge>
                                ))}
                            </div>

                        </div>
                    </CardHeader>

                    <CardContent className="p-2 flex-1 overflow-hidden bg-white min-h-0">
                        <ScrollArea className="h-full w-full">
                            <div className="space-y-1 px-1 pb-4">
                                {filteredTeachers.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                                            <Users className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-gray-900 mb-1">No Teachers Found</h3>
                                        <p className="text-xs text-gray-500 max-w-[200px]">
                                            {teacherSearch || targetSubject !== 'all'
                                                ? 'Try adjusting your search or filters'
                                                : 'Add teachers to get started with assignments'}
                                        </p>
                                        {(teacherSearch || targetSubject !== 'all') && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-3 text-xs"
                                                onClick={() => {
                                                    setTeacherSearch('');
                                                    setTargetSubject('all');
                                                }}
                                            >
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    (Object.entries(groupedTeachers) as [string, TeacherSummary[]][]).map(([subject, teachersInSubject]) => (
                                        <Accordion type="single" collapsible key={subject} className="w-full">
                                            <AccordionItem value={subject} className="border-none">
                                                <AccordionTrigger className="hover:no-underline py-3 px-3 rounded-2xl hover:bg-gray-50 group [&>svg]:hidden">
                                                    <div className="flex items-center w-full gap-3">
                                                        <div className="h-8 w-8 rounded-xl bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-500 transition-colors">
                                                            {getSubjectIcon(subject)}
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-700 flex-1 text-left">{subject}</span>
                                                        <Badge className="bg-gray-100 text-gray-500 font-bold border-none text-[10px] h-5">
                                                            {teachersInSubject.length}
                                                        </Badge>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="pt-1 pb-2 pl-4 pr-1 space-y-2">
                                                    {teachersInSubject.map(t => (
                                                        <div
                                                            key={t.id}
                                                            onDragOver={(e) => {
                                                                e.preventDefault();
                                                                setDraggingOverId(t.id);
                                                            }}
                                                            onDragLeave={() => setDraggingOverId(null)}
                                                            onDrop={(e) => {
                                                                e.preventDefault();
                                                                setDraggingOverId(null);
                                                                const data = JSON.parse(e.dataTransfer.getData('application/json'));
                                                                if (data.grade && data.section) {
                                                                    setPreFilledData({ teacherId: t.id, grade: data.grade, section: data.section });
                                                                    setDialogAction('assign');
                                                                    setShowAssignDialog(true);
                                                                }
                                                            }}
                                                            onClick={() => {
                                                                if (selectedTeacherId === t.id) {
                                                                    // Toggle Off: Return to Hub
                                                                    setSelectedTeacherId('unassigned');
                                                                    setGradeFilter('all');
                                                                    setSectionFilter('all');
                                                                    setFilterMode('assigned'); // Default to assigned list
                                                                } else {
                                                                    // Toggle On: Select Teacher
                                                                    setSelectedTeacherId(t.id);
                                                                    setFilterMode('assigned'); // Default to showing their current class
                                                                }
                                                                setPreFilledData({});
                                                            }}
                                                            className={cn(
                                                                "cursor-pointer p-4 rounded-2xl border transition-all animate-in fade-in slide-in-from-left-2 group/teacher relative",
                                                                selectedTeacherId === t.id
                                                                    ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-100"
                                                                    : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md",
                                                                draggingOverId === t.id && "ring-4 ring-blue-400 ring-offset-2 scale-105 z-10"
                                                            )}
                                                        >
                                                            {draggingOverId === t.id && (
                                                                <div className="absolute inset-0 bg-blue-600/90 rounded-2xl z-20 flex flex-col items-center justify-center text-white animate-in zoom-in duration-200">
                                                                    <ArrowRightLeft className="h-6 w-6 mb-1 animate-bounce" />
                                                                    <p className="text-[10px] font-black uppercase tracking-widest">Drop to Assign</p>
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col gap-3">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={cn(
                                                                        "h-9 w-9 rounded-full flex items-center justify-center font-black text-[10px]",
                                                                        selectedTeacherId === t.id ? "bg-white/20" : "bg-blue-50 text-blue-600"
                                                                    )}>
                                                                        {getInitials(t.name)}
                                                                    </div>
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="flex items-center justify-between">
                                                                            <p className="text-xs font-bold truncate leading-tight">{t.name}</p>
                                                                            {t.count > 0 && (
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                    className={cn(
                                                                                        "h-7 px-2 rounded-lg gap-1.5 transition-all",
                                                                                        selectedTeacherId === t.id
                                                                                            ? "text-white bg-white/10 hover:bg-white/20 opacity-80"
                                                                                            : "text-blue-600 bg-blue-50/50 hover:bg-blue-50 opacity-40 hover:opacity-100"
                                                                                    )}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setReassignState({ open: true, teacherId: t.id, teacherName: t.name });
                                                                                    }}
                                                                                    title="Move all kids to another teacher (Replace Teacher)"
                                                                                >
                                                                                    <ArrowRightLeft className="h-3.5 w-3.5" />
                                                                                    <span className="text-[9px] font-black tracking-tight">TRANSFER</span>
                                                                                </Button>
                                                                            )}
                                                                        </div>
                                                                        <p className={cn("text-[10px] font-medium opacity-60", selectedTeacherId === t.id ? "text-white" : "text-gray-400")}>
                                                                            {t.subject} Specialist
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider">
                                                                        <span className="opacity-70">Workload</span>
                                                                        <span>{Math.round((t.count / (t.capacity || 40)) * 100)}%</span>
                                                                    </div>
                                                                    <div className="w-full h-1 bg-black/5 rounded-full overflow-hidden">
                                                                        <div
                                                                            className={cn(
                                                                                "h-full transition-all duration-500",
                                                                                selectedTeacherId === t.id ? "bg-white" : "bg-blue-500",
                                                                                (t.count / (t.capacity || 40)) > 0.8 && selectedTeacherId !== t.id ? "bg-orange-500" : ""
                                                                            )}
                                                                            style={{ width: `${Math.min(100, (t.count / (t.capacity || 40)) * 100)}%` }}
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 opacity-70">
                                                                        <Users className="h-3 w-3" />
                                                                        <span className="text-[10px] font-bold">{t.count} / {t.capacity || 40} Assigned</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <div className="flex-1 min-w-0 flex flex-col gap-6">
                    <Card id="assignment-main-content" className="flex-1 border-none shadow-xl shadow-gray-200/50 rounded-2xl overflow-hidden ring-1 ring-gray-100 flex flex-col min-h-0">
                        <CardHeader className="p-4 px-6 border-b flex flex-row items-center justify-between bg-white/50 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                                        {selectedTeacherId === 'all' ? 'Every Student' :
                                            selectedTeacherId === 'unassigned' ? (
                                                isSearchingUnassigned
                                                    ? (targetSubject === 'all' ? 'Unassigned Students' : `${targetSubject} Unassigned Students`)
                                                    : gradeFilter !== 'all' || sectionFilter !== 'all'
                                                        ? (
                                                            <>
                                                                <span>Grade {gradeFilter}</span>
                                                                {sectionFilter !== 'all' && <><span className="text-gray-300">-</span><span>Section {sectionFilter}</span></>
                                                                }
                                                            </>
                                                        )
                                                        : 'Class Directory'
                                            ) : teachers.find(t => t.id === selectedTeacherId)?.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {(selectedTeacherId !== 'unassigned' || isSearchingUnassigned) ? (
                                            <>
                                                <Badge className="bg-blue-50 text-blue-700 border-none font-bold px-2 py-0 text-[10px]">
                                                    {students.length} Total
                                                </Badge>
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Ready to manage</span>
                                            </>
                                        ) : (
                                            <span className="text-[10px] text-gray-500 font-medium">Select a section to view details</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Back Button - shown when drilling into a specific grade/section */}
                                {selectedTeacherId === 'unassigned' && !isSearchingUnassigned && (gradeFilter !== 'all' || sectionFilter !== 'all') && (
                                    <Button
                                        variant="ghost"
                                        className="h-10 px-3 rounded-xl font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all flex items-center gap-1.5 text-xs"
                                        onClick={() => {
                                            setGradeFilter('all');
                                            setSectionFilter('all');
                                        }}
                                    >
                                        <ArrowRight className="h-4 w-4 rotate-180" />
                                        Back to Directory
                                    </Button>
                                )}
                                {/* Hide 'Find Unassigned' button when students are selected */}
                                {selectedTeacherId === 'unassigned' && selectedStudentIds.length === 0 && (
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "h-10 px-4 rounded-xl font-bold border-dashed transition-all flex items-center gap-2 text-xs",
                                            isSearchingUnassigned ? "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200" : "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                                        )}
                                        onClick={() => {
                                            const newState = !isSearchingUnassigned;
                                            setIsSearchingUnassigned(newState);
                                            // Reset pagination or focus if needed
                                            if (newState) {
                                                setSelectedTeacherId('unassigned');
                                                setFilterMode('waiting');
                                                setGradeFilter('all');
                                                setSectionFilter('all');
                                            } else {
                                                setSelectedTeacherId('unassigned');
                                                setFilterMode('assigned');
                                            }
                                        }}
                                    >
                                        {isSearchingUnassigned ? <LayoutGrid className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                                        {isSearchingUnassigned ? "View Class Directory" : "Find Unassigned Students"}
                                        {unassignedCount > 0 && !isSearchingUnassigned && (
                                            <Badge className="bg-orange-500 text-white border-none font-black text-[10px] px-1.5 ml-1 rounded-md">
                                                {unassignedCount}
                                            </Badge>
                                        )}
                                    </Button>
                                )}
                                {selectedTeacherId !== 'all' && selectedTeacherId !== 'unassigned' ? (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => setReassignState({ open: true, teacherId: selectedTeacherId, teacherName: teachers.find(t => t.id === selectedTeacherId)?.name || 'Teacher' })}
                                            className="h-10 px-5 rounded-xl font-bold border-gray-200 hover:bg-gray-50 transition-all flex items-center gap-2 text-xs"
                                        >
                                            <ArrowRightLeft className="h-3.5 w-3.5 text-gray-500" />
                                            Transfer All
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setPreFilledData({ teacherId: selectedTeacherId });
                                                setDialogAction('assign');
                                                setShowAssignDialog(true);
                                            }}
                                            className="h-10 px-5 rounded-xl font-bold shadow-lg shadow-blue-100 bg-blue-600 hover:bg-blue-700 text-white transition-all gap-2 text-xs"
                                        >
                                            <UserCheck className="h-4 w-4" />
                                            Add Students
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        disabled={students.length === 0}
                                        onClick={() => { setDialogAction('assign'); setShowAssignDialog(true); }}
                                        className={cn(
                                            "h-10 px-5 rounded-xl font-bold shadow-lg transition-all gap-2 text-xs",
                                            selectedStudentIds.length > 0
                                                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100 animate-in bounce-in duration-300"
                                                : (gradeFilter === 'all' && selectedStudentIds.length === 0)
                                                    ? "hidden" // Prevent context mismatch in Directory Hub
                                                    : students.length === 0 ? "hidden" : "bg-gray-900 hover:bg-black text-white shadow-gray-200"
                                        )}
                                    >
                                        <UserCheck className="h-4 w-4" />
                                        {selectedStudentIds.length > 0
                                            ? `Assign ${selectedStudentIds.length} Selected`
                                            : (gradeFilter !== 'all' && sectionFilter !== 'all')
                                                ? `Assign Grade ${gradeFilter}-${sectionFilter}`
                                                : `Assign ${students.length} Students`
                                        }
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        {selectedTeacherId === 'unassigned' && gradeFilter === 'all' && !isSearchingUnassigned ? (
                            <CardContent className="p-6 flex-1 overflow-y-auto min-h-0 bg-[#F9FAFB]/50">
                                <div className="space-y-8">
                                    {Object.entries(hubData).sort((a, b) => parseInt(a[0]) - parseInt(b[0])).map(([grade, sections]) => (
                                        <div key={grade} className="space-y-4">
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="h-6 w-1 bg-blue-500 rounded-full" />
                                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Grade {grade}</h3>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                                {Object.entries(sections).sort().map(([section, stats]) => (
                                                    <div
                                                        key={section}
                                                        draggable
                                                        onDragStart={(e) => {
                                                            e.dataTransfer.setData('application/json', JSON.stringify({ grade, section }));
                                                            e.dataTransfer.effectAllowed = 'move';
                                                        }}
                                                        onClick={() => {
                                                            setGradeFilter(grade);
                                                            setSectionFilter(section);
                                                            setIsSearchingUnassigned(false);
                                                            setFilterMode('assigned'); // Default to assigned list
                                                        }}
                                                        className="bg-white p-4 rounded-2xl border border-gray-100 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer group flex items-center justify-between active:scale-95 touch-none"
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-xl bg-blue-50 group-hover:bg-blue-600 flex items-center justify-center font-black text-blue-600 group-hover:text-white transition-colors relative">
                                                                <MousePointer2 className="h-2 w-2 absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
                                                                {section}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-gray-900">Section {section}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{stats.total} Total Students</p>
                                                            </div>
                                                        </div>
                                                        {stats.unassigned > 0 ? (
                                                            <Badge className="bg-orange-500 text-white border-none font-black text-[10px] px-2 py-0.5 animate-pulse">
                                                                {stats.unassigned} Unassigned
                                                            </Badge>
                                                        ) : (
                                                            <Badge className="bg-green-500 text-white border-none font-black text-[10px] px-2 py-0.5">
                                                                Done
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        ) : (
                            <>
                                <div className="px-6 py-3 bg-gray-50/50 border-b flex items-center justify-between animate-in fade-in duration-300">
                                    {/* Only show filter tabs when NOT in global unassigned search mode */}
                                    {/* Simplified Hub View: Global list toggle removed */}
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        Showing {sortedStudents.length} Students
                                    </p>
                                </div>

                                {/* Celebration message: ONLY for global unassigned search with 0 results */}
                                {isSearchingUnassigned && sortedStudents.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                                        <div className="bg-green-100 p-4 rounded-full mb-4">
                                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 mb-1">All Clear!</h3>
                                        <p className="text-gray-500 text-sm font-medium max-w-[250px]">
                                            {targetSubject !== 'all'
                                                ? `Every student in this list has a ${targetSubject} teacher.`
                                                : 'No unassigned students found here. Great job!'}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            onClick={() => setIsSearchingUnassigned(false)}
                                            className="mt-4 text-blue-600 hover:text-blue-700 font-bold text-xs"
                                        >
                                            Return to Directory <ArrowRight className="ml-1 h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <DataTable
                                        data={sortedStudents}
                                        columns={columns}
                                        getRowId={r => r.id}
                                        onSelectionChange={setSelectedStudentIds}
                                        searchable={false}
                                        pageSize={15}
                                        loading={loading}
                                        className="border-none"
                                    />
                                )}
                            </>
                        )}
                    </Card>
                </div>
            </div>

            <BulkAssignDialog
                open={showAssignDialog}
                onOpenChange={setShowAssignDialog}
                studentIds={selectedStudentIds}
                availableStudents={students}
                currentAssignments={assignments}
                initialAction={dialogAction}
                initialTeacherId={preFilledData.teacherId}
                initialGrade={preFilledData.grade}
                initialSection={preFilledData.section}
                onSuccess={() => { setSelectedStudentIds([]); refreshAssignments(); }}
            />
            <ReassignDialog
                open={reassignState.open}
                onOpenChange={(v) => setReassignState(prev => ({ ...prev, open: v }))}
                fromTeacherId={reassignState.teacherId}
                fromTeacherName={reassignState.teacherName}
                mode="reassign"
                onSuccess={() => {
                    refreshAssignments();
                }}
            />

            <AlertDialog open={unassignConfirm.open} onOpenChange={(open) => !open && setUnassignConfirm(prev => ({ ...prev, open: false }))}>
                <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden">
                    <div className="bg-red-50 p-8 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600">
                            <UserX className="h-6 w-6" />
                        </div>
                        <div>
                            <AlertDialogTitle className="text-xl font-black text-red-900 leading-none">Unassign Student?</AlertDialogTitle>
                            <AlertDialogDescription className="text-red-700/60 font-bold text-sm mt-1 uppercase tracking-wider">Removing teacher access</AlertDialogDescription>
                        </div>
                    </div>
                    <div className="p-8 space-y-4">
                        <p className="text-gray-600 font-medium leading-relaxed">
                            Are you sure you want to remove <span className="font-black text-gray-900">{unassignConfirm.studentName}</span> from <span className="font-black text-gray-900">{unassignConfirm.teacherName}</span>'s class?
                        </p>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400 font-bold uppercase tracking-wider">Student</span>
                                <span className="text-gray-900 font-black">{unassignConfirm.studentName}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-400 font-bold uppercase tracking-wider">Current Teacher</span>
                                <span className="text-gray-900 font-black">{unassignConfirm.teacherName}</span>
                            </div>
                        </div>
                    </div>
                    <AlertDialogFooter className="p-8 bg-gray-50/50 flex flex-row items-center gap-3">
                        <AlertDialogCancel className="flex-1 h-12 rounded-xl font-bold border-gray-200 hover:bg-white text-gray-500 hover:text-gray-900 m-0">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmedUnassign}
                            className="flex-1 h-12 rounded-xl font-black bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-100 m-0"
                        >
                            Confirm Removal
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
