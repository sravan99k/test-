import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    updateAcademicYear,
    Student,
    StudentPromotionUpdate
} from "@/services/schoolDataService";
import { useManagement } from '@/contexts/ManagementContext';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Settings, AlertTriangle, Users, ArrowRight, Save, Check, ChevronRight, X, Loader2, Search } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import AcademicYearTransition from './AcademicYearTransition';

type PromotionAction = 'promote' | 'retain' | 'left';

interface StudentState extends Student {
    pendingAction: PromotionAction;
    pendingSection: string;
}

export function AcademicSettingsView() {
    const { user } = useAuth();
    const { students: rawStudents, settings, refreshStudents, refreshData } = useManagement();
    const [year, setYear] = useState<string>('2025-26');
    const [loading, setLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [step, setStep] = useState<'select' | 'review'>('select');
    const { toast } = useToast();
    const [targetYear, setTargetYear] = useState<string>('');
    const [availableYears, setAvailableYears] = useState<string[]>([]);

    // Student Data
    const [students, setStudents] = useState<StudentState[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (settings) {
            setYear(settings.academicYear);

            // Auto-calculate next academic year
            const currentStartYear = parseInt(settings.academicYear.split('-')[0]) || 2025;
            const nextStartYear = currentStartYear + 1;
            const nextEndYear = (nextStartYear + 1).toString().slice(-2);
            const autoTargetYear = `${nextStartYear}-${nextEndYear}`;
            
            setTargetYear(autoTargetYear);
        }
    }, [settings]);

    const fetchAllStudents = async () => {
        // Initialize state from context students
        const initializedStudents = rawStudents.map(s => ({
            ...s,
            pendingAction: 'promote' as PromotionAction,
            pendingSection: s.section
        }));
        setStudents(initializedStudents);
        setStep('review');
    };

    const handleUpdate = async () => {
        if (!targetYear) return;

        try {
            setLoading(true);

            // Prepare payload
            const updates: StudentPromotionUpdate[] = students.map(s => ({
                studentId: s.id,
                action: s.pendingAction,
                newSection: s.pendingSection !== s.section ? s.pendingSection : undefined,
                currentGrade: s.grade
            }));

            const result = await updateAcademicYear(targetYear, updates);
            setYear(targetYear);
            setDialogOpen(false);

            toast({
                title: "Academic Year Updated",
                description: `Updated to ${targetYear}. Promoted: ${result.count}, Left: ${result.leftCount}, Retained: ${result.retainedCount}`,
            });

            refreshData(true);
            setDialogOpen(false);

        } catch (error) {
            console.error(error);
            toast({
                title: "Error",
                description: "Failed to update academic year.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return students;
        const q = searchQuery.toLowerCase();
        return students.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.id.toLowerCase().includes(q)
        );
    }, [students, searchQuery]);

    const groupedStudents = useMemo(() => {
        const groups: Record<string, StudentState[]> = {};
        filteredStudents.forEach(s => {
            const g = s.grade || 'Unknown';
            if (!groups[g]) groups[g] = [];
            groups[g].push(s);
        });
        // Sort grades numerically if possible
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            return a.localeCompare(b);
        });
        return { groups, sortedKeys };
    }, [filteredStudents]);

    const handleBulkGradeAction = (grade: string, action: PromotionAction) => {
        setStudents(prev => prev.map(s =>
            s.grade === grade ? { ...s, pendingAction: action } : s
        ));
        toast({
            title: `Bulk Action Applied`,
            description: `All students in Grade ${grade} marked as ${action}.`,
        });
    };

    const updateStudentState = (id: string, updates: Partial<StudentState>) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    };

    // Reset wizard when closed
    useEffect(() => {
        if (!dialogOpen) {
            setStep('select');
            setStudents([]);
            setSearchQuery('');
        }
    }, [dialogOpen]);

    const normalizedExpectedPhrase = useMemo(() => {
        if (!year || !targetYear) return '';
        return `${year}to${targetYear}`.toLowerCase().replace(/\s+/g, '');
    }, [year, targetYear]);

    const isConfirmationValid = useMemo(() => {
        if (!normalizedExpectedPhrase) return false;
        return confirmText.toLowerCase().replace(/\s+/g, '') === normalizedExpectedPhrase;
    }, [confirmText, normalizedExpectedPhrase]);

    // When the transition is open, show only the transition flow (not the main card below it)
    if (dialogOpen) {
        return (
            <AcademicYearTransition onClose={() => setDialogOpen(false)} />
        );
    }

    return (
        <div className="space-y-6">
            <Card id="school-setup-card" className="shadow-sm border-none bg-white">
                <CardHeader className="pb-6">
                    <CardTitle className="text-xl font-bold text-gray-800">School Setup</CardTitle>
                    <CardDescription>Manage your school's academic timeline and student progression</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Current Academic Year - Clean and Centered */}
                    <div className="text-center">
                        <div className="inline-flex items-center gap-4 p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                            <div className="p-3 bg-blue-50 rounded-xl">
                                <CalendarIcon className="h-8 w-8 text-blue-500" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm text-blue-600 font-semibold mb-1">Current Academic Year</p>
                                <h2 className="text-3xl font-bold text-gray-900">{year}</h2>
                            </div>
                        </div>
                    </div>

                    {/* Academic Management Section */}
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Academic Management</h3>
                            <p className="text-gray-600 mb-6">Manage your school's academic processes and transitions</p>
                        </div>

                        {/* Simple Process Cards - Non-tech friendly */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">Student Promotion</h4>
                                <p className="text-sm text-gray-600">
                                    Move students to next grade
                                </p>
                            </div>

                            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Settings className="h-5 w-5 text-green-600" />
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">Teacher Reassignment</h4>
                                <p className="text-sm text-gray-600">
                                    Assign teachers to new classes
                                </p>
                            </div>

                            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <ArrowRight className="h-5 w-5 text-amber-600" />
                                </div>
                                <h4 className="font-semibold text-gray-800 mb-2">Year Transition</h4>
                                <p className="text-sm text-gray-600">
                                    Start new academic year
                                </p>
                            </div>
                        </div>

                        {/* Action Button - Centered and Clean */}
                        <div className="text-center pt-4">
                            <Button 
                                onClick={() => {
                                    setConfirmText('');
                                    setConfirmOpen(true);
                                }}
                                className="bg-blue-500 hover:bg-blue-600 px-8 py-3 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 gap-2"
                            >
                                <CalendarIcon className="h-5 w-5" />
                                Start New Academic Year
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Alert className="bg-amber-50 border-amber-200 rounded-2xl p-6">
                <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                <div className="ml-4">
                    <AlertTitle className="text-amber-800 font-bold text-lg mb-1">Important Note</AlertTitle>
                    <AlertDescription className="text-amber-700 text-base leading-relaxed">
                        The academic year rollover is a significant event. Once confirmed, all students will be moved to their new grades. Please ensure all final results are uploaded before proceeding.
                    </AlertDescription>
                </div>
            </Alert>

            {/* Confirmation dialog before starting transition */}
            <Dialog open={confirmOpen} onOpenChange={(open) => {
                setConfirmOpen(open);
                if (!open) setConfirmText('');
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-gray-900">Confirm Academic Year Rollover</DialogTitle>
                        <DialogDescription className="text-sm text-gray-600">
                            This action will move all students from the current academic year to the next.
                            Please confirm you want to transition
                            {" "}
                            <span className="font-semibold text-gray-900">{year}</span>
                            {" "}to{" "}
                            <span className="font-semibold text-blue-600">{targetYear}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 mt-2">
                        <p className="text-xs text-gray-500">
                            To confirm, type
                            {" "}
                            <span className="font-semibold text-gray-900">{year} to {targetYear}</span>
                            {" "}
                            in the box below.
                        </p>
                        <Input
                            autoFocus
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder={`${year} to ${targetYear}`}
                            className="text-sm"
                        />
                    </div>

                    <DialogFooter className="flex justify-between mt-4">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setConfirmOpen(false);
                                setConfirmText('');
                            }}
                            className="px-4 h-9 rounded-lg text-sm font-semibold text-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (!isConfirmationValid) return;
                                setConfirmOpen(false);
                                setConfirmText('');
                                setDialogOpen(true);
                            }}
                            disabled={!isConfirmationValid}
                            className="bg-blue-500 hover:bg-blue-600 px-5 h-9 rounded-lg text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Continue
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
