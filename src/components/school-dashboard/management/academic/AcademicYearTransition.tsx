import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { CalendarIcon, Loader2, Search, Check, X, AlertTriangle, RotateCcw, Save, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useManagement } from '@/contexts/ManagementContext';
import { updateAcademicYear, saveTransitionDraft, loadTransitionDraft, deleteTransitionDraft } from '@/services/schoolDataService';
import { toast } from 'sonner';

type PromotionAction = 'promote' | 'retain' | 'left';

interface StudentState {
    id: string;
    name: string;
    grade: string;
    section: string;
    pendingAction: PromotionAction;
    pendingSection: string;
    reviewed: boolean;
}

const AcademicYearTransition: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { students: rawStudents, settings, refreshData } = useManagement();
    const [year, setYear] = useState('');
    const [targetYear, setTargetYear] = useState('');
    const [students, setStudents] = useState<StudentState[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedGrade, setSelectedGrade] = useState<string>('all');
    const [selectedSection, setSelectedSection] = useState<string>('all');
    const [showOnlyUnreviewed, setShowOnlyUnreviewed] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    const reviewedCount = students.filter(s => s.reviewed).length;
    const totalCount = students.length;
    const progressPercent = totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 0;

    useEffect(() => {
        if (settings) {
            setYear(settings.academicYear);
            const currentStartYear = parseInt(settings.academicYear.split('-')[0]) || 2025;
            const nextStartYear = currentStartYear + 1;
            const nextEndYear = (nextStartYear + 1).toString().slice(-2);
            setTargetYear(`${nextStartYear}-${nextEndYear}`);
        }
    }, [settings]);

    const initializeStudents = useCallback(async () => {
        const draft = await loadTransitionDraft();

        if (draft && draft.studentStates) {
            const initializedStudents = rawStudents.map(s => {
                const savedState = draft.studentStates[s.id];
                if (savedState) {
                    return {
                        ...s,
                        pendingAction: savedState.action,
                        pendingSection: savedState.section,
                        reviewed: savedState.reviewed
                    };
                }
                return {
                    ...s,
                    pendingAction: 'promote' as PromotionAction,
                    pendingSection: s.section,
                    reviewed: savedState?.reviewed || false
                };
            });
            setStudents(initializedStudents);
            const resumedReviewed = initializedStudents.filter(s => s.reviewed).length;
            if (resumedReviewed > 0) {
                toast.success(`Resumed previous session: ${resumedReviewed} students reviewed`);
            }
        } else {
            const initializedStudents = rawStudents.map(s => ({
                ...s,
                pendingAction: 'promote' as PromotionAction,
                pendingSection: s.section,
                reviewed: false
            }));
            setStudents(initializedStudents);
        }
    }, [rawStudents]);

    // Auto-save effect
    useEffect(() => {
        const interval = setInterval(() => {
            if (reviewedCount > 0) {
                handleSaveDraft(true);
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [students, reviewedCount]);

    const handleSaveDraft = async (silent = false) => {
        try {
            if (!silent) setIsSaving(true);

            const studentStates: Record<string, any> = {};
            students.forEach(s => {
                if (s.reviewed) {
                    studentStates[s.id] = {
                        studentId: s.id,
                        action: s.pendingAction,
                        section: s.pendingSection,
                        reviewed: s.reviewed
                    };
                }
            });

            await saveTransitionDraft({
                academicYear: year,
                targetYear: targetYear,
                lastUpdated: new Date(),
                studentStates
            });

            setLastSaved(new Date());
            if (!silent) toast.success("Progress saved");
        } catch (error) {
            console.error("Save draft failed", error);
            if (!silent) toast.error("Failed to save progress");
        } finally {
            if (!silent) setIsSaving(false);
        }
    };

    const updateStudentState = (studentId: string, updates: Partial<StudentState>) => {
        setStudents(prev => prev.map(s =>
            s.id === studentId ? { ...s, ...updates, reviewed: true } : s
        ));
    };

    const toggleStudentAction = (studentId: string, action: PromotionAction) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                // If action is already selected AND reviewed, toggle off (un-review) and revert to 'promote'
                if (s.reviewed && s.pendingAction === action) {
                    return { ...s, reviewed: false, pendingAction: 'promote' };
                }
                // Otherwise select and mark reviewed
                return { ...s, pendingAction: action, reviewed: true };
            }
            return s;
        }));
    };

    const handleBulkAction = (grade: string, section: string, action: PromotionAction) => {
        const matchedStudents = students.filter(s => {
            const matchesGrade = grade === 'all' || s.grade === grade;
            const matchesSection = section === 'all' || s.section === section;
            return matchesGrade && matchesSection;
        });

        const count = matchedStudents.length;
        if (count === 0) return;

        const actionText = action === 'promote' ? 'promoted' : action === 'retain' ? 'retained' : 'marked as left';
        const allAlreadySelected = matchedStudents.every(s => s.reviewed && s.pendingAction === action);

        if (allAlreadySelected) {
            if (window.confirm(`Unselect (reset) ${count} students?`)) {
                handleBulkReset(grade, section);
            }
            return;
        }

        let target = grade === 'all' ? `all ${count} students` :
            section === 'all' ? `all ${count} Grade ${grade} students` :
                `all ${count} students in Grade ${grade} - ${section}`;

        if (window.confirm(`Mark ${target} to be ${actionText}?`)) {
            setStudents(prev => prev.map(s => {
                const matchesGrade = grade === 'all' || s.grade === grade;
                const matchesSection = section === 'all' || s.section === section;
                if (matchesGrade && matchesSection) {
                    return {
                        ...s,
                        pendingAction: action,
                        pendingSection: action === 'left' ? '' : s.section,
                        reviewed: true
                    };
                }
                return s;
            }));
            toast.success(`${count} students marked to be ${actionText}`);
        }
    };

    const handleBulkReset = (grade: string, section: string) => {
        const matchedStudents = students.filter(s => {
            const matchesGrade = grade === 'all' || s.grade === grade;
            const matchesSection = section === 'all' || s.section === section;
            return matchesGrade && matchesSection;
        });

        const count = matchedStudents.length;
        if (count === 0) return;
        const hasReviewed = matchedStudents.some(s => s.reviewed);
        if (!hasReviewed) return;

        if (window.confirm(`Reset selections for ${count} students?`)) {
            setStudents(prev => prev.map(s => {
                const matchesGrade = grade === 'all' || s.grade === grade;
                const matchesSection = section === 'all' || s.section === section;
                if (matchesGrade && matchesSection) {
                    return { ...s, reviewed: false, pendingAction: 'promote' };
                }
                return s;
            }));
            toast.info("Selections reset to default");
        }
    };

    const handleFinalizeClick = () => {
        if (reviewedCount === 0) {
            toast.error('Please review at least one student before finalizing');
            return;
        }
        setShowConfirmModal(true);
        setConfirmText('');
    };

    const handleFinalize = async () => {
        if (confirmText !== 'FINALIZE') return;
        setLoading(true);
        try {
            const updates = students.filter(s => s.reviewed).map(s => ({
                studentId: s.id,
                action: s.pendingAction,
                newSection: s.pendingSection !== s.section ? s.pendingSection : undefined,
                currentGrade: s.grade
            }));
            const result = await updateAcademicYear(targetYear, updates);
            await deleteTransitionDraft();
            toast.success(`Academic year finalized! Promoted: ${result.count}`);
            await refreshData(true);
            onClose();
        } catch (error) {
            console.error('Error finalizing:', error);
            toast.error('Failed to finalize academic year');
        } finally {
            setLoading(false);
            setShowConfirmModal(false);
        }
    };

    const stats = useMemo(() => {
        const reviewed = students.filter(s => s.reviewed);
        return {
            total: reviewed.length,
            toPromote: reviewed.filter(s => s.pendingAction === 'promote').length,
            toRetain: reviewed.filter(s => s.pendingAction === 'retain').length,
            toLeft: reviewed.filter(s => s.pendingAction === 'left').length,
            unreviewed: students.length - reviewed.length
        };
    }, [students]);

    const gradeStructure = useMemo(() => {
        const structure: Record<string, { total: number; sections: Set<string> }> = {};
        students.forEach((s) => {
            const grade = s.grade || 'Unknown';
            const section = s.section || 'A';
            if (!structure[grade]) structure[grade] = { total: 0, sections: new Set() };
            structure[grade].total++;
            structure[grade].sections.add(section);
        });
        return structure;
    }, [students]);

    const filteredStudents = useMemo(() => {
        return students.filter((s) => {
            if (showOnlyUnreviewed && s.reviewed) return false;
            if (selectedGrade !== 'all' && s.grade !== selectedGrade) return false;
            if (selectedSection !== 'all' && s.section !== selectedSection) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
            }
            return true;
        });
    }, [students, selectedGrade, selectedSection, searchQuery, showOnlyUnreviewed]);

    const hasReviewedInView = useMemo(() => {
        return filteredStudents.some(s => s.reviewed);
    }, [filteredStudents]);

    useEffect(() => {
        if (students.length === 0 && rawStudents.length > 0) {
            initializeStudents();
        }
    }, [rawStudents.length, initializeStudents, students.length]);

    if (!settings) {
        return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>;
    }

    const selectedGradeData = selectedGrade !== 'all' ? gradeStructure[selectedGrade] : null;
    const selectedSections = selectedGradeData ? Array.from(selectedGradeData.sections).sort() : [];

    return (
        <>
            <div className="fixed inset-0 bg-gray-50/50 backdrop-blur-sm flex flex-col h-screen z-50 overflow-hidden font-sans">
                <div className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full p-4 gap-4 overflow-hidden">

                    {/* Floating Header Card */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-white/20 shadow-sm p-4 shrink-0 z-20">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
                                    <CalendarIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Academic Transition</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                        <span>{year}</span>
                                        <div className="h-1 w-1 rounded-full bg-gray-300" />
                                        <span className="text-blue-600">{targetYear}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 items-center">
                                <div className="hidden md:flex items-center gap-3 mr-4 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{progressPercent}% Complete</span>
                                        <span className="text-[10px] text-gray-500">{reviewedCount}/{totalCount} Students</span>
                                    </div>
                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleSaveDraft(false)}
                                    disabled={isSaving}
                                    variant="outline"
                                    className="gap-2 h-10 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                                >
                                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-gray-500" />}
                                    <span className="hidden sm:inline">Save Draft</span>
                                </Button>
                                <Button
                                    onClick={handleFinalizeClick}
                                    disabled={reviewedCount === 0}
                                    className="bg-gray-900 hover:bg-gray-800 text-white h-10 px-6 shadow-lg shadow-gray-900/10"
                                >
                                    <Check className="h-4 w-4 mr-2" />
                                    Finalize Year
                                </Button>
                                <Button onClick={onClose} variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 text-gray-500">
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Quick Stats Bar */}
                        <div className="flex flex-wrap gap-2 text-sm">
                            <Badge variant="secondary" className="bg-green-50 text-green-700 hover:bg-green-100 border-transparent px-3 py-1.5 h-auto gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                                Promote: {stats.toPromote}
                            </Badge>
                            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-transparent px-3 py-1.5 h-auto gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                                Retain: {stats.toRetain}
                            </Badge>
                            <Badge variant="secondary" className="bg-red-50 text-red-700 hover:bg-red-100 border-transparent px-3 py-1.5 h-auto gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                Left: {stats.toLeft}
                            </Badge>
                            <span className="text-xs text-gray-400 self-center ml-auto">
                                {lastSaved && `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                            </span>
                        </div>
                    </div>

                    {/* Main Content Card */}
                    <div className="flex flex-col flex-1 min-h-0 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                        {/* Intelligent Toolbar */}
                        <div className="p-4 border-b border-gray-100 bg-white z-10 space-y-4">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                                {/* Filters */}
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex items-center space-x-2 bg-gray-50 p-1 rounded-lg border border-gray-200">
                                        <div className="flex items-center space-x-2 px-2">
                                            <Checkbox
                                                id="unreviewed"
                                                checked={showOnlyUnreviewed}
                                                onCheckedChange={(checked) => setShowOnlyUnreviewed(checked as boolean)}
                                                className="border-gray-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                            />
                                            <label htmlFor="unreviewed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600 cursor-pointer select-none">
                                                Unreviewed Only
                                            </label>
                                        </div>
                                    </div>

                                    <div className="h-8 w-px bg-gray-200 hidden lg:block" />

                                    <div className="flex items-center gap-2">
                                        <Select value={selectedGrade} onValueChange={(val) => { setSelectedGrade(val); setSelectedSection('all'); }}>
                                            <SelectTrigger className="w-[140px] h-9 bg-white border-gray-200">
                                                <SelectValue placeholder="Grade" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Grades</SelectItem>
                                                {Object.keys(gradeStructure).sort((a, b) => parseInt(a) - parseInt(b)).map(g => (
                                                    <SelectItem key={g} value={g}>Grade {g} ({gradeStructure[g].total})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {selectedGrade !== 'all' && (
                                            <Select value={selectedSection} onValueChange={setSelectedSection}>
                                                <SelectTrigger className="w-[120px] h-9 bg-white border-gray-200 animate-in fade-in zoom-in-95">
                                                    <SelectValue placeholder="Section" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Sections</SelectItem>
                                                    {selectedSections.map(s => (
                                                        <SelectItem key={s} value={s}>Section {s}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative w-full lg:w-72">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    <Input
                                        placeholder="Search by name or ID..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 h-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Bulk Actions with Visual Groups */}
                            <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-1 no-scrollbar">
                                <div className="flex items-center gap-1 p-1 bg-gray-50 rounded-lg border border-gray-100 mr-2">
                                    <Badge variant="outline" className="text-gray-500 border-none bg-transparent font-medium">Bulk Actions</Badge>
                                </div>
                                <Button size="sm" onClick={() => handleBulkAction(selectedGrade, selectedSection, 'promote')} className="h-8 bg-green-600 hover:bg-green-700 text-white border-0 shadow-sm">
                                    Promote All
                                </Button>
                                <Button size="sm" onClick={() => handleBulkAction(selectedGrade, selectedSection, 'retain')} className="h-8 bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-sm">
                                    Retain All
                                </Button>
                                <Button size="sm" onClick={() => handleBulkAction(selectedGrade, selectedSection, 'left')} className="h-8 bg-red-600 hover:bg-red-700 text-white border-0 shadow-sm">
                                    Mark Left
                                </Button>

                                {hasReviewedInView && (
                                    <>
                                        <div className="h-6 w-px bg-gray-200 mx-2" />
                                        <Button size="sm" variant="ghost" onClick={() => handleBulkReset(selectedGrade, selectedSection)} className="h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                                            <RotateCcw className="h-3.5 w-3.5 mr-2" />
                                            Reset Selection
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Data Grid */}
                        <div className="flex-1 overflow-auto bg-gray-50/50">
                            <table className="w-full border-collapse">
                                <thead className="bg-white sticky top-0 z-10 shadow-sm/5">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/95 backdrop-blur border-b border-gray-100">Student</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/95 backdrop-blur border-b border-gray-100 w-32">Current</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/95 backdrop-blur border-b border-gray-100 w-80">Action</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider bg-white/95 backdrop-blur border-b border-gray-100 w-32">New Sec</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredStudents.length > 0 ? (
                                        filteredStudents.map((student) => (
                                            <tr
                                                key={student.id}
                                                className={`group transition-all duration-200 hover:bg-gray-50 ${student.reviewed ? 'bg-blue-50/30' : ''}`}
                                            >
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${student.reviewed
                                                                ? 'bg-white border-blue-200 text-blue-700 shadow-sm'
                                                                : 'bg-gray-100 border-gray-200 text-gray-500'
                                                            }`}>
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900 text-sm">{student.name}</div>
                                                            <div className="text-xs text-gray-400 font-mono">ID: {student.id}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <Badge variant="outline" className="text-gray-600 bg-gray-50 border-gray-200 font-mono text-xs">
                                                        {student.grade} - {student.section}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="flex gap-1 p-1 bg-gray-100/50 rounded-lg w-fit">
                                                        <button
                                                            onClick={() => toggleStudentAction(student.id, 'promote')}
                                                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${student.pendingAction === 'promote' && student.reviewed
                                                                    ? 'bg-green-500 text-white shadow-sm ring-1 ring-green-600'
                                                                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                                                                }`}
                                                        >
                                                            Promote
                                                        </button>
                                                        <button
                                                            onClick={() => toggleStudentAction(student.id, 'retain')}
                                                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${student.pendingAction === 'retain' && student.reviewed
                                                                    ? 'bg-yellow-500 text-white shadow-sm ring-1 ring-yellow-600'
                                                                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                                                                }`}
                                                        >
                                                            Retain
                                                        </button>
                                                        <button
                                                            onClick={() => toggleStudentAction(student.id, 'left')}
                                                            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-200 ${student.pendingAction === 'left' && student.reviewed
                                                                    ? 'bg-red-500 text-white shadow-sm ring-1 ring-red-600'
                                                                    : 'text-gray-600 hover:bg-white hover:shadow-sm'
                                                                }`}
                                                        >
                                                            Left
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    {student.pendingAction !== 'left' ? (
                                                        <input
                                                            type="text"
                                                            maxLength={1}
                                                            value={student.pendingSection}
                                                            onChange={(e) => {
                                                                const value = e.target.value.toUpperCase();
                                                                if (/^[A-Z]?$/.test(value)) updateStudentState(student.id, { pendingSection: value });
                                                            }}
                                                            className={`w-12 text-center text-sm font-bold border rounded-md py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${student.reviewed ? 'border-blue-200 bg-white shadow-sm' : 'border-gray-200 bg-gray-50'
                                                                }`}
                                                            placeholder={student.section}
                                                        />
                                                    ) : (
                                                        <span className="w-12 block text-center text-gray-300">-</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="h-64 text-center">
                                                <div className="flex flex-col items-center justify-center p-8 bg-gray-50/50 rounded-xl max-w-sm mx-auto border border-dashed border-gray-200 mt-12">
                                                    <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                                                        <Search className="h-6 w-6 text-gray-300" />
                                                    </div>
                                                    <h3 className="text-sm font-semibold text-gray-900">No students found</h3>
                                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                                        {showOnlyUnreviewed
                                                            ? "Great job! You've reviewed all students in this view."
                                                            : "Try adjusting your search or filters."}
                                                    </p>
                                                    {showOnlyUnreviewed && (
                                                        <Button variant="outline" size="sm" onClick={() => setShowOnlyUnreviewed(false)} className="mt-4">
                                                            Show All Students
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-100">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-start gap-4">
                            <div className="p-3 bg-red-100 rounded-full shrink-0">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Finalize Transition?</h3>
                                <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                    You are about to move students to <strong>{targetYear}</strong>. This will permanently update student records.
                                </p>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
                                    <div className="text-2xl font-bold text-green-700">{stats.toPromote}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-green-800/60 mt-1">Promoting</div>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 text-center">
                                    <div className="text-2xl font-bold text-yellow-700">{stats.toRetain}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-yellow-800/60 mt-1">Retaining</div>
                                </div>
                                <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                                    <div className="text-2xl font-bold text-red-700">{stats.toLeft}</div>
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-red-800/60 mt-1">Marking Left</div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                    Type <span className="text-red-600 select-all">FINALIZE</span> to confirm
                                </label>
                                <Input
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    className="font-mono uppercase placeholder:normal-case border-gray-300 focus:border-red-500 focus:ring-red-500/20"
                                    placeholder="Type FINALIZE"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" onClick={() => setShowConfirmModal(false)} className="flex-1 h-11 border-gray-200">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleFinalize}
                                    disabled={confirmText !== 'FINALIZE' || loading}
                                    className="flex-1 h-11 bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 disabled:opacity-50 disabled:shadow-none"
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm & Finalize'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AcademicYearTransition;
