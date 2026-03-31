import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Activity, Users, ChevronRight, Target, Settings, Info, Plus, Lock, CheckCircle2, PlayCircle, Clock, PauseCircle, XCircle, AlertCircle, Layout } from 'lucide-react';
import { loadEnabledAssessments, saveEnabledAssessments, EnabledAssessmentsState, getGradeAssessmentStats, GradeAssessmentStats } from "@/services/assessmentManagementService";

// --- Data Constants ---
const GRADES = ['6', '7', '8', '9', '10'];

const ASSESSMENT_JOURNEY_DATA: Record<number, any> = {
    6: {
        name: "Grade 6: The Transition",
        description: "Focus on middle school adjustment and foundational wellbeing.",
        phases: [
            {
                name: "Phase 1: Transition", period: "June - August", color: "blue",
                assessments: [
                    { id: "g6-p1-baseline", name: "Transition Baseline", type: "Major", details: { description: "Initial adjustment check and baseline mental health screening.", when: "Week 1-2 of Term 1.", domains: ["Adjustment", "Peer Connection", "Anxiety"] } },
                    { id: "g6-p1-adjustment", name: "Adjustment Check", type: "Mini", details: { description: "Brief follow-up on early school settling.", when: "3 weeks after baseline.", domains: ["School Environment", "Mood"] } },
                    { id: "g6-p1-settling", name: "Settling In Check", type: "Mini", details: { description: "Deeper look at social integration and routine.", when: "Mid-Term 1.", domains: ["Social Belonging", "Academic Routine"] } }
                ]
            },
            {
                name: "Phase 2: Performance", period: "Sept - Nov", color: "emerald",
                assessments: [
                    { id: "g6-p2-preexam", name: "Pre-Exam Stress", type: "Major", details: { description: "Monitoring academic pressure before half-yearly tests.", when: "2 weeks before exams.", domains: ["Test Anxiety", "Coping Skills"] } },
                    { id: "g6-p2-postexam", name: "Post-Exam Recovery", type: "Mini", details: { description: "Emotional state and resilience after high pressure.", when: "Immediately post-exams.", domains: ["Resilience", "Self-Esteem"] } },
                    { id: "g6-p2-midyear", name: "Mid-Year Review", type: "Mini", details: { description: "Overall engagement at the academic halfway mark.", when: "End of Term 2.", domains: ["Motivation", "Engagement"] } }
                ]
            },
            {
                name: "Phase 3: Social Risk", period: "Jan - Feb", color: "purple",
                assessments: [
                    { id: "g6-p3-burnout", name: "Burnout & Bullying", type: "Major", details: { description: "Deeper probe into social dynamics and fatigue.", when: "Return from winter break.", domains: ["Social Risk", "Bullying Awareness", "Fatigue"] } },
                    { id: "g6-p3-midwinter", name: "Mid-Winter Pulse", type: "Mini", details: { description: "Brief connectivity and mood check.", when: "Late January.", domains: ["Social Support", "Regulation"] } },
                    { id: "g6-p3-final", name: "Final Prep Check", type: "Mini", details: { description: "Readiness for the year-end transition.", when: "Late February.", domains: ["Transition Anxiety", "Focus"] } }
                ]
            },
            {
                name: "Phase 4: Reflection", period: "March", color: "amber",
                assessments: [
                    { id: "g6-p4-reflection", name: "Exit Interview", type: "Major", details: { description: "Comprehensive growth measurement and summer needs.", when: "Last 2 weeks of year.", domains: ["Growth", "Well-being", "Support"] } }
                ]
            }
        ]
    },
    7: {
        name: "Grade 7: Identity",
        description: "Navigating puberty, identity, and complex peer groups.",
        phases: [
            {
                name: "Phase 1: Identity", period: "June - August", color: "blue",
                assessments: [
                    { id: "g7-p1-identity", name: "Identity Baseline", type: "Major", details: { description: "Tracks shifts in self-perception and peer identity.", when: "Term 1 start.", domains: ["Self-Identity", "Validation Needs"] } },
                    { id: "g7-p1-social", name: "Social Dynamics", type: "Mini", details: { description: "Digital anxiety and body image check.", when: "Early August.", domains: ["Body Image", "Digital Wellness"] } },
                    { id: "g7-p1-circle", name: "Social Circle Check", type: "Mini", details: { description: "In-depth social hierarchy analysis.", when: "Late August.", domains: ["Inclusion", "Belonging"] } }
                ]
            },
            {
                name: "Phase 2: Academic", period: "Sept - Nov", color: "emerald",
                assessments: [
                    { id: "g7-p2-preexam", name: "Pre-Exam Pressure", type: "Major", details: { description: "Monitors stress as curriculum complexity increases.", when: "Term 2 middle.", domains: ["Processing Speed", "Stress Response"] } },
                    { id: "g7-p2-result", name: "Result Handling", type: "Mini", details: { description: "Impact of academic feedback on self-worth.", when: "Post-results.", domains: ["Self-Efficacy", "Resilience"] } },
                    { id: "g7-p2-energy", name: "Energy Check", type: "Mini", details: { description: "Mid-year fatigue and motivation pulse.", when: "Late November.", domains: ["Vitality", "Mood"] } }
                ]
            },
            {
                name: "Phase 3: Peers", period: "Jan - Feb", color: "purple",
                assessments: [
                    { id: "g7-p3-peer", name: "Relationship Pulse", type: "Major", details: { description: "Deeper exploration of peer influence and risk.", when: "Term 3 start.", domains: ["Peer Pressure", "Risk Awareness"] } },
                    { id: "g7-p3-exam", name: "Exam Mode Check", type: "Mini", details: { description: "Prep-time anxiety and sleep hygiene.", when: "Early February.", domains: ["Sleep", "Coping"] } },
                    { id: "g7-p3-final", name: "Year-End Readiness", type: "Mini", details: { description: "Transition readiness for Grade 8.", when: "Late February.", domains: ["Confidence", "Future Anxiety"] } }
                ]
            },
            {
                name: "Phase 4: Review", period: "March", color: "amber",
                assessments: [
                    { id: "g7-p4-exit", name: "Exit Interview", type: "Major", details: { description: "Summarizes social and personal growth.", when: "Year end.", domains: ["Growth Mindset", "Persistence"] } }
                ]
            }
        ]
    },
    8: {
        name: "Grade 8: High School Prep",
        description: "Focus on social standing and early academic streams.",
        phases: [
            {
                name: "Phase 1: Transition", period: "June - August", color: "blue",
                assessments: [
                    { id: "g8-p1-transition", name: "Independence Baseline", type: "Major", details: { description: "Measures autonomy and social confidence.", when: "Year Start.", domains: ["Independence", "Resolution"] } },
                    { id: "g8-p1-risk", name: "Risk Screening", type: "Mini", details: { description: "Peer susceptibility and tech use check.", when: "Late July.", domains: ["Tech Use", "Impulsivity"] } },
                    { id: "g8-p1-peer", name: "Social Hierarchy", type: "Mini", details: { description: "Brief peer dynamics follow-up.", when: "Late August.", domains: ["Status", "Friendship"] } }
                ]
            },
            {
                name: "Phase 2: Academic", period: "Sept - Nov", color: "emerald",
                assessments: [
                    { id: "g8-p2-preexam", name: "Academic Competence", type: "Major", details: { description: "Monitoring perceived mastery and test stress.", when: "Mid-year.", domains: ["Self-Worth", "Mastery"] } },
                    { id: "g8-p2-recovery", name: "Recovery Check", type: "Mini", details: { description: "Post-exam burnout monitoring.", when: "Term 2 end.", domains: ["Burnout", "Recovery"] } },
                    { id: "g8-p2-energy", name: "Energy & Mood", type: "Mini", details: { description: "Mid-year mood pulse.", when: "Late November.", domains: ["Energy", "Balance"] } }
                ]
            },
            {
                name: "Phase 3: Relationships", period: "Jan - Feb", color: "purple",
                assessments: [
                    { id: "g8-p3-relationships", name: "Future Readiness", type: "Major", details: { description: "Transition anxiety regarding Grade 9.", when: "Term 3.", domains: ["Future Planning", "Anxiety"] } },
                    { id: "g8-p3-prefinals", name: "Pre-Finals Risk", type: "Mini", details: { description: "Safety and stress check before finals.", when: "Early Feb.", domains: ["Safety", "Coping"] } },
                    { id: "g8-p3-mindset", name: "Grade 9 Mindset", type: "Mini", details: { description: "Readiness for high school rigor.", when: "Late Feb.", domains: ["Readiness", "Commitment"] } }
                ]
            },
            {
                name: "Phase 4: Exit", period: "March", color: "amber",
                assessments: [
                    { id: "g8-p4-exit", name: "Exit Interview", type: "Major", details: { description: "Final year reflection and goal setting.", when: "Year End.", domains: ["Achievement", "Goals"] } }
                ]
            }
        ]
    },
    9: {
        name: "Grade 9: High School Reality",
        description: "Intensive academics and early stream selection monitoring.",
        phases: [
            {
                name: "Phase 1: Reality Check", period: "June - August", color: "blue",
                assessments: [
                    { id: "g9-p1-baseline", name: "High School Baseline", type: "Major", details: { description: "Rigor readiness and academic shock check.", when: "Week 2.", domains: ["Deep Learning", "Efficiency"] } },
                    { id: "g9-p1-adjustment", name: "Pace Adjustment", type: "Mini", details: { description: "Early burnout and adjustment check.", when: "Late July.", domains: ["Pace", "Load"] } },
                    { id: "g9-p1-burnout", name: "Burnout Monitor", type: "Mini", details: { description: "Brief focus on vitality and time use.", when: "Late August.", domains: ["Vitality", "Time Use"] } }
                ]
            },
            {
                name: "Phase 2: Endurance", period: "Sept - Nov", color: "emerald",
                assessments: [
                    { id: "g9-p2-midterm", name: "Mid-Term Momentum", type: "Major", details: { description: "Long-term stress and endurance monitor.", when: "Mid-year.", domains: ["Endurance", "Purpose"] } },
                    { id: "g9-p2-recovery", name: "Self-Harm Screen", type: "Mini", details: { description: "Critical safety follow-up after midterm stress.", when: "Post-results.", domains: ["Safety", "Support"] } },
                    { id: "g9-p2-career", name: "Early Career Pulse", type: "Mini", details: { description: "Interest and stream curiosity pulse.", when: "Late Nov.", domains: ["Interests", "Clarity"] } }
                ]
            },
            {
                name: "Phase 3: Decision", period: "Jan - Feb", color: "purple",
                assessments: [
                    { id: "g9-p3-decision", name: "Stream Selection", type: "Major", details: { description: "In-depth guide for future stream choices.", when: "Term 3 start.", domains: ["Decisiveness", "Aptitude"] } },
                    { id: "g9-p3-readiness", name: "Career Readiness", type: "Mini", details: { description: "Brief stream confidence check.", when: "Mid Feb.", domains: ["Confidence", "Commitment"] } },
                    { id: "g9-p3-final", name: "Year-End Prep", type: "Mini", details: { description: "Final exam anxiety management.", when: "Late Feb.", domains: ["Anxiety", "Control"] } }
                ]
            },
            {
                name: "Phase 4: Reflection", period: "March", color: "amber",
                assessments: [
                    { id: "g9-p4-exit", name: "Exit Interview", type: "Major", details: { description: "Reflect on year one of high school.", when: "Year End.", domains: ["Achievement", "Balance"] } }
                ]
            }
        ]
    },
    10: {
        name: "Grade 10: The Board Year",
        description: "High-stakes environment with focus on grit and career mapping.",
        phases: [
            {
                name: "Phase 1: Foundation", period: "June - August", color: "blue",
                assessments: [
                    { id: "g10-p1-foundation", name: "Board Baseline", type: "Major", details: { description: "Resilience and goal-targeting set.", when: "Week 1.", domains: ["Resilience", "Goals"] } },
                    { id: "g10-p1-progress", name: "Pressure Check", type: "Mini", details: { description: "Early board pressure and workload check.", when: "Late July.", domains: ["Pressure", "Support"] } },
                    { id: "g10-p1-health", name: "Health & sleep", type: "Mini", details: { description: "Brief sleep and physical burnout pulse.", when: "Late August.", domains: ["Sleep", "Grit"] } }
                ]
            },
            {
                name: "Phase 2: Momentum", period: "Sept - Nov", color: "emerald",
                assessments: [
                    { id: "g10-p2-momentum", name: "Stamina Monitor", type: "Major", details: { description: "Monitoring grit as exams approach.", when: "Mid-year.", domains: ["Stamina", "Endurance"] } },
                    { id: "g10-p2-prep", name: "Mock Prep Pulse", type: "Mini", details: { description: "Brief anxiety check before pre-boards.", when: "Late Oct.", domains: ["Confidence", "Coping"] } },
                    { id: "g10-p2-career", name: "Career Mapping", type: "Mini", details: { description: "Post-board path clarity check.", when: "Late Nov.", domains: ["Clarity", "Pathways"] } }
                ]
            },
            {
                name: "Phase 3: Focus", period: "Jan - Feb", color: "purple",
                assessments: [
                    { id: "g10-p3-focus", name: "Peak Stress Check", type: "Major", details: { description: "Critical health check during peak prep.", when: "Term 3.", domains: ["Clarity", "Stability"] } },
                    { id: "g10-p3-grit", name: "Winter Persistence", type: "Mini", details: { description: "Focus on staying motivated during revision.", when: "Mid Feb.", domains: ["Focus", "Grit"] } },
                    { id: "g10-p3-sprint", name: "Final Sprint", type: "Mini", details: { description: "Last pulse before final board exams.", when: "Late Feb.", domains: ["Calm", "Readiness"] } }
                ]
            },
            {
                name: "Phase 4: Finale", period: "March", color: "amber",
                assessments: [
                    { id: "g10-p4-finale", name: "Exit Interview", type: "Major", details: { description: "Final look at well-being before specialization.", when: "Final.", domains: ["Satisfaction", "Readiness"] } }
                ]
            }
        ]
    }
};

// --- Grade Detail View Component ---
const GradeDetailView = ({ grade, section, onUpdate }: { grade: string, section: string, onUpdate?: () => void }) => {
    const [enabledAssessments, setEnabledAssessments] = useState<EnabledAssessmentsState>({});
    const [highestCompletedIndex, setHighestCompletedIndex] = useState<number>(-1);

    useEffect(() => {
        const fetchState = () => {
            const stored = localStorage.getItem(`grade_${grade}_sec_${section}_progress`);
            setHighestCompletedIndex(stored ? parseInt(stored, 10) : -1);
            const sectionEnabled = JSON.parse(localStorage.getItem(`grade_${grade}_sec_${section}_enabled`) || '{}');
            setEnabledAssessments(sectionEnabled);
        };
        fetchState();
    }, [grade, section]);

    const toggleAssessment = (id: string, mode: 'complete' | 'pause' | 'cancel' = 'complete') => {
        const gradeData = ASSESSMENT_JOURNEY_DATA[parseInt(grade)];
        const allIds = gradeData.phases.flatMap((phase: any) => phase.assessments.map((a: any) => a.id));
        const currentIndex = allIds.indexOf(id);

        setEnabledAssessments(prev => {
            const next = { ...prev };
            const isTurningOn = !prev[id];

            if (mode === 'cancel') {
                next[id] = false;
            } else if (isTurningOn) {
                allIds.forEach(otherId => { next[otherId] = false; });
                next[id] = true;

                // CRITICAL FIX: If we are re-opening a completed session, roll back the progress index
                if (currentIndex <= highestCompletedIndex) {
                    const newHighest = currentIndex - 1;
                    setHighestCompletedIndex(newHighest);
                    localStorage.setItem(`grade_${grade}_sec_${section}_progress`, newHighest.toString());
                }
            } else {
                next[id] = false;
                if (mode === 'complete') {
                    if (currentIndex > highestCompletedIndex) {
                        setHighestCompletedIndex(currentIndex);
                        localStorage.setItem(`grade_${grade}_sec_${section}_progress`, currentIndex.toString());
                    }
                }
            }
            localStorage.setItem(`grade_${grade}_sec_${section}_enabled`, JSON.stringify(next));
            saveEnabledAssessments(next);
            if (onUpdate) onUpdate();
            return next;
        });
    };

    const journey = ASSESSMENT_JOURNEY_DATA[parseInt(grade)];
    const allAssessments = journey.phases.flatMap((p: any) => p.assessments.map((a: any) => ({ ...a, phaseName: p.name, color: p.color })));
    const activeIndex = allAssessments.findIndex((a: any) => enabledAssessments[a.id]);

    return (
        <div className="space-y-10">
            {/* Header for Section Context */}
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-50">{section}</div>
                <div>
                    <h4 className="text-xl font-bold text-slate-900 tracking-tight">Section {section} Detailed Timeline</h4>
                    <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Execute and monitor sequential milestones</p>
                </div>
            </div>

            {/* Vertical Flow Visualizer */}
            <div className="relative pl-10 space-y-14">
                <div className="absolute left-[13px] top-6 bottom-6 w-[1.5px] bg-slate-100/50"></div>

                {journey.phases.map((phase: any, pIdx: number) => (
                    <div key={pIdx} className="relative">
                        <div className="flex items-center gap-4 mb-6 -ml-[38px]">
                            <div className={`w-[20px] h-[20px] rounded-full border-[3px] border-white shadow-md z-20 ${phase.color === 'blue' ? 'bg-blue-600' :
                                phase.color === 'emerald' ? 'bg-emerald-500' :
                                    phase.color === 'purple' ? 'bg-indigo-500' : 'bg-amber-500'
                                }`}></div>
                            <Badge className="bg-slate-100 text-slate-600 text-[9px] font-bold tracking-widest px-4 py-1 rounded-full uppercase">
                                {phase.name} • {phase.period}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {phase.assessments.map((assessment: any) => {
                                const globalIdx = allAssessments.findIndex((a: any) => a.id === assessment.id);
                                let status: 'Completed' | 'Active' | 'Pending' | 'Upcoming' = 'Upcoming';

                                // ORDER MATTERS: Active state must take priority over historic completion
                                if (activeIndex === globalIdx) status = 'Active';
                                else if (globalIdx <= highestCompletedIndex) status = 'Completed';
                                else if (activeIndex === -1 && globalIdx === highestCompletedIndex + 1) status = 'Pending';

                                const isLocked = status === 'Upcoming';

                                return (
                                    <Card key={assessment.id} className={`transition-all duration-300 rounded-[2rem] border-none shadow-sm ${status === 'Active' ? 'ring-2 ring-blue-600 shadow-xl bg-white' :
                                        status === 'Completed' ? 'bg-white opacity-80' :
                                            status === 'Pending' ? 'bg-white hover:shadow-lg transition-all border border-blue-50' : 'bg-slate-50 opacity-60'
                                        }`}>
                                        <CardContent className="p-7">
                                            <div className="flex justify-between items-start mb-6">
                                                <Badge className={`px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest ${status === 'Active' ? 'bg-blue-600 text-white' :
                                                    status === 'Completed' ? 'bg-emerald-500 text-white' :
                                                        status === 'Pending' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                    {status}
                                                </Badge>
                                                <Dialog>
                                                    <DialogTrigger asChild><Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-slate-50"><Info className="w-4 h-4 text-slate-300" /></Button></DialogTrigger>
                                                    <DialogContent className="bg-white rounded-[2.5rem] p-8">
                                                        <DialogHeader><DialogTitle className="text-xl font-bold flex items-center gap-3"><Target className="w-5 h-5 text-blue-600" />{assessment.name}</DialogTitle></DialogHeader>
                                                        <div className="py-6 space-y-6">
                                                            <div className="bg-slate-50 p-5 rounded-2xl">
                                                                <h5 className="text-[9px] uppercase font-bold text-blue-500 tracking-widest mb-2">Context</h5>
                                                                <p className="text-sm text-slate-600 font-medium leading-relaxed">{assessment.details?.description}</p>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">{assessment.details?.domains?.map((d: any, i: number) => <Badge key={i} variant="outline" className="rounded-lg px-3 py-1 text-[9px] font-bold border-slate-100 text-slate-400">{d}</Badge>)}</div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>

                                            <h5 className="font-bold text-sm text-slate-800 mb-6 leading-tight h-10 line-clamp-2">{assessment.name}</h5>

                                            <div className="space-y-2">
                                                {status === 'Active' ? (
                                                    <div className="space-y-2">
                                                        <Dialog>
                                                            <DialogTrigger asChild><Button className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-blue-50">End Assessment</Button></DialogTrigger>
                                                            <DialogContent className="bg-white rounded-[2rem] p-10">
                                                                <DialogHeader><DialogTitle className="text-xl font-bold">Complete Assessment?</DialogTitle></DialogHeader>
                                                                <p className="text-slate-500 font-medium py-4 text-sm">Finishing <strong>{assessment.name}</strong> will record participation and unlock the next step.</p>
                                                                <DialogFooter><Button onClick={() => toggleAssessment(assessment.id, 'complete')} className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest">End Now</Button></DialogFooter>
                                                            </DialogContent>
                                                        </Dialog>
                                                        <div className="flex gap-2">
                                                            <Button onClick={() => toggleAssessment(assessment.id, 'pause')} className="flex-1 h-8 bg-amber-50 text-amber-600 font-bold text-[8px] rounded-lg border border-amber-100 hover:bg-amber-100 transition-colors uppercase">Pause</Button>
                                                            <Button onClick={() => toggleAssessment(assessment.id, 'cancel')} className="flex-1 h-8 bg-red-50 text-red-600 font-bold text-[8px] rounded-lg border border-red-100 hover:bg-red-100 transition-colors uppercase">Cancel</Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button disabled={isLocked} variant="outline" className={`w-full h-10 text-[10px] font-bold rounded-xl transition-all uppercase tracking-widest ${status === 'Completed' ? 'text-emerald-500 border-emerald-100' :
                                                                status === 'Pending' ? 'text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white bg-white' : 'text-slate-200 border-slate-50'
                                                                }`}>
                                                                {status === 'Completed' ? 'Re-open Session' : status === 'Pending' ? 'Start Assessment' : <Lock className="w-3.5 h-3.5 mx-auto opacity-30" />}
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="bg-white rounded-[2rem] p-10">
                                                            <DialogHeader><DialogTitle className="text-xl font-bold">{status === 'Completed' ? 'Re-open Session?' : 'Start Assessment?'}</DialogTitle></DialogHeader>
                                                            <p className="text-slate-400 font-medium py-4 text-sm">
                                                                {status === 'Completed'
                                                                    ? `This will move "${assessment.name}" back to Active status, allowing students in Section ${section} to continue their responses.`
                                                                    : `This will broadcast "${assessment.name}" to students in Section ${section} immediately.`}
                                                            </p>
                                                            <DialogFooter><Button onClick={() => toggleAssessment(assessment.id, 'complete')} className="w-full h-12 rounded-xl bg-blue-600 text-white font-bold text-[10px] uppercase tracking-widest">
                                                                {status === 'Completed' ? 'Confirm Re-open' : 'Confirm Start'}
                                                            </Button></DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Main Page Component ---
export const AssessmentManagementView: React.FC = () => {
    const [stats, setStats] = useState<Record<string, GradeAssessmentStats | null>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [expandedGrades, setExpandedGrades] = useState<Record<string, boolean>>({ '6': true });
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const [selectedSections, setSelectedSections] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        GRADES.forEach(g => initial[g] = 'A');
        return initial;
    });

    useEffect(() => {
        const fetchAll = async () => {
            setIsLoading(true);
            const results = await Promise.all(GRADES.map(async g => {
                const s = await getGradeAssessmentStats(g);
                return { grade: g, stats: s };
            }));
            const map: any = {};
            results.forEach(r => map[r.grade] = r.stats);
            setStats(map);
            setIsLoading(false);
        };
        fetchAll();
    }, [refreshTrigger]);

    // Derive current phase and assessment for the grade summary card
    const getGradeFocus = (grade: string, section: string) => {
        const journey = ASSESSMENT_JOURNEY_DATA[parseInt(grade)];
        const allAssessments = journey.phases.flatMap((p: any) => p.assessments.map((a: any) => ({ ...a, phaseName: p.name })));

        const stored = localStorage.getItem(`grade_${grade}_sec_${section}_progress`);
        const highestIdx = stored ? parseInt(stored, 10) : -1;
        const sectionEnabled = JSON.parse(localStorage.getItem(`grade_${grade}_sec_${section}_enabled`) || '{}');
        const activeIdx = allAssessments.findIndex((a: any) => sectionEnabled[a.id]);

        if (activeIdx !== -1) {
            return { phase: allAssessments[activeIdx].phaseName, task: allAssessments[activeIdx].name, status: 'Active' };
        } else if (highestIdx + 1 < allAssessments.length) {
            return { phase: allAssessments[highestIdx + 1].phaseName, task: allAssessments[highestIdx + 1].name, status: 'Upcoming' };
        }
        return { phase: "Completed", task: "Cycle Ended", status: "Done" };
    };

    const toggleGradeExpansion = (grade: string) => {
        setExpandedGrades(prev => ({ ...prev, [grade]: !prev[grade] }));
    };

    if (isLoading) return <div className="flex h-screen items-center justify-center bg-white"><div className="flex flex-col items-center gap-6"><div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div><p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">Preparing Dashboard...</p></div></div>;

    return (
        <div className="w-full max-w-[1700px] mx-auto p-6 md:p-10 space-y-8 min-h-screen bg-[#FDFDFF]">
            {/* Guidance Note Header */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 flex items-start gap-6 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0"><AlertCircle className="w-6 h-6 text-blue-600" /></div>
                <div className="space-y-2">
                    <h2 className="text-base font-bold text-slate-800">Principals Management Note</h2>
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
                        <p className="text-sm font-medium text-slate-500"><span className="text-blue-600 font-bold mr-2">1.</span> Select a Grade Card to view current Phase and Task status.</p>
                        <p className="text-sm font-medium text-slate-500"><span className="text-blue-600 font-bold mr-2">2.</span> Access specific Sections (A-D) and click 'Start Assessment' to begin.</p>
                        <p className="text-sm font-medium text-slate-500"><span className="text-blue-600 font-bold mr-2">3.</span> Use 'End Assessment' to finalize and progress to the next step.</p>
                    </div>
                </div>
            </div>

            {/* Assessment Orchestrator Cards */}
            <div className="space-y-6">
                {GRADES.map(grade => {
                    const isExpanded = expandedGrades[grade] || false;
                    const gStats = stats[grade];
                    const activeSection = selectedSections[grade];
                    const focus = getGradeFocus(grade, activeSection);
                    const completion = gStats && gStats.totalStudents > 0 ? Math.round((gStats.completedStudents / gStats.totalStudents) * 100) : 0;

                    return (
                        <Card key={grade} className={`group overflow-hidden transition-all duration-500 border-none shadow-sm ${isExpanded ? 'ring-2 ring-blue-100 shadow-xl bg-white' : 'hover:shadow-lg bg-white cursor-pointer'}`}>
                            {/* Summary View */}
                            <div
                                onClick={() => toggleGradeExpansion(grade)}
                                className="p-8 flex items-center justify-between gap-8"
                            >
                                <div className="flex items-center gap-10 flex-1 min-w-0">
                                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl font-bold flex-shrink-0 transition-all ${isExpanded ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                                        {grade}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-5 mb-3">
                                            <h3 className="text-xl font-bold text-slate-800 tracking-tight">Grade {grade} </h3>
                                            <Badge className="bg-slate-50 text-slate-400 border-none px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest whitespace-nowrap">No. of Students: {gStats?.totalStudents || 0}</Badge>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <div className="flex-1 max-w-[200px] h-2 bg-slate-100 rounded-full overflow-hidden flex-shrink-0">
                                                <div className={`h-full transition-all duration-1000 ${completion > 75 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${completion}%` }} />
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className="text-xl font-bold text-slate-800 leading-none">{completion}%</span>
                                                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest"> Progress</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* QUICK INSIGHTS FOR PRINCIPAL */}
                                    <div className="hidden xl:flex flex-col gap-1.5 flex-1 border-l border-slate-50 pl-10">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Current Phase:</span>
                                            <span className="text-[10px] font-bold text-blue-600">{focus.phase}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Active Task:</span>
                                            <span className="text-[11px] font-bold text-slate-900 truncate max-w-[180px]">{focus.task}</span>
                                        </div>
                                    </div>

                                    {/* Section Selector */}
                                    <div className="hidden lg:flex items-center gap-2 px-8 border-l border-r border-slate-50">
                                        {['A', 'B', 'C', 'D'].map(s => (
                                            <button
                                                key={s}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedSections(prev => ({ ...prev, [grade]: s }));
                                                }}
                                                className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold transition-all border ${activeSection === s
                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md scale-110'
                                                    : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-blue-200 hover:text-blue-600'
                                                    }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`transition-all duration-300 p-2.5 rounded-2xl ${isExpanded ? 'bg-blue-600 text-white rotate-90 shadow-lg' : 'bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                    {!isExpanded && <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest animate-pulse">Click to Manage</span>}
                                </div>
                            </div>

                            {/* Detail Timeline View */}
                            <div className={`transition-all duration-700 ease-[cubic-bezier(0.16, 1, 0.3, 1)] overflow-hidden ${isExpanded ? 'max-h-[6000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                <div className="px-8 pb-8 pt-2">
                                    <div className="bg-[#F8FAFF] rounded-[3rem] p-10 border border-blue-50 shadow-inner">
                                        <GradeDetailView grade={grade} section={activeSection} onUpdate={() => setRefreshTrigger(t => t + 1)} />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
            <div className="h-20"></div>
        </div>
    );
};
