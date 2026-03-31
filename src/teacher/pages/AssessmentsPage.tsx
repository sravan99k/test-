import React, { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    CalendarDays,
    CheckCircle,
    Clock,
    TrendingUp,
    PlayCircle,
    History,
    Hourglass,
    CircleDashed,
    ChevronRight,
    Search,
    Filter,
    MoreVertical,
    Plus,
    Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { subscribeToTeacherAssessments, TeacherAssessmentAssignment } from "@/services/teacherDataService";

const FULL_ROADMAP = [
    { id: 'm1', title: 'Major Assessment 1', type: 'Major', phase: 1, month: 'August', description: 'Baseline' },
    { id: 'mn1.1', title: 'Mini Check-in 1.1', type: 'Mini', phase: 1, month: 'September', description: 'Early Pulse' },
    { id: 'mn1.2', title: 'Mini Check-in 1.2', type: 'Mini', phase: 1, month: 'October', description: 'Phase Review' },
    { id: 'm2', title: 'Major Assessment 2', type: 'Major', phase: 2, month: 'November', description: 'Mid-Year' },
    { id: 'mn2.1', title: 'Mini Check-in 2.1', type: 'Mini', phase: 2, month: 'January', description: 'Post-break' },
    { id: 'mn2.2', title: 'Mini Check-in 2.2', type: 'Mini', phase: 2, month: 'February', description: 'Phase Review' },
    { id: 'm3', title: 'Major Assessment 3', type: 'Major', phase: 3, month: 'March', description: 'End-Year' },
    { id: 'mn3.1', title: 'Mini Check-in 3.1', type: 'Mini', phase: 3, month: 'April', description: 'Transition' },
    { id: 'mn3.2', title: 'Mini Check-in 3.2', type: 'Mini', phase: 3, month: 'May', description: 'Final Checks' },
    { id: 'exit', title: 'Exit Interview', type: 'Exit', phase: 3, month: 'June', description: 'Conclusion' },
];

export const AssessmentsPage = () => {
    const [assessments, setAssessments] = useState<TeacherAssessmentAssignment[]>([]);
    const [view, setView] = useState<'active' | 'completed' | 'draft'>('active');

    useEffect(() => {
        let unsubscribe: any;
        const setup = async () => {
            unsubscribe = await subscribeToTeacherAssessments(setAssessments);
        };
        setup();
        return () => { if (unsubscribe) unsubscribe(); };
    }, []);

    const activeAssessment = assessments.find(a => a.status === 'active');
    const completedAssessments = assessments.filter(a => a.status === 'completed');

    const getCompletionRate = (completed: number, assigned: number) => {
        if (!assigned) return 0;
        return Math.round((completed / assigned) * 100);
    };

    return (
        <div className="flex-1 min-h-screen bg-[#F8FAFC] font-sans selection:bg-indigo-100">
            <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-indigo-600 mb-1">


                        </div>
                        <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">Assessment Suite</h1>
                        <p className="text-slate-500 text-sm font-medium max-w-xl">
                            Orchestrating the 10-milestone wellbeing roadmap. Monitor real-time student sentiment across the academic lifecycle.
                        </p>
                    </div>

                </div>

                {/* Performance HUD (Stats) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Active Cycle', value: activeAssessment ? 'Phase 1 Active' : 'Idle', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50/50', border: 'border-indigo-100' },
                        { label: 'Completion Tracks', value: completedAssessments.length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
                        { label: 'Cohort Velocity', value: '94%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50/50', border: 'border-amber-100' }
                    ].map((stat, i) => (
                        <div key={i} className={`bg-white p-7 rounded-[2rem] border ${stat.border} shadow-sm flex items-center justify-between group hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-300`}>
                            <div className="space-y-1.5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-3xl font-heading font-black text-slate-900 tracking-tight">{stat.value}</p>
                            </div>
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} transition-all group-hover:scale-110 duration-500`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Navigation Rail */}
                    <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-8">
                        <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-lg shadow-slate-100 p-3 space-y-2">
                            <button
                                onClick={() => setView('active')}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${view === 'active' ? 'bg-slate-900 text-white shadow-xl shadow-slate-300' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${view === 'active' ? 'bg-slate-800' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                                        <PlayCircle className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold text-xs uppercase tracking-widest">Active Flow</span>
                                </div>
                                {view === 'active' && <ChevronRight className="h-4 w-4 opacity-50" />}
                            </button>

                            <button
                                onClick={() => setView('completed')}
                                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${view === 'completed' ? 'bg-slate-900 text-white shadow-xl shadow-slate-300' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl ${view === 'completed' ? 'bg-slate-800' : 'bg-slate-100 group-hover:bg-slate-200'}`}>
                                        <History className="h-4 w-4" />
                                    </div>
                                    <span className="font-bold text-xs uppercase tracking-widest">Archive</span>
                                </div>
                                {view === 'completed' && <ChevronRight className="h-4 w-4 opacity-50" />}
                            </button>
                        </div>


                    </div>

                    {/* Content Hub */}
                    <div className="lg:col-span-9 space-y-6">
                        <div className="bg-white rounded-[3rem] border border-slate-200/60 shadow-xl shadow-slate-200/20 p-8 min-h-[700px]">

                            {/* --- VIEW: ACTIVE --- */}
                            {view === 'active' && (
                                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-8">
                                        <div className="space-y-1.5 text-left">
                                            <h3 className="text-2xl font-heading font-black text-slate-900 tracking-tight">Academic Roadmap</h3>
                                            <p className="text-sm text-slate-400 font-medium tracking-tight">Full 10-milestone lifecycle for Current Academic Year</p>
                                        </div>
                                        <div className="flex items-center gap-3 self-start md:self-end">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Year Status</p>
                                                <p className="text-xs font-bold text-slate-900">Term 1 / Mid-Phase</p>
                                            </div>
                                            <div className="h-10 w-px bg-slate-100 mx-2 hidden md:block" />
                                            <Badge className="h-10 px-5 bg-slate-50 border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-[0.2em] rounded-xl hover:bg-slate-100 transition-all">
                                                {completedAssessments.length}/10 Done
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        {FULL_ROADMAP.map((item, idx) => {
                                            const matchedAssessment = assessments.find(a => a.title.includes(item.title));
                                            const status = matchedAssessment ? matchedAssessment.status : 'future';

                                            const isCompleted = status === 'completed';
                                            const isActive = status === 'active';

                                            return (
                                                <div
                                                    key={item.id}
                                                    className={`group relative bg-white border rounded-[2.5rem] p-7 transition-all duration-500
                                                        ${isActive ? 'border-indigo-400 shadow-[0_20px_50px_-15px_rgba(99,102,241,0.25)] ring-1 ring-indigo-400 z-10 scale-[1.02]' : 'border-slate-100 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100'}
                                                    `}
                                                >
                                                    <div className="flex flex-col md:flex-row justify-between gap-8">
                                                        <div className="flex-1 space-y-5">
                                                            {/* Flow Indicator & Header */}
                                                            <div className="flex items-center gap-4">
                                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-black text-[10px]
                                                                    ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}
                                                                `}>
                                                                    {idx + 1}
                                                                </div>
                                                                <div className="flex flex-wrap items-center gap-3">



                                                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">|</span>
                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                                                        <CalendarDays className="h-3.5 w-3.5 opacity-50" /> {item.month}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            {/* Title Content */}
                                                            <div>
                                                                <h4 className={`text-2xl font-heading font-bold tracking-tight mb-2 ${isActive ? 'text-slate-900' : 'text-slate-700 font-semibold'}`}>
                                                                    {item.title}
                                                                </h4>
                                                                <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
                                                                    {item.description} &middot; Longitudinal study of student behavioral metrics and baseline emotional intelligence indicators within the cohort.
                                                                </p>
                                                            </div>

                                                            {/* Progress Dashboard (Only Active) */}
                                                            {isActive && matchedAssessment && (
                                                                <div className="bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative">
                                                                    <div className="flex-1 space-y-3">
                                                                        <div className="flex justify-between items-end">
                                                                            <p className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.15em]">Cohort Participation</p>
                                                                            <p className="text-sm font-black text-slate-900">
                                                                                {matchedAssessment.studentsCompleted} <span className="text-slate-400 font-medium">/ {matchedAssessment.studentsAssigned}</span>
                                                                            </p>
                                                                        </div>
                                                                        <Progress
                                                                            value={getCompletionRate(matchedAssessment.studentsCompleted, matchedAssessment.studentsAssigned)}
                                                                            className="h-2 bg-indigo-100/50"
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-slate-100 shadow-sm">
                                                                        <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                                                                            <Clock className="h-5 w-5" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Remains</p>
                                                                            <p className="text-xs font-bold text-slate-900">4 Days Active</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Action Row */}
                                                            <div className="flex items-center justify-between pt-2">
                                                                <div className="flex flex-wrap gap-2">
                                                                    {['Wellbeing', 'Behavioral', 'Academic'].map((tag, i) => (
                                                                        <span key={i} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-colors
                                                                            ${isActive ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>

                                                                <div className="flex items-center gap-2">


                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* --- VIEW: COMPLETED --- */}
                            {view === 'completed' && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                    <div className="text-left">
                                        <h3 className="text-2xl font-heading font-black text-slate-900 tracking-tight">Archived Results</h3>
                                        <p className="text-sm text-slate-400 font-medium tracking-tight">Access historical assessment data and cohort benchmarks</p>
                                    </div>

                                    {completedAssessments.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {completedAssessments.map(a => (
                                                <Card key={a.id} className="group border shadow-sm border-slate-100 hover:border-indigo-100 transition-all duration-300 rounded-[2.5rem] overflow-hidden">
                                                    <CardHeader className="pb-4">
                                                        <div className="flex justify-between items-start mb-4">
                                                            <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] uppercase tracking-widest">Complete</Badge>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Term 1</p>
                                                        </div>
                                                        <CardTitle className="text-xl font-heading font-bold text-slate-800 tracking-tight">{a.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="space-y-6">
                                                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                                                            Global screening used to establish behavioral benchmarks for our student population.
                                                        </p>
                                                        <div className="flex items-center justify-between pt-2">
                                                            <div className="space-y-1">
                                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Score Avg</p>
                                                                <p className="text-lg font-black text-slate-900">84.2%</p>
                                                            </div>
                                                            <Button className="h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-slate-200">
                                                                Report
                                                            </Button>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-32 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
                                            <div className="h-20 w-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center mb-6">
                                                <History className="h-10 w-10 text-slate-300" />
                                            </div>
                                            <h4 className="text-xl font-heading font-bold text-slate-800 mb-2">No historical data available</h4>
                                            <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto">
                                                Once you complete your first assessment cycle, the analytical reports will be archived here.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles for Smooth Rendering */}
            <style>{`
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};



export default AssessmentsPage;
