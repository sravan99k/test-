import React, { useState, useMemo, useEffect } from "react";
import { Search, Activity, Download, FileText, LayoutGrid, Heart, Layout, Brain, ChevronRight, CheckCircle, Users, Filter, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StudentDetailView from "@/components/teacher-dashboard/StudentDetailView";
import { subscribeToTeacherStudents, TeacherStudent } from "@/services/teacherDataService";
import { useToast } from "@/hooks/use-toast";
import recommendations from "@/data/recommendations.json";

import { useSearchParams } from "react-router-dom";

const StudentListPage = () => {
    const { toast } = useToast();
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");
    const [classFilter, setClassFilter] = useState("all");
    const [domainFilter, setDomainFilter] = useState("all");
    const [domainFilterCode, setDomainFilterCode] = useState("all");
    const [phaseFilter, setPhaseFilter] = useState(1);
    const [selectedStudent, setSelectedStudent] = useState<TeacherStudent | null>(null);
    const [students, setStudents] = useState<TeacherStudent[]>([]);

    useEffect(() => {
        let unsubscribe: any;
        const setup = async () => {
            unsubscribe = await subscribeToTeacherStudents(setStudents);
        };
        setup();
        return () => { if (unsubscribe) unsubscribe(); };
    }, []);

    const classStats = useMemo(() => {
        const unique = Array.from(new Set(students.map(s => s.class))).sort();
        return { unique, total: students.length };
    }, [students]);

    const filteredStudents = useMemo(() => {
        const activeFilter = searchParams.get('filter');

        return students.filter(s => {
            const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.uid && s.uid.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesClass = classFilter === "all" || s.class === classFilter;

            // Handle high-risk filter from dashboard
            if (activeFilter === 'high-risk' && s.riskLevel !== 'high') return false;

            // Mock domain matching for demonstration
            const matchesDomain = domainFilterCode === "all" ||
                (s.uid === 'mock-high-risk' && domainFilterCode === 'E-EMO') ||
                (Math.random() > 0.7);

            return matchesSearch && matchesClass && matchesDomain;
        });
    }, [students, searchTerm, classFilter, domainFilterCode, searchParams]);

    const getWellbeingColor = (score: number) => {
        if (score >= 70) return "text-green-600";
        if (score >= 40) return "text-orange-600";
        return "text-red-600";
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans selection:bg-indigo-100">
            {/* Main Content: High legibility, Scannable */}
            <main className="flex-1 overflow-y-auto px-10 py-12">
                <div className="max-w-5xl mx-auto space-y-8">
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl font-heading font-semibold text-slate-900 tracking-tight">Student Directory</h1>
                            <p className="text-slate-500 text-sm font-medium">Monitoring {filteredStudents.length} active profiles</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Find student by ID or name..."
                                    className="pl-10 w-72 h-11 bg-white border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 transition-all font-medium"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button variant="outline" className="h-11 rounded-xl border-slate-200 gap-2 font-semibold text-slate-600 hover:bg-slate-50">
                                <Download className="h-4 w-4" />
                                Export
                            </Button>
                        </div>
                    </header>

                    <section className="space-y-6">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                            <button
                                onClick={() => setClassFilter('all')}
                                className={`px-4 py-2 text-sm font-bold transition-all relative ${classFilter === 'all' && !searchParams.get('filter') ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                All Classes
                                {classFilter === 'all' && !searchParams.get('filter') && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
                            </button>
                            {classStats.unique.map(cls => (
                                <button
                                    key={cls}
                                    onClick={() => setClassFilter(cls)}
                                    className={`px-4 py-2 text-sm font-bold transition-all relative ${classFilter === cls ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Grade {cls}
                                    {classFilter === cls && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 rounded-full" />}
                                </button>
                            ))}

                            {searchParams.get('filter') === 'high-risk' && (
                                <Badge className="ml-4 bg-red-50 text-red-600 border-red-100 gap-1 pr-1 hover:bg-red-50">
                                    High Risk Only
                                    <button
                                        onClick={() => {
                                            const newParams = new URLSearchParams(searchParams);
                                            newParams.delete('filter');
                                            setSearchParams(newParams);
                                        }}
                                        className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
                                    >
                                        <AlertCircle className="h-3 w-3" />
                                    </button>
                                </Badge>
                            )}
                        </div>

                        <div className="space-y-3">
                            {filteredStudents.length === 0 ? (
                                <div className="py-20 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                                    <span className="text-slate-400 text-sm font-medium">No results match your filters</span>
                                </div>
                            ) : (
                                filteredStudents.map((student) => (
                                    <div
                                        key={student.uid}
                                        className="group bg-white border border-slate-100 rounded-2xl p-5 flex items-center gap-6 hover:border-indigo-100 hover:shadow-sm transition-all duration-300"
                                    >
                                        <div className="relative">
                                            <Avatar className="h-14 w-14 rounded-xl ring-2 ring-slate-50 group-hover:ring-indigo-50 transition-all">
                                                <AvatarImage src={student.avatar} className="object-cover" />
                                                <AvatarFallback className="bg-slate-50 text-slate-400 font-semibold text-lg">
                                                    {student.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                                                    {student.name}
                                                </h3>
                                                <div className="flex gap-1.5">
                                                    {student.assessments && student.assessments.length > 0 && student.wellbeingScore < 40 && student.engagementRate > 70 && (
                                                        <Badge className="bg-red-50 text-red-600 hover:bg-red-50 border-red-100 text-[10px] font-medium px-2 py-0.5">Masking Risk</Badge>
                                                    )}
                                                    {student.assessments && student.assessments.length > 0 && student.wellbeingScore > 80 && student.engagementRate < 30 && student.engagementRate > 0 && (
                                                        <Badge className="bg-orange-50 text-orange-600 hover:bg-orange-50 border-orange-100 text-[10px] font-medium px-2 py-0.5">Detached</Badge>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                                                <span>ID: {student.uid}</span>
                                                <span className="h-1 w-1 rounded-full bg-slate-200" />
                                                <span>Grade {student.class} • Phase {student.currentPhaseId || 1}</span>
                                            </div>

                                            {/* Critical Domains Section */}
                                            {student.assessments && student.assessments.length > 0 && (
                                                <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-50">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">Concerns:</span>
                                                    <div className="flex flex-wrap gap-1.5 items-center">
                                                        {(() => {
                                                            const latest = student.assessments[0];
                                                            const domainScores = latest.domainScores || {};
                                                            const criticalCodes = Object.entries(domainScores)
                                                                .filter(([_, score]) => score < 60)
                                                                .sort(([_, a], [__, b]) => a - b)
                                                                .map(([code]) => code);

                                                            const displayCodes = criticalCodes.slice(0, 2);
                                                            const remaining = criticalCodes.length - 2;

                                                            // Guard: If wellbeing is low but we have no domain scores yet
                                                            if (student.wellbeingScore < 60 && criticalCodes.length === 0) {
                                                                return <span className="text-[10px] font-medium text-slate-400 italic">Analysis Processing...</span>;
                                                            }

                                                            if (criticalCodes.length === 0) {
                                                                return <span className="text-[10px] font-bold text-green-600">On Track</span>;
                                                            }

                                                            return (
                                                                <>
                                                                    {displayCodes.map(code => {
                                                                        const domainName = recommendations.find(r => r.code === code)?.domain || code;
                                                                        return (
                                                                            <button
                                                                                key={code}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    setSelectedStudent(student);
                                                                                }}
                                                                                className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded text-[10px] font-medium hover:bg-red-100 transition-colors"
                                                                            >
                                                                                {domainName}
                                                                            </button>
                                                                        );
                                                                    })}
                                                                    {remaining > 0 && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedStudent(student);
                                                                            }}
                                                                            className="text-[10px] font-semibold text-red-400 hover:text-red-600 transition-colors"
                                                                        >
                                                                            + {remaining} more
                                                                        </button>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-10">
                                            <div className="text-center w-20">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Wellbeing</p>
                                                <p className={`text-xl font-heading font-semibold ${student.wellbeingScore === 0 && (!student.assessments || student.assessments.length === 0) ? "text-slate-300" : getWellbeingColor(student.wellbeingScore || 0)}`}>
                                                    {student.wellbeingScore === 0 && (!student.assessments || student.assessments.length === 0) ? "—" : `${student.wellbeingScore}%`}
                                                </p>
                                            </div>

                                            <div className="w-32 space-y-2">
                                                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                                    <span>Engagement</span>
                                                    <span className="text-slate-600">{student.engagementRate || 0}%</span>
                                                </div>
                                                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full bg-indigo-500 transition-all duration-700`} style={{ width: `${student.engagementRate || 4}%` }} />
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() => setSelectedStudent(student)}
                                                variant="ghost"
                                                className="h-11 rounded-xl font-bold text-xs uppercase tracking-wide text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 gap-2 px-4 border border-indigo-100"
                                            >
                                                Details
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </section>
                </div>
            </main>

            {selectedStudent && (
                <StudentDetailView
                    student={selectedStudent}
                    onClose={() => setSelectedStudent(null)}
                />
            )}
        </div>
    );
};

export default StudentListPage;
