import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db, auth } from '@/integrations/firebase';
import { doc, getDoc, onSnapshot, collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import {
    Heart,
    Brain,
    TrendingUp,
    Activity,
    Phone,
    FileText,
    AlertTriangle,
    CheckCircle,
    Plus,
    LayoutGrid,
    TrendingDown,
    ChevronLeft,
    Calendar,
    ShieldCheck,
    Sparkles,
    X,
    MessageSquare,
    ChevronRight,
    ChevronDown,
    Target,
    Zap,
    Search
} from "lucide-react";
import { format } from "date-fns";
import { TeacherStudent, Note } from "@/services/teacherDataService";
import recommendationsData from "@/data/recommendations.json";
import teacherProtocols from "@/components/domains-and-questions/metadata/teacherProtocols.json";

interface Recommendation {
    domain: string;
    code: string;
    recommendations: {
        low: string;
        medium: string;
        high: string;
    };
}

interface StudentDetailViewProps {
    student: TeacherStudent;
    onClose: () => void;
}

const StudentDetailView: React.FC<StudentDetailViewProps> = ({ student, onClose }) => {
    const { toast } = useToast();
    const [studentData, setStudentData] = useState<any>(null);
    const [latestAssessment, setLatestAssessment] = useState<any>(null);
    const [allAssessments, setAllAssessments] = useState<any[]>([]);
    const [firestoreNotes, setFirestoreNotes] = useState<Note[]>([]);
    const [hasCounsellor, setHasCounsellor] = useState(true);
    const [supportAlerts, setSupportAlerts] = useState<any[]>([]);
    const [visiblePrioritiesCount, setVisiblePrioritiesCount] = useState(3);

    // New interaction states
    const [showContactDialog, setShowContactDialog] = useState(false);
    const [showObsDialog, setShowObsDialog] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'matrix' | 'support' | 'history'>('overview');
    const [newNote, setNewNote] = useState("");
    const [selectedObsCategory, setSelectedObsCategory] = useState("general");
    const [selectedMatrixPhase, setSelectedMatrixPhase] = useState<number>(student.currentPhaseId || 1);
    const [selectedMatrixAssessment, setSelectedMatrixAssessment] = useState<string>('Current');

    // --- Reset Logic: Wellbeing starts fresh every Phase, Engagement fresh every Assessment ---
    const wellbeingScoreValue = useMemo(() => {
        // Find latest assessment in the CURRENT phase of the student
        const currentPhaseId = student.currentPhaseId || 1;
        const currentPhaseAssessments = allAssessments.filter(a => a.phaseId === currentPhaseId);
        if (currentPhaseAssessments.length > 0) {
            return Math.round(100 - (currentPhaseAssessments[0].riskPercentage || 0));
        }
        return student.wellbeingScore || 100;
    }, [allAssessments, student.currentPhaseId, student.wellbeingScore]);

    const engagementValue = studentData?.engagementRate ?? student.engagementRate ?? 0;

    const interpretation = useMemo(() => {
        if (wellbeingScoreValue < 45 && engagementValue > 70)
            return { label: "High Effort, High Distress", color: "text-rose-600", desc: "Student is trying hard but struggling emotionally." };
        if (wellbeingScoreValue > 75 && engagementValue < 40)
            return { label: "Stable but Disengaged", color: "text-amber-600", desc: "Student is mentally fine but lost interest in school tasks." };
        if (wellbeingScoreValue < 40 && engagementValue < 40)
            return { label: "Critical Shutdown", color: "text-red-700", desc: "Immediate withdrawal from both work and wellbeing." };
        return { label: "Expected Trajectory", color: "text-emerald-600", desc: "Wellbeing and engagement are currently aligned." };
    }, [wellbeingScoreValue, engagementValue]);

    const phaseAverage = useMemo(() => {
        const currentPhaseAssessments = allAssessments.filter(a => a.phaseId === (student.currentPhaseId || 1));
        if (currentPhaseAssessments.length === 0) return wellbeingScoreValue;
        const sum = currentPhaseAssessments.reduce((acc, a) => acc + (100 - (a.riskPercentage || 0)), 0);
        return Math.round(sum / currentPhaseAssessments.length);
    }, [allAssessments, student.currentPhaseId, wellbeingScoreValue]);

    const prevPhaseAverage = useMemo(() => {
        const prevPhaseId = (student.currentPhaseId || 1) - 1;
        if (prevPhaseId < 1) return null;
        const prevAssessments = allAssessments.filter(a => a.phaseId === prevPhaseId);
        if (prevAssessments.length === 0) return 70; // Baseline assumption
        const sum = prevAssessments.reduce((acc, a) => acc + (100 - (a.riskPercentage || 0)), 0);
        return Math.round(sum / prevAssessments.length);
    }, [allAssessments, student.currentPhaseId]);

    const phaseDelta = prevPhaseAverage ? phaseAverage - prevPhaseAverage : 0;

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!auth.currentUser || !student.uid) return;
            try {
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (!userDocSnap.exists()) return;
                const userData = userDocSnap.data();
                const path = userData.isIndependent
                    ? `users/${userData.parentAdminId}/schools/${userData.schoolId}`
                    : `users/${userData.parentAdminId}/organizations/${userData.organizationId}/schools/${userData.schoolId}`;

                const studentDocRef = doc(db, `${path}/students`, student.uid);
                onSnapshot(studentDocRef, (docSnap) => {
                    if (docSnap.exists()) setStudentData(docSnap.data());
                });

                const assessmentsQuery = query(collection(db, `${path}/students/${student.uid}/assessments`), orderBy('assessmentDate', 'desc'));
                onSnapshot(assessmentsQuery, (snapshot) => {
                    if (!snapshot.empty) {
                        setLatestAssessment(snapshot.docs[0].data());
                        setAllAssessments(snapshot.docs.map(d => ({ ...d.data(), id: d.id })));
                    }
                });

                const notesQuery = query(collection(db, `${path}/students/${student.uid}/notes`), orderBy('timestamp', 'desc'));
                onSnapshot(notesQuery, (snapshot) => {
                    setFirestoreNotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Note)));
                });

                const triggersQuery = query(collection(db, `${path}/students/${student.uid}/chatTriggers`), orderBy('timestamp', 'desc'));
                onSnapshot(triggersQuery, (snapshot) => {
                    setSupportAlerts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
                });
            } catch (error) {
                console.error('Error:', error);
            }
        };
        fetchStudentData();
    }, [student.uid]);






    const getPhaseDomains = (phaseId: number) => {
        const allDomains = recommendationsData as Recommendation[];
        if (phaseId === 1) return allDomains.slice(0, 8);
        if (phaseId === 2) return allDomains.slice(4, 14);
        return allDomains.slice(0, 20);
    };

    const mockDomainScores = useMemo(() => {
        if (selectedMatrixAssessment === 'Current' && latestAssessment) return latestAssessment.domainScores || {};
        const target = allAssessments.find(a => {
            if (selectedMatrixAssessment === 'Baseline') return a.assessmentType === 'baseline';
            if (selectedMatrixAssessment === 'Major 1') return a.assessmentName === 'Major 1';
            return false;
        });
        return target?.domainScores || (latestAssessment?.domainScores || {
            'S-SEL': 34, 'A-CON': 38, 'P-REL': 64, 'A-SUP': 42,
            'M-EMO': 88, 'B-SAF': 55, 'H-SAF': 35, 'S-HAR': 45
        });
    }, [selectedMatrixAssessment, latestAssessment, allAssessments]);

    const phaseDomains = useMemo(() => {
        const base = getPhaseDomains(selectedMatrixPhase);
        const criticalExtras = (recommendationsData as Recommendation[]).filter(rec => {
            const score = mockDomainScores[rec.code];
            const isCritical = score !== undefined && score < 45;
            const isAlreadyListed = base.some(b => b.code === rec.code);
            return isCritical && !isAlreadyListed;
        });
        return [...base, ...criticalExtras];
    }, [selectedMatrixPhase, mockDomainScores]);

    // Dynamic Filtering logic for Matrix Tab Progresion
    const visiblePhases = useMemo(() => {
        // Only show phases the student has actually entered or completed
        const currentPhase = student.currentPhaseId || 1;
        const phases = [1];

        if (currentPhase >= 2) phases.push(2);
        if (currentPhase >= 3) phases.push(3);
        if (currentPhase >= 4) phases.push(4);

        return phases;
    }, [student.currentPhaseId]);

    // Helper to get triggered domains for a specific milestone for sidebar roadmap
    const getTriggersForMilestone = (milestoneName: string) => {
        const assessment = allAssessments.find(a =>
            (a.assessmentName?.toLowerCase() === milestoneName.toLowerCase()) ||
            (a.assessmentType?.toLowerCase() === milestoneName.toLowerCase())
        );
        if (!assessment || !assessment.domainScores) return [];
        return Object.entries(assessment.domainScores)
            .filter(([_, score]) => (score as number) < 65)
            .map(([code]) => code);
    };

    const assessmentsInSelectedPhase = useMemo(() => {
        // Only show assessments that strictly exist in history
        const list = allAssessments
            .filter(a => a.phaseId === selectedMatrixPhase)
            .sort((a, b) => (a.assessmentDate?.toMillis?.() || 0) - (b.assessmentDate?.toMillis?.() || 0));

        const labels = list.map(a => a.assessmentName || a.assessmentType || 'Assessment');

        // If no assessments found for this phase (e.g. just started), 
        // fallback to just 'Baseline' as a placeholder or empty if strictly nothing
        if (labels.length === 0) return ['Baseline'];

        return labels;
    }, [allAssessments, selectedMatrixPhase]);

    // Dynamic Trend & Persistence Tracking
    const domainAnalytics = useMemo(() => {
        if (allAssessments.length < 2) return {};

        const current = allAssessments[0]?.domainScores || mockDomainScores;
        const previous = allAssessments[1]?.domainScores || {};

        const analytics: Record<string, { trend: 'up' | 'down' | 'stable', persistent: boolean }> = {};

        Object.keys(current).forEach(code => {
            const currVal = current[code];
            const prevVal = previous[code];

            if (prevVal === undefined) {
                analytics[code] = { trend: 'stable', persistent: false };
            } else {
                analytics[code] = {
                    trend: currVal > prevVal + 2 ? 'up' : currVal < prevVal - 2 ? 'down' : 'stable',
                    persistent: currVal < 50 && prevVal < 50 // Triggered in both assessments
                };
            }
        });
        return analytics;
    }, [allAssessments, mockDomainScores]);

    // Link to the centralized Teacher Protocols Metadata (Indian Context)
    const domainMetadataMap = teacherProtocols as Record<string, { indicators: string[], context: string, actions: { low: string[], medium: string[], high: string[] } }>;

    const activeRecommendations = useMemo(() => {
        const focusItems = phaseDomains
            .filter(rec => {
                const score = mockDomainScores[rec.code];
                return score !== undefined && score < 65;
            })
            .sort((a, b) => (mockDomainScores[a.code] || 0) - (mockDomainScores[b.code] || 0));

        return focusItems.map(rec => {
            const score = mockDomainScores[rec.code];
            const analytics = domainAnalytics[rec.code] || { trend: 'stable', persistent: false };
            const protocol = domainMetadataMap[rec.code];

            let level: 'low' | 'medium' | 'high' = 'low';
            if (score < 40) level = 'high';
            else if (score < 60) level = 'medium';

            let dynamicActions = protocol?.actions[level] || [rec.recommendations[level]];

            // --- Counselor Logic: If NO counselor in school, teacher must escalate to Principal or Lead ---
            if (!hasCounsellor && level === 'high') {
                dynamicActions = ["No counselor in school: Escalate to Principal immediately", ...dynamicActions.filter(a => !a.toLowerCase().includes('counselor'))];
            }

            return {
                ...rec,
                currentLevel: level,
                action: Array.isArray(dynamicActions) ? dynamicActions.join('; ') : dynamicActions,
                score,
                ...analytics,
                indicators: protocol?.indicators || ["General behavior changes"],
                context: protocol?.context || "Standard development monitoring"
            };
        });
    }, [phaseDomains, mockDomainScores, domainAnalytics]);

    const strengths = useMemo(() => {
        return (recommendationsData as Recommendation[])
            .filter(rec => (mockDomainScores[rec.code] || 0) > 75)
            .sort((a, b) => (mockDomainScores[b.code] || 0) - (mockDomainScores[a.code] || 0));
    }, [mockDomainScores]);

    // All domains needing attention for the summary badge view
    const domainsRequiringAttention = useMemo(() => {
        return (recommendationsData as Recommendation[])
            .filter(rec => (mockDomainScores[rec.code] || 100) < 65)
            .sort((a, b) => (mockDomainScores[a.code] || 0) - (mockDomainScores[b.code] || 0));
    }, [mockDomainScores]);

    // Milestone Logic
    const assessmentsCompleted = allAssessments.length || 1;
    const totalMilestones = 10;
    const completionPercent = (assessmentsCompleted / totalMilestones) * 100;

    const handleExport = () => {
        toast({ title: "Report Engine", description: "Compiling Wellbeing Performance PDF for Export..." });
        setTimeout(() => {
            window.print();
        }, 1500);
    };

    const handleNewObservation = async () => {
        if (!newNote.trim()) return;
        try {
            const userDocRef = doc(db, 'users', auth.currentUser!.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) return;
            const userData = userDocSnap.data();
            const path = userData.isIndependent
                ? `users/${userData.parentAdminId}/schools/${userData.schoolId}`
                : `users/${userData.parentAdminId}/organizations/${userData.organizationId}/schools/${userData.schoolId}`;

            await addDoc(collection(db, `${path}/students/${student.uid}/notes`), {
                content: newNote,
                author: auth.currentUser!.email || 'Teacher',
                category: selectedObsCategory,
                phaseId: student.currentPhaseId || 1,
                assessmentId: latestAssessment?.id || 'pending',
                timestamp: serverTimestamp()
            });

            setNewNote("");
            setShowObsDialog(false);
            toast({ title: "Observation Logged", description: "Successfully stored in student evidence history." });
        } catch (e) {
            console.error(e);
            toast({ title: "Error", description: "Failed to log observation.", variant: "destructive" });
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogPortal>
                <DialogOverlay className="bg-slate-900/40 backdrop-blur-md" />
                <DialogContent className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-[95vw] max-w-[1400px] h-[92vh] bg-[#F8FAFC] border-none shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] rounded-[40px] overflow-hidden flex flex-col p-0 focus:outline-none">

                    {/* Premium Header */}
                    <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 px-12 py-8 flex items-center justify-between gap-6 shrink-0 z-10">
                        <div className="flex items-center gap-10">
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-[32px] bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shadow-2xl transition-transform duration-500 group-hover:scale-105">
                                    {student.avatar ? (
                                        <img src={student.avatar} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-3xl font-black text-slate-300 uppercase tracking-tighter">{student.name.split(' ').map(n => n[0]).join('')}</span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1 border-l border-slate-200 pl-8">
                                <div className="flex items-center gap-3">
                                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-heading">{student.name}</h2>
                                    <Badge variant="outline" className="text-slate-500 text-[10px] font-medium px-2 py-0.5 rounded-md tracking-wide">ID: {student.uid.slice(0, 8)}</Badge>
                                </div>
                                <div className="flex items-center gap-6 text-slate-500 text-xs font-medium">
                                    <span className="flex items-center gap-2">
                                        Grade {student.class}{student.fullProfile?.section ? `-${student.fullProfile.section}` : ''}
                                    </span>
                                    <span className="flex items-center gap-2 text-blue-600">
                                        Phase {student.currentPhaseId || 1} Baseline
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="flex flex-col items-end px-8 border-r border-slate-200/60">


                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    className="h-14 px-8 font-black text-slate-700 bg-white border-slate-200 hover:bg-slate-50 text-[11px] uppercase tracking-widest transition-all rounded-[20px] shadow-sm"
                                    onClick={() => setShowContactDialog(true)}
                                >
                                    <Phone className="h-4 w-4 mr-3" /> Contact
                                </Button>
                                <Button
                                    className="h-14 px-10 font-black text-white bg-slate-900 hover:bg-black text-[11px] uppercase tracking-widest transition-all shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] rounded-[20px]"
                                    onClick={() => setShowObsDialog(true)}
                                >
                                    <Plus className="h-5 w-5 mr-3" /> New Observation
                                </Button>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-12 w-12 rounded-full hover:bg-slate-100 ml-4 border border-transparent hover:border-slate-200"
                            >
                                <X className="h-6 w-6 text-slate-400" />
                            </Button>
                        </div>
                    </div>

                    {/* Premium Tab Navigation */}
                    <div className="bg-white/40 backdrop-blur-md px-12 py-2 flex items-center gap-2 border-b border-slate-100/60 shrink-0">
                        {[
                            { id: 'overview', label: 'Overview', icon: LayoutGrid },
                            { id: 'matrix', label: 'Assessment Matrix', icon: Brain },
                            { id: 'support', label: 'Support & Evidence', icon: ShieldCheck }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-6 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 group ${activeTab === tab.id ? 'bg-white shadow-sm border border-slate-100' : 'hover:bg-white/50'}`}
                            >
                                <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                <span className={`text-sm font-medium tracking-tight ${activeTab === tab.id ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-700'}`}>
                                    {tab.label}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto bg-[#F8FAFC]">
                        <div className="max-w-[1400px] mx-auto p-12 flex flex-col lg:flex-row gap-12">

                            {/* Main Canvas */}
                            <div className="flex-1 min-w-0 space-y-12">

                                {activeTab === 'overview' && (
                                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        {/* Vital Metrics Section */}
                                        <div className="space-y-6">
                                            {/* New Assessment Header */}
                                            <div className="flex items-end justify-between border-b border-slate-100 pb-4">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Assessment Cycle</p>
                                                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                                        {latestAssessment?.assessmentName || 'Latest Assessment'} <span className="text-slate-300">/</span> <span className="text-blue-600">Phase {student.currentPhaseId || 1}</span>
                                                    </h3>
                                                </div>
                                                {latestAssessment?.assessmentDate && (
                                                    <Badge variant="secondary" className="bg-slate-50 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                                                        Verified {format(latestAssessment.assessmentDate.toDate(), 'MMM dd, yyyy')}
                                                    </Badge>
                                                )}
                                            </div>

                                            {/* Vital Metrics Section - Compact */}
                                            <div className="grid grid-cols-2 gap-6">
                                                {[
                                                    { label: 'Wellbeing Score', value: wellbeingScoreValue, color: 'text-indigo-600', reset: 'Every Phase' },
                                                    { label: 'Engagement Score', value: engagementValue, color: 'text-slate-900', reset: 'Every Phase' }
                                                ].map((stat, i) => (
                                                    <div key={i} className="bg-white rounded-[24px] p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 relative overflow-hidden group">
                                                        <div className="relative space-y-2">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                                                <Badge variant="outline" className="text-[8px] border-slate-100 text-slate-300">Resets {stat.reset}</Badge>
                                                            </div>
                                                            <div className="flex items-baseline gap-3">
                                                                <span className={`text-3xl font-black tracking-tight ${stat.color}`}>{stat.value}%</span>
                                                            </div>
                                                            <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                                                                <div
                                                                    className={`h-full ${stat.color === 'text-indigo-600' ? 'bg-indigo-500' : 'bg-slate-900'} transition-all duration-1000 ease-out`}
                                                                    style={{ width: `${stat.value}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Interpretation Banner */}
                                            <div className="bg-white border border-slate-100 rounded-[30px] p-6 flex items-center gap-6 shadow-sm">
                                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 bg-slate-50 ${interpretation.color}`}>
                                                    <Activity className="h-6 w-6" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className={`text-xs font-black uppercase tracking-tight ${interpretation.color}`}>{interpretation.label}</p>
                                                    <p className="text-sm font-medium text-slate-500">{interpretation.desc}</p>
                                                </div>
                                            </div>
                                        </div>


                                        {/* Clinical Support Stream */}
                                        <div className="space-y-10">
                                            <div className="flex items-center gap-4 px-2">
                                                <div className="h-8 w-1 bg-slate-900 rounded-full" />
                                                <div className="space-y-0.5">
                                                    <h3 className="text-lg font-bold text-slate-800 tracking-tight">Active Support Priorities</h3>
                                                </div>
                                            </div>

                                            <div className="space-y-8">
                                                {activeRecommendations.slice(0, visiblePrioritiesCount).map((rec, i) => (
                                                    <div key={i} className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative group transition-all duration-500 overflow-hidden">
                                                        {/* Background Grade Indicator */}
                                                        <div className="absolute top-0 right-0 p-8">
                                                            <div className={`h-16 w-16 rounded-3xl flex flex-col items-center justify-center font-black bg-slate-50 border border-slate-100 shadow-sm ${rec.score < 45 ? 'text-red-600' : 'text-orange-600'}`}>
                                                                <span className="text-[10px] text-slate-300 uppercase leading-none mb-1">Score</span>
                                                                <span className="text-xl leading-none">{rec.score}%</span>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">#{i + 1}</div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-3">
                                                                        <h4 className={`text-2xl font-black uppercase tracking-tight ${rec.score < 45 ? 'text-rose-600' : rec.score < 65 ? 'text-amber-600' : 'text-emerald-600'}`}>{rec.domain}</h4>
                                                                    </div>
                                                                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.1em]">{rec.context}</p>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                                <div className="space-y-5">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-2 w-2 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                                                                        <h5 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Key Indicators to Watch</h5>
                                                                    </div>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {rec.indicators.map((ind, j) => (
                                                                            <Badge key={j} className="bg-slate-50 text-slate-600 border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-tight">
                                                                                {ind}
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                    <p className="text-[11px] font-medium text-slate-400 italic leading-relaxed">

                                                                    </p>
                                                                </div>

                                                                <div className="space-y-5 bg-green-50/20 p-8 rounded-[32px] border border-green-100/30">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                                        <h5 className="text-[11px] font-black text-green-900 uppercase tracking-widest">Teacher Actions</h5>
                                                                    </div>
                                                                    <div className="space-y-4">
                                                                        {rec.action.split(';').map((act, k) => (
                                                                            <div key={k} className="flex items-start gap-4 group/action">
                                                                                <div className="h-5 w-5 shrink-0 rounded-lg bg-white border border-green-100 flex items-center justify-center text-green-500 group-hover/action:bg-green-500 group-hover/action:text-white transition-all">
                                                                                    <ChevronRight className="h-3 w-3" />
                                                                                </div>
                                                                                <p className="text-sm font-bold text-slate-700 leading-snug tracking-tight pt-0.5">{act.trim()}</p>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                {activeRecommendations.length > 3 && (
                                                    <div className="flex justify-center pt-4">
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => setVisiblePrioritiesCount(prev => prev >= activeRecommendations.length ? 3 : prev + 3)}
                                                            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 hover:bg-slate-50 rounded-xl px-6"
                                                        >
                                                            {visiblePrioritiesCount >= activeRecommendations.length ? 'Show Less' : `Show ${Math.min(3, activeRecommendations.length - visiblePrioritiesCount)} More`}
                                                            <ChevronDown className={`h-3 w-3 transition-transform ${visiblePrioritiesCount >= activeRecommendations.length ? 'rotate-180' : ''}`} />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Strengths Section - Persistent Positive Reinforcement */}
                                            {strengths.length > 0 && (
                                                <div className="pt-10 border-t border-slate-100 space-y-8">
                                                    <div className="flex items-center gap-4 px-2">
                                                        <div className="h-8 w-1 bg-green-500 rounded-full" />
                                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Strengths to Build On</h3>
                                                    </div>
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                        {strengths.map((s, i) => (
                                                            <div key={i} className="bg-white p-7 rounded-[40px] border border-slate-100 flex items-center justify-between group hover:shadow-lg transition-all">
                                                                <div className="space-y-1">
                                                                    <span className="text-[10px] font-black text-green-400 uppercase tracking-widest">{s.code}</span>
                                                                    <p className={`text-sm font-black uppercase tracking-tight ${mockDomainScores[s.code] < 45 ? 'text-rose-600' : mockDomainScores[s.code] < 65 ? 'text-amber-600' : 'text-emerald-600'}`}>{s.domain}</p>
                                                                </div>
                                                                <div className="h-12 w-12 rounded-2xl bg-green-50 overflow-hidden flex items-center justify-center text-green-600 font-black text-lg transition-transform group-hover:scale-110">
                                                                    {mockDomainScores[s.code]}%
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'matrix' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-10">
                                        {/* Premium Matrix Filters */}
                                        <div className="bg-white/60 backdrop-blur-md px-6 py-4 rounded-[24px] border border-slate-100 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Phase</span>
                                                    <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-100">
                                                        {visiblePhases.map(p => (
                                                            <button
                                                                key={p}
                                                                onClick={() => setSelectedMatrixPhase(p)}
                                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedMatrixPhase === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                            >
                                                                Phase {p}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="w-[1px] h-6 bg-slate-200" />
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assessment</span>
                                                    <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-100">
                                                        {assessmentsInSelectedPhase.map(a => (
                                                            <button
                                                                key={a}
                                                                onClick={() => setSelectedMatrixAssessment(a)}
                                                                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedMatrixAssessment === a ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                            >
                                                                {a}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="border-slate-100 text-slate-400 text-[8px] font-black uppercase px-3 py-1 rounded-[12px] bg-white">
                                                {phaseDomains.length} Clinical Indicators
                                            </Badge>
                                        </div>

                                        {/* Longitudinal Support Track - Relocated */}
                                        <div className="space-y-8">
                                            <div className="flex items-center px-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-8 w-1 bg-blue-500 rounded-full" />
                                                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Clinical Progression Analysis</h3>
                                                </div>
                                            </div>
                                            <div className="bg-white rounded-[40px] p-12 border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] relative overflow-hidden group">
                                                <div className="flex items-center justify-between mb-12">
                                                    <div className="flex flex-col gap-2">
                                                        <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Trajectory Mapping</p>
                                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                                            Tracking wellbeing evolution across supportive screening points. (Phases 1-3: Growth; Phase 4: Exit Interview)
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className="text-[9px] font-black text-blue-600 border-blue-100 uppercase bg-blue-50/80 px-5 py-2 rounded-full shadow-sm">
                                                        {selectedMatrixPhase === 4 ? 'Exit Interview Protocol Active' : 'Academic Cycle Monitoring'}
                                                    </Badge>
                                                </div>

                                                <div className="flex items-end justify-between h-40 gap-10 px-6">
                                                    {[
                                                        { name: 'Major 1', score: 65, color: 'bg-slate-100', status: 'Completed' },
                                                        { name: 'Mini 1.1', score: 62, color: 'bg-slate-200', status: 'Completed' },
                                                        { name: 'Mini 1.2', score: wellbeingScoreValue, color: 'bg-blue-600', status: 'Current' },
                                                        { name: 'Major 2', score: 0, color: 'bg-slate-50', status: 'Future' },
                                                        { name: 'Mini 2.1', score: 0, color: 'bg-slate-50', status: 'Future' },
                                                    ].map((ass, i) => (
                                                        <div key={i} className="flex-1 flex flex-col items-center gap-6 relative">
                                                            <div className="absolute -top-14 flex flex-col items-center">
                                                                <span className={`text-sm font-black ${ass.score > 0 ? 'text-slate-900' : 'text-slate-200'}`}>{ass.score > 0 ? `${ass.score}%` : '—'}</span>
                                                                <div className="h-5 w-[2px] bg-slate-50" />
                                                            </div>
                                                            <div className="relative w-full flex flex-col items-center h-full justify-end">
                                                                <div
                                                                    className={`w-full max-w-[40px] rounded-t-2xl transition-all duration-1000 ${ass.color} ${ass.status === 'Current' ? 'shadow-[0_10px_40px_rgba(37,99,235,0.4)] ring-4 ring-blue-50' : ''}`}
                                                                    style={{ height: ass.score > 0 ? `${ass.score}%` : '8px' }}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col items-center gap-3">
                                                                <span className={`text-[9px] font-black uppercase tracking-[0.1em] whitespace-nowrap ${ass.score > 0 ? 'text-slate-600' : 'text-slate-200'}`}>{ass.name}</span>
                                                                <div className={`h-2.5 w-2.5 rounded-full border-2 border-white shadow-sm ${ass.status === 'Completed' ? 'bg-emerald-500' : ass.status === 'Current' ? 'bg-blue-600 animate-pulse' : 'bg-slate-100'}`} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-12 pt-8 border-t border-slate-100 grid grid-cols-2 gap-8">
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Positive Drivers (Phase 1)</p>
                                                        </div>
                                                        <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50 space-y-2">
                                                            <p className="text-[10px] font-bold text-emerald-700 leading-snug">
                                                                • Early intervention in <span className="underline">Social Relationships</span> yielded +12% improvement.
                                                            </p>
                                                            <p className="text-[10px] font-bold text-emerald-700 leading-snug">
                                                                • "Peer Buddy" system adoption correlates with lower isolation scores.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="flex items-center gap-2">
                                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                                            <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Areas of Resistance</p>
                                                        </div>
                                                        <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50 space-y-2">
                                                            <p className="text-[10px] font-bold text-amber-700 leading-snug">
                                                                • <span className="underline">Academic Confidence</span> remains static despite tutoring.
                                                            </p>
                                                            <p className="text-[10px] font-bold text-amber-700 leading-snug">
                                                                • Persistent exam anxiety triggered dip in Mini 1.1 evaluation.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-8 w-1 bg-slate-900 rounded-full" />
                                                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                                                        Domain Breakdown: {selectedMatrixPhase === 4 ? 'Phase 4 Exit Interview' : `Phase ${selectedMatrixPhase} (${selectedMatrixAssessment})`}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <Badge className="bg-slate-900 text-[8px] font-black uppercase px-2 py-1 rounded-lg">
                                                        Domains Covered: {phaseDomains.length}
                                                    </Badge>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        <TrendingDown className="h-3 w-3" /> Result Ranking
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Vertical Linear Matrix UI */}
                                            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-4">
                                                {phaseDomains
                                                    .sort((a, b) => (mockDomainScores[a.code] || 0) - (mockDomainScores[b.code] || 0))
                                                    .map((rec, i) => {
                                                        const score = mockDomainScores[rec.code] || 0;
                                                        const analytics = domainAnalytics[rec.code] || { trend: 'stable', persistent: false };
                                                        const prevScore = Math.max(score - 4, 0); // Mock Improvement

                                                        return (
                                                            <div key={i} className="group relative p-4 rounded-3xl hover:bg-slate-50/50 transition-all border border-transparent hover:border-slate-100">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="space-y-0.5">
                                                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{rec.domain}</h4>
                                                                            <div className="flex items-center gap-3">
                                                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${score < 45 ? 'bg-red-50 text-red-600' : score < 65 ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                                                                                    {score < 45 ? 'Urgent' : score < 65 ? 'Monitoring' : 'Stable'}
                                                                                </span>
                                                                                <span className="text-[8px] font-bold text-green-600 uppercase tracking-tight ml-2">
                                                                                    (+4% vs Prev)
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col items-end">
                                                                        <span className={`text-xl font-black tracking-tighter ${score < 45 ? 'text-red-600' : score < 65 ? 'text-orange-600' : 'text-slate-900'}`}>{score}%</span>
                                                                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Aggregate Score</span>
                                                                    </div>
                                                                </div>
                                                                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden p-[2px] border border-slate-200/50">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${score < 45 ? 'bg-red-500' : score < 65 ? 'bg-orange-500' : 'bg-green-500'}`}
                                                                        style={{ width: `${score}%` }}
                                                                    />
                                                                </div>
                                                                {analytics.persistent && (
                                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 h-2 w-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" title="Persistent Concern" />
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'support' && (
                                    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                        {/* Chatbot Triggers Section */}

                                        <div className="space-y-8">
                                            <div className="flex items-center justify-between px-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-8 w-1 bg-violet-500 rounded-full" />
                                                    <div className="flex flex-col">
                                                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Support Alerts</h3>
                                                        <p className="text-xs font-medium text-slate-500">Critical signals analyzed by AI monitors</p>
                                                    </div>
                                                </div>
                                                <div className="flex bg-slate-100/50 p-1 rounded-xl">
                                                    {['All', 'Academic', 'Behavioral', 'Wellbeing'].map(filter => (
                                                        <button key={filter} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === 'All' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-400 hover:text-slate-600'}`}>
                                                            {filter}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                {supportAlerts.map((trigger, i) => (
                                                    <div key={i} className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                                        <div className="flex items-start gap-4">
                                                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 ${trigger.severity === 'high' ? 'bg-red-50 text-red-500' : trigger.severity === 'medium' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                                                                <Zap className="h-5 w-5" />
                                                            </div>
                                                            <div className="flex-1 space-y-2">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        {/* We assume current phase if not present, or omit */}
                                                                        <Badge variant="outline" className="bg-slate-50 border-slate-100 text-slate-500 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg">{trigger.category}</Badge>
                                                                    </div>
                                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider">
                                                                        {trigger.timestamp?.toDate ? format(trigger.timestamp.toDate(), 'MMM dd') : 'Recent'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm font-medium text-slate-700 leading-relaxed font-sans">{trigger.message}</p>
                                                            </div>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-slate-50">
                                                                <ChevronRight className="h-4 w-4 text-slate-300" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {supportAlerts.length === 0 && (
                                                    <div className="bg-white rounded-[24px] p-8 border border-slate-100 flex flex-col items-center justify-center text-center">
                                                        <ShieldCheck className="h-8 w-8 text-slate-200 mb-2" />
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No active alerts detected</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>


                                        {/* Continuity & Handover History Section */}
                                        <div className="space-y-8">
                                            <div className="flex items-center px-2">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-8 w-1 bg-blue-600 rounded-full" />
                                                    <div className="flex flex-col">
                                                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Continuity & Handover History</h3>
                                                        <p className="text-xs font-medium text-slate-500 italic">Essential behavioral tracking for teacher-to-teacher student transitions</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-6">
                                                {firestoreNotes.length > 0 ? (
                                                    firestoreNotes.map((note) => (
                                                        <div key={note.id} className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6 hover:shadow-xl transition-all duration-500">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <Badge className="bg-slate-900 text-white border-none text-[8px] font-black uppercase px-3 py-1 rounded-full">Phase {note.phaseId || student.currentPhaseId || 1}</Badge>
                                                                    <Badge variant="outline" className="border-slate-100 text-slate-400 text-[8px] font-black uppercase px-3 py-1 rounded-full">{note.category || 'General'}</Badge>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="h-3 w-3 text-slate-300" />
                                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                                                        {format(note.timestamp?.toDate?.() || (note.timestamp instanceof Date ? note.timestamp : new Date()), 'MMM dd, yyyy')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <p className="text-lg font-medium text-slate-700 leading-relaxed font-sans italic">
                                                                "{note.content}"
                                                            </p>
                                                            <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100">
                                                                        {note.author.slice(0, 2).toUpperCase()}
                                                                    </div>
                                                                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{note.author.split('@')[0]}</span>
                                                                </div>
                                                                <Button variant="ghost" size="sm" className="h-8 text-[8px] font-black uppercase tracking-widest text-slate-300 hover:text-rose-500">Delete Record</Button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="bg-white rounded-[40px] p-20 border-2 border-dashed border-slate-100 flex flex-col items-center justify-center text-center space-y-4">
                                                        <FileText className="h-12 w-12 text-slate-100" />
                                                        <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest">No evidence logs detected for this cycle</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Sidebar Canvas (Only visible in Overview) */}
                                {activeTab === 'overview' && (
                                    <div className="lg:w-[380px] shrink-0 space-y-12">
                                        {/* Refined Sidebar Card - MOVED TO TOP */}
                                        <div className="bg-[#0F172A] p-10 text-white rounded-[40px] shadow-[0_32px_64px_rgba(15,23,42,0.3)] relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px] group-hover:bg-blue-500/20 transition-colors duration-700" />
                                            <div className="absolute bottom-10 left-10 w-32 h-32 bg-slate-500/5 rounded-full blur-[60px]" />

                                            <div className="relative z-10 space-y-10">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Assessment Roadmap</p>
                                                    {/* Export Button moved here maybe? No, keep at bottom */}
                                                </div>

                                                <div className="space-y-12">
                                                    {[1, 2, 3, 4].map(phase => {
                                                        const isActive = (student.currentPhaseId || 1) === phase;
                                                        const isCompleted = (student.currentPhaseId || 1) > phase;
                                                        const isLocked = (student.currentPhaseId || 1) < phase;

                                                        return (
                                                            <div key={phase} className={`relative pl-12 border-l-[1px] ${isCompleted ? 'border-emerald-500/30' : 'border-slate-800'} last:border-0 pb-2`}>
                                                                {/* Phase Node */}
                                                                <div className={`absolute -left-[11px] top-0 h-5 w-5 rounded-full border-[4px] border-[#0F172A] flex items-center justify-center z-20 ${isCompleted ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : isActive ? 'bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]' : 'bg-slate-800'}`}>
                                                                    {isCompleted && <CheckCircle className="h-4 w-4 text-white" />}
                                                                </div>

                                                                <div className={`space-y-4 ${isLocked ? 'opacity-30' : 'opacity-100'}`}>
                                                                    <div className="flex items-center justify-between">
                                                                        <h4 className={`text-[13px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-slate-400'}`}>
                                                                            {phase === 4 ? 'Exit Interview' : `Phase 0${phase}`}
                                                                        </h4>
                                                                        {isActive && <Badge className="bg-indigo-600/10 text-indigo-600 border-none text-[9px] font-bold tracking-tight px-2 py-0.5">Active Protocol</Badge>}
                                                                    </div>

                                                                    {/* Nested Milestones for Phase */}
                                                                    {(isActive || isCompleted) && phase < 4 && (
                                                                        <div className="space-y-6 pt-2">
                                                                            {[
                                                                                { label: 'Baseline', icon: Target },
                                                                                { label: `Mini ${phase}.1`, icon: Activity },
                                                                                { label: `Mini ${phase}.2`, icon: Activity },
                                                                                { label: 'Phase Complete', icon: ShieldCheck }
                                                                            ].map((milestone, idx) => {
                                                                                const triggers = getTriggersForMilestone(milestone.label);
                                                                                return (
                                                                                    <div key={idx} className="flex gap-4 group/milestone">
                                                                                        <div className="flex flex-col items-center gap-1">
                                                                                            <div className={`h-2 w-2 rounded-full border border-slate-700 ${isCompleted || (isActive && idx === 0) ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-900'}`} />
                                                                                            {idx < 3 && <div className="w-[1px] h-full bg-slate-800" />}
                                                                                        </div>
                                                                                        <div className="space-y-1 pb-4">
                                                                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-tight">{milestone.label}</p>
                                                                                            {triggers.length > 0 ? (
                                                                                                <div className="flex flex-wrap gap-1">
                                                                                                    {triggers.map(t => (
                                                                                                        <span key={t} className="text-[7px] font-black bg-rose-900/40 text-rose-400 border border-rose-800/50 px-1.5 py-0.5 rounded-sm uppercase">{t}</span>
                                                                                                    ))}
                                                                                                    <span className="text-[7px] font-medium text-slate-500 uppercase tracking-tighter pt-0.5 ml-1">Triggered</span>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <p className="text-[8px] font-medium text-slate-600 uppercase italic tracking-widest">Baseline Verified</p>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}

                                                                    {phase === 4 && (isActive || isCompleted) && (
                                                                        <div className="bg-slate-800/20 p-5 rounded-[24px] border border-slate-800 mt-4">
                                                                            <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase italic">
                                                                                Final clinical sign-off and psychological wellbeing validation for year-end transition.
                                                                            </p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div className="pt-10 border-t border-slate-800/80">
                                                    <div className="flex items-center justify-between mb-5">
                                                        <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Yearly Completion</p>
                                                        <span className="text-[11px] font-black text-blue-400 tracking-tighter">{assessmentsCompleted}/{totalMilestones} MILESTONES</span>
                                                    </div>
                                                    <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden p-[2px] border border-slate-800">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                                                            style={{ width: `${completionPercent}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] font-medium text-slate-600 uppercase tracking-tighter mt-4 leading-relaxed font-heading italic">
                                                        Cycle verified through {assessmentsCompleted} clinical assessment points.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-xs font-bold text-slate-800 tracking-wide px-1">Recent Observation</h3>
                                            <div className="bg-white p-6 border border-slate-200 space-y-4 rounded-3xl relative overflow-hidden group hover:shadow-lg transition-all">
                                                {firestoreNotes.length > 0 ? (
                                                    <>
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            <Badge className="bg-emerald-50 text-emerald-600 border-none text-[7px] font-black uppercase">Phase {firestoreNotes[0].phaseId || 1}</Badge>
                                                            <Badge className="bg-blue-50 text-blue-600 border-none text-[7px] font-black uppercase">{firestoreNotes[0].category || 'General'}</Badge>
                                                        </div>
                                                        <p className="text-[11px] font-medium text-slate-700 leading-relaxed italic line-clamp-3">
                                                            "{firestoreNotes[0].content}"
                                                        </p>
                                                        <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{firestoreNotes[0].author.split('@')[0]}</span>
                                                            <span className="text-[9px] font-black text-slate-900 uppercase">
                                                                {format(firestoreNotes[0].timestamp?.toDate?.() || (firestoreNotes[0].timestamp instanceof Date ? firestoreNotes[0].timestamp : new Date()), 'MMM dd')}
                                                            </span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="text-[11px] font-black text-slate-300 uppercase tracking-widest text-center py-4">No observations recorded</p>
                                                )}
                                            </div>
                                        </div>


                                    </div>
                                )}

                            </div>
                        </div>
                        {/* New Observation Dialog */}
                        <Dialog open={showObsDialog} onOpenChange={setShowObsDialog}>
                            <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl p-8 bg-white">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Log New Observation</h3>
                                        <div className="flex flex-col gap-1">
                                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                Phase {student.currentPhaseId || 1} • {latestAssessment?.assessmentName || latestAssessment?.assessmentType || 'General Cycle'}
                                            </p>
                                            <p className="text-[9px] font-medium text-slate-300 uppercase tracking-widest">
                                                {format(new Date(), 'MMM dd, h:mm a')} • Live Entry
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="grid grid-cols-3 gap-2">
                                            {['general', 'academic', 'wellbeing', 'social', 'behavioral', 'family'].map(cat => (
                                                <button
                                                    key={cat}
                                                    onClick={() => setSelectedObsCategory(cat)}
                                                    className={`py-2.5 px-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedObsCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'}`}
                                                >
                                                    {cat}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                                            <div className="flex items-start gap-2">
                                                <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                                                <p className="text-[10px] font-medium text-slate-500 leading-snug">
                                                    <span className="font-bold text-slate-700 uppercase tracking-wide text-[9px] mr-1">
                                                        {selectedObsCategory === 'general' && "General Admin"}
                                                        {selectedObsCategory === 'academic' && "Academic Performance"}
                                                        {selectedObsCategory === 'wellbeing' && "Emotional Wellbeing"}
                                                        {selectedObsCategory === 'social' && "Social Dynamics"}
                                                        {selectedObsCategory === 'behavioral' && "Behavioral Events"}
                                                        {selectedObsCategory === 'family' && "Home Context"}
                                                    </span>
                                                    {selectedObsCategory === 'general' && "Use for administrative updates, attendance records, or miscellaneous notes not covered by other categories."}
                                                    {selectedObsCategory === 'academic' && "Track grades, homework completion, classroom focus, and learning support needs."}
                                                    {selectedObsCategory === 'wellbeing' && "Document mood shifts, signs of stress/fatigue, hygiene, or emotional regulation concerns."}
                                                    {selectedObsCategory === 'social' && "Note peer interactions, isolation, bullying incidents, or changing friend groups."}
                                                    {selectedObsCategory === 'behavioral' && "Record disruptive incidents, rule violations, aggression, or positive behavioral milestones."}
                                                    {selectedObsCategory === 'family' && "Log parent communications, home environment changes, or guardian-reported concerns."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observation Narrative</label>
                                        <Textarea
                                            placeholder="Enter behavioral observations or pedagogical notes..."
                                            className="min-h-[150px] rounded-2xl border-slate-100 focus:ring-slate-100 font-medium text-sm leading-relaxed"
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            onClick={() => setShowObsDialog(false)}
                                            variant="outline"
                                            className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-100 text-slate-500"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={handleNewObservation}
                                            className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200"
                                        >
                                            Log Observation
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Contact Verification Dialog */}
                        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
                            <DialogContent className="sm:max-w-[400px] border-none shadow-2xl rounded-3xl p-8 bg-white">
                                <div className="space-y-6 text-center">
                                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Phone className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Parent Contact</h3>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Confirm to initiate call log protocol</p>
                                    </div>

                                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mobile Number</p>
                                        <p className="text-xl font-black text-slate-900">+91 98765 43210</p>
                                        <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-2 font-heading italic">Verified: Primary Guardian</p>
                                    </div>

                                    <div className="flex gap-3">
                                        <Button
                                            onClick={() => setShowContactDialog(false)}
                                            variant="outline"
                                            className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-100 text-slate-500"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                window.location.href = "tel:+919876543210";
                                                setShowContactDialog(false);
                                                toast({ title: "Call Initiated", description: "Directing to system dialer..." });
                                            }}
                                            className="flex-1 h-12 rounded-2xl font-black text-[10px] uppercase tracking-widest bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                                        >
                                            Call Parent
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </DialogContent>
            </DialogPortal>
        </Dialog >
    );
};

export default StudentDetailView;
