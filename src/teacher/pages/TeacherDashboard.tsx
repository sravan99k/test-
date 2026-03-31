import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    subscribeToTeacherStudents,
    TeacherStudent,
    calculateAnalyticsFromStudents,
    TeacherAnalytics,
    ChatTrigger,
    subscribeToChatTriggers
} from "@/services/teacherDataService";
import {
    Brain,
    Users,
    TrendingUp,
    Activity,
    Heart,
    AlertTriangle,
    ChevronRight,
    LayoutGrid,
    FileText,
    MousePointer2,
    Calendar,
    Sparkles,
    MessageSquare,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    ArrowRight,
    ShieldCheck,
    CheckCircle,
    PlusCircle,
    Zap,
    ClipboardCheck
} from "lucide-react";
import { format } from "date-fns";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from "recharts";
import StudentDetailView from "@/components/teacher-dashboard/StudentDetailView";

import { useNavigate } from "react-router-dom";

const SupportAlertCard = ({ group, onReview }: { group: ChatTrigger[], onReview: (group: ChatTrigger[]) => void }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const latest = group[0];
    const hasMultiple = group.length > 1;

    return (
        <div className="group p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:border-blue-100/50 hover:shadow-[0_20px_40px_rgba(59,130,246,0.05)] transition-all duration-500 relative">
            <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-[11px] font-bold text-blue-600 uppercase shadow-inner">
                                {(latest.studentName || 'U').split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-bold text-slate-900 uppercase tracking-tight">{latest.studentName}</p>
                                    <Badge variant="outline" className={`text-[8px] font-bold border-none p-0 uppercase h-auto ${latest.severity === 'high' ? 'text-red-500' : latest.severity === 'medium' ? 'text-orange-500' : 'text-green-500'}`}>
                                        {latest.category?.replace('-', ' ') || 'Behavioral'}
                                    </Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Clock className="h-3 w-3 text-slate-300" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{format(latest.timestamp, 'HH:mm')}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 relative pl-4 border-l-2 border-blue-100/50">
                            <p className="text-[13px] font-semibold text-slate-700 leading-relaxed font-sans italic">
                                "{latest.privacySafeMessage || 'Student requires attention based on behavioral indicators.'}"
                            </p>

                            {hasMultiple && (
                                <div className="mt-4 space-y-3">
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="flex items-center gap-2 text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors"
                                    >
                                        {isExpanded ? 'Collapse Thread' : `+ ${group.length - 1} further alerts from this learner`}
                                        <ChevronRight className={`h-3 w-3 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                                    </button>

                                    {isExpanded && (
                                        <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                            {group.slice(1).map((t) => (
                                                <div key={t.id} className="pl-4 border-l border-slate-100 flex flex-col gap-1.5">
                                                    <p className="text-[12px] text-slate-600 leading-snug font-medium">"{t.privacySafeMessage || 'Behavioral concern detected.'}"</p>
                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{format(t.timestamp, 'HH:mm')}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-center justify-center pl-4 border-l border-slate-100/50 min-h-[100px] self-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-14 w-14 rounded-full hover:bg-emerald-50 hover:text-emerald-600 transition-all text-slate-200 bg-white shadow-sm border border-slate-100 group/btn"
                            onClick={() => onReview(group)}
                        >
                            <CheckCircle className="h-7 w-7 transition-transform group-hover/btn:scale-110" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<TeacherStudent[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(null);
    const [triggers, setTriggers] = useState<ChatTrigger[]>([]);
    const [dismissedTriggerIds, setDismissedTriggerIds] = useState<string[]>([]);
    const [analytics, setAnalytics] = useState<TeacherAnalytics>({
        totalStudents: 0,
        averageWellbeing: 0,
        engagementRate: 0,
        participationRate: 0,
        performanceData: []
    });

    useEffect(() => {
        let unsubscribeStudents: any;
        let unsubscribeTriggers: any;

        const setup = async () => {
            unsubscribeStudents = await subscribeToTeacherStudents((data) => {
                setStudents(data);
                setAnalytics(calculateAnalyticsFromStudents(data));
            });

            unsubscribeTriggers = await subscribeToChatTriggers((data) => {
                setTriggers(data);
            });
        };

        setup();

        return () => {
            if (unsubscribeStudents) unsubscribeStudents();
            if (unsubscribeTriggers) unsubscribeTriggers();
        };
    }, []);

    const highRiskStudents = useMemo(() =>
        students.filter(s => s.riskLevel === 'high').slice(0, 4),
        [students]);

    const groupedTriggers = useMemo(() => {
        const filtered = triggers.filter(t => !dismissedTriggerIds.includes(t.id));
        const grouped: Record<string, typeof filtered> = {};

        filtered.forEach(t => {
            if (!grouped[t.studentId]) grouped[t.studentId] = [];
            grouped[t.studentId].push(t);
        });

        // SORTING: Severity (High > Medium > Low) -> Time (Newest First)
        return Object.values(grouped).sort((a, b) => {
            const getSeverityScore = (group: ChatTrigger[]) => {
                if (group.some(t => t.severity === 'high')) return 3;
                if (group.some(t => t.severity === 'medium')) return 2;
                return 1;
            };
            const scoreA = getSeverityScore(a);
            const scoreB = getSeverityScore(b);
            if (scoreB !== scoreA) return scoreB - scoreA;
            return b[0].timestamp.getTime() - a[0].timestamp.getTime();
        });
    }, [triggers, dismissedTriggerIds]);

    const [activeReviewGroup, setActiveReviewGroup] = useState<ChatTrigger[] | null>(null);
    const [reviewNote, setReviewNote] = useState("");
    const [savedReviews, setSavedReviews] = useState<{ ids: string[], note: string, date: Date }[]>([]);

    // Filter State
    const [gradeFilter, setGradeFilter] = useState<string>('all');
    const [sectionFilter, setSectionFilter] = useState<string>('all');
    const [phaseFilter, setPhaseFilter] = useState<string>('all');

    const uniqueGrades = useMemo(() => Array.from(new Set(students.map(s => s.class))).sort(), [students]);
    const uniqueSections = useMemo(() => Array.from(new Set(students.map(s => s.fullProfile?.section).filter(Boolean) as string[])).sort(), [students]);

    return (
        <div className="flex-1 w-full overflow-x-hidden overflow-y-auto bg-[#FAFAFA] bg-[radial-gradient(at_0%_0%,rgba(59,130,246,0.03)_0,transparent_50%),radial-gradient(at_100%_0%,rgba(16,185,129,0.03)_0,transparent_50%)] px-4 md:px-10 py-10 font-sans">
            <div className="max-w-[1400px] mx-auto w-full space-y-12">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">



                        </div>
                    </div>

                </header>

                {/* Compact Control Center / Vitals */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Wellbeing', value: `${analytics.averageWellbeing}%`, icon: Heart, color: 'text-red-500', bg: 'bg-red-50/30' },
                        { label: 'Engagement', value: `${analytics.engagementRate}%`, icon: Zap, color: 'text-blue-500', bg: 'bg-blue-50/30', trend: 'Active' },
                        { label: 'Completion', value: `${analytics.participationRate}%`, icon: ClipboardCheck, color: 'text-green-500', bg: 'bg-green-50/30', trend: 'Phase 1' },
                        { label: 'Students', value: analytics.totalStudents, icon: Users, color: 'text-slate-600', bg: 'bg-slate-50/30', trend: 'Total' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white/40 backdrop-blur-md p-4 rounded-[1.2rem] border border-white shadow-[0_2px_15px_rgba(0,0,0,0.02)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.05)] transition-all duration-500 group flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color} transition-all group-hover:scale-110`}>
                                    <stat.icon className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                                    <h3 className="text-2xl font-heading font-semibold text-slate-900 tracking-tight">{stat.value}</h3>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant="secondary" className="bg-white text-[10px] font-medium text-slate-500 border border-slate-100 px-2 py-0.5 shadow-sm">{stat.trend}</Badge>
                            </div>
                        </div>
                    ))}
                </div>



                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <Card className="lg:col-span-8 rounded-[2.5rem] bg-white border border-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-700 p-6 md:p-10 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-10">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-heading font-medium text-slate-900">Class Performance Overview</h3>
                                    <p className="text-sm text-slate-500 font-medium">Comparative progress across classroom assessment phases</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* Smart Filter Bar */}
                                    <div className="flex items-center gap-3 bg-slate-50/80 backdrop-blur-sm p-1.5 rounded-[1.2rem] border border-slate-100 shadow-inner">

                                        {/* Phase Filter */}
                                        <div className="flex items-center gap-1 px-3 border-r border-slate-200">
                                            <Select value={phaseFilter} onValueChange={setPhaseFilter}>
                                                <SelectTrigger className="h-6 gap-1 bg-transparent border-none text-[9px] font-bold uppercase text-slate-500 hover:text-blue-600 p-0 focus:ring-0">
                                                    <SelectValue placeholder="Phase" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Phases</SelectItem>
                                                    <SelectItem value="1">Phase 1</SelectItem>
                                                    <SelectItem value="2">Phase 2</SelectItem>
                                                    <SelectItem value="3">Phase 3</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Grade/Section Logic */}
                                        {uniqueGrades.length > 1 ? (
                                            <div className="flex items-center gap-2 pl-1">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Grade:</span>
                                                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                                                    <SelectTrigger className="h-6 w-[80px] bg-transparent border-none text-[10px] font-bold text-slate-600 p-0 focus:ring-0">
                                                        <SelectValue placeholder="All" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All Grades</SelectItem>
                                                        {uniqueGrades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        ) : (
                                            <div className="px-2">
                                                <Badge className="bg-blue-100/50 text-blue-600 text-[9px] font-bold border-none uppercase">
                                                    {uniqueGrades[0] || 'Unassigned'} {uniqueSections.length === 1 ? `- ${uniqueSections[0]}` : ''}
                                                </Badge>
                                            </div>
                                        )}

                                        {/* Section Filter (only if multiple sections) */}
                                        {uniqueSections.length > 1 && (
                                            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Sec:</span>
                                                <Select value={sectionFilter} onValueChange={setSectionFilter}>
                                                    <SelectTrigger className="h-6 w-[60px] bg-transparent border-none text-[10px] font-bold text-slate-600 p-0 focus:ring-0">
                                                        <SelectValue placeholder="All" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All</SelectItem>
                                                        {uniqueSections.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1 bg-blue-50/50 p-1 rounded-2xl border border-blue-100/50">

                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-8 px-2">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]" />
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Wellbeing Avg</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Engagement Level</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-full">
                                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                                    <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter">+4.2% Strength Improvement</span>
                                </div>
                            </div>
                            <div className="h-[280px] w-full items-end mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={analytics.performanceData}>
                                        <defs>
                                            <linearGradient id="colorWb" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25} />
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} dy={10} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#94A3B8' }} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)' }}
                                            labelStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px', color: '#1E293B', marginBottom: '8px', letterSpacing: '0.05em' }}
                                        />
                                        <Area type="monotone" dataKey="wellbeingScore" stroke="#3B82F6" strokeWidth={4} fill="url(#colorWb)" animationDuration={2000} />
                                        <Area type="monotone" dataKey="engagementScore" stroke="#10B981" strokeWidth={4} fill="url(#colorEng)" animationDuration={2000} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Card>

                    <Card className="lg:col-span-4 rounded-[2.5rem] bg-red-50/50 border border-double border-red-100 shadow-sm p-10 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-heading font-semibold text-red-900">Immediate Attention</h3>
                                    <p className="text-sm text-red-600/70 font-medium">Students identified for proactive support</p>
                                </div>
                                <Badge className="bg-red-500 text-white border-none font-semibold text-[11px] px-3">{highRiskStudents.length} Students</Badge>
                            </div>
                            <div className="space-y-4 max-h-[300px] overflow-hidden relative">
                                {highRiskStudents.length > 0 ? highRiskStudents.map((s) => (
                                    <div key={s.uid} className="flex items-center justify-between p-4 rounded-3xl bg-white border border-red-100 hover:shadow-md transition-all group cursor-pointer" onClick={() => setSelectedStudent(s)}>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10 rounded-full border border-red-100 bg-white">
                                                <AvatarImage src={s.avatar} />
                                                <AvatarFallback className="bg-red-50 text-red-600 font-semibold text-xs">{s.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 group-hover:text-red-700 transition-colors">{s.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Badge variant="outline" className="border-red-200 text-red-600 text-[10px] font-medium px-1.5 py-0 whitespace-nowrap">
                                                        {s.riskPercentage || Math.max(0, 100 - (s.wellbeingScore || 0))}% Risk
                                                    </Badge>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate max-w-[100px]">{s.reason || 'High risk alert'}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 rounded-xl border-red-100 text-[10px] font-bold uppercase text-red-500 hover:bg-red-50 hover:text-red-600 transition-all px-3"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Logic to open note dialog for this student
                                                    setSelectedStudent(s);
                                                }}
                                            >
                                                Log Note
                                            </Button>
                                            <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-red-50 group-hover:text-red-500 transition-all">
                                                <ChevronRight className="h-4 w-4" />
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-12 text-center bg-white/50 rounded-3xl border border-dashed border-red-100 flex flex-col items-center gap-3">
                                        <Sparkles className="h-6 w-6 text-red-300" />
                                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Stability maintained</p>
                                    </div>
                                )}
                                <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
                            </div>
                        </div>
                        <Button
                            onClick={() => navigate('/teacher/students?filter=high-risk')}
                            variant="ghost"
                            className="w-full mt-4 text-[10px] font-bold text-red-500 hover:text-red-600 hover:bg-red-100 uppercase tracking-widest"
                        >
                            View All Risks <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Chatbot Triggers Section */}
                    <Card className="lg:col-span-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm p-6 md:p-10">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                                    <MessageSquare className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-xl font-heading font-semibold text-slate-900 uppercase tracking-tight">Support Alerts</h3>
                                    <p className="text-xs text-slate-500 font-medium">Critical signals analyzed by AI monitors</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] px-3 py-1.5 uppercase rounded-lg shadow-sm">{groupedTriggers.length} Learners</Badge>
                                {(dismissedTriggerIds.length > 0) && (
                                    <Button variant="ghost" size="sm" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-blue-500 transition-colors" onClick={() => setDismissedTriggerIds([])}>Reset Archive</Button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {groupedTriggers.length > 0 ? groupedTriggers.slice(0, 4).map((group) => (
                                <SupportAlertCard
                                    key={group[0].id}
                                    group={group}
                                    onReview={(g) => setActiveReviewGroup(g)}
                                />
                            )) : (
                                <div className="py-20 text-center flex flex-col items-center gap-4">
                                    <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center">
                                        <ShieldCheck className="h-8 w-8 text-slate-200" />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No active alerts</p>
                                </div>
                            )}
                            {groupedTriggers.length > 4 && (
                                <Button variant="outline" className="w-full h-12 rounded-2xl border-dashed border-slate-200 text-slate-400 font-bold uppercase text-[10px] hover:bg-slate-50 hover:text-slate-600">
                                    View {groupedTriggers.length - 4} More Alerts
                                </Button>
                            )}
                        </div>
                    </Card>

                    {/* Recent Risk Changes Section */}
                    <Card className="lg:col-span-4 rounded-[2.5rem] bg-white/80 backdrop-blur-xl border border-slate-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all duration-700 p-6 md:p-10 flex flex-col">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 shadow-inner">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-heading font-semibold text-slate-900 uppercase tracking-tight">Risk Shifts</h3>
                                <p className="text-xs text-slate-500 font-medium">Auto-detection of stability changes</p>
                            </div>
                        </div>

                        <div className="flex-1 space-y-4">
                            {students.filter(s => s.riskLevel !== 'low').slice(0, 3).map((s, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 p-5 rounded-[1.8rem] bg-slate-50/50 border border-slate-100/50 hover:bg-white hover:border-amber-200 hover:shadow-lg transition-all duration-300 group/item cursor-pointer"
                                    onClick={() => setSelectedStudent(s)}
                                >
                                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${s.riskLevel === 'high' ? 'bg-rose-50 text-rose-500 group-hover/item:bg-rose-500 group-hover/item:text-white' : 'bg-amber-50 text-amber-500 group-hover/item:bg-amber-500 group-hover/item:text-white'}`}>
                                        {s.riskLevel === 'high' ? <ArrowUpRight className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-slate-900 uppercase truncate">{s.name}</p>
                                            <ArrowRight className="h-2 w-2 text-slate-300 group-hover/item:translate-x-1 transition-transform" />
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className={`h-1.5 w-1.5 rounded-full ${s.riskLevel === 'high' ? 'bg-rose-500 animate-pulse' : 'bg-amber-500'}`}></span>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Status: <span className={s.riskLevel === 'high' ? 'text-rose-600' : 'text-amber-600'}>{s.riskLevel} Attention</span></p>
                                        </div>
                                    </div>
                                    <div className="text-right">

                                    </div>
                                </div>
                            ))}
                        </div>


                    </Card>
                </div>
            </div >

            {selectedStudent && (
                <StudentDetailView
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}

            {/* Review Dialog */}
            <Dialog open={!!activeReviewGroup} onOpenChange={(open) => !open && setActiveReviewGroup(null)}>
                <DialogContent className="sm:max-w-[500px] border-none shadow-2xl rounded-3xl p-8 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight">Review Support Alert</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Alert</p>
                            <p className="text-sm font-medium text-slate-700 italic">"{activeReviewGroup?.[0].message}"</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                Intervention Notes <span className="text-red-500">*</span>
                            </label>
                            <Textarea
                                value={reviewNote}
                                onChange={(e) => setReviewNote(e.target.value)}
                                placeholder="Describe the action taken (e.g. 'Spoke to student', 'Referred to Counselor')..."
                                className="min-h-[100px] rounded-2xl border-slate-200"
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-2">
                        <Button variant="ghost" onClick={() => setActiveReviewGroup(null)} className="rounded-xl font-bold text-slate-500">Cancel</Button>
                        <Button
                            disabled={!reviewNote.trim()}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => {
                                if (activeReviewGroup && reviewNote.trim()) {
                                    const ids = activeReviewGroup.map(t => t.id);
                                    setSavedReviews(prev => [...prev, { ids, note: reviewNote, date: new Date() }]);
                                    setDismissedTriggerIds(prev => [...prev, ...ids]);
                                    setActiveReviewGroup(null);
                                    setReviewNote("");

                                    // Optional: Show success toast
                                    const toast = document.createElement('div');
                                    toast.className = 'fixed bottom-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl z-50 animate-in slide-in-from-bottom-10 flex items-center gap-3 font-bold text-xs uppercase tracking-widest';
                                    toast.innerHTML = `<div class="h-2 w-2 bg-green-400 rounded-full"></div> Intervention Recorded`;
                                    document.body.appendChild(toast);
                                    setTimeout(() => toast.remove(), 3000);
                                }
                            }}
                        >
                            Confirm Review
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default TeacherDashboard;
