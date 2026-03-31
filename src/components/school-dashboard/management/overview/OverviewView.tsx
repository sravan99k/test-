import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Users,
    GraduationCap,
    AlertTriangle,
    BookOpen,
    UserPlus,
    ArrowRight,
    FileText,
    TrendingUp,
    PieChart as PieChartIcon,
    BarChart3
} from 'lucide-react';
import { fetchSchoolAnalytics, SchoolAnalytics, fetchSchoolInfo, getSchoolSettings } from '@/services/schoolDataService';
import { useAuth } from '@/hooks/useAuth';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    PieChart,
    Pie,
    Cell
} from 'recharts';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface OverviewViewProps {
    onNavigate?: (tab: string) => void;
    onLoaded?: () => void;
}

export function OverviewView({ onNavigate, onLoaded }: OverviewViewProps) {
    const { user } = useAuth();
    const [stats, setStats] = useState<SchoolAnalytics | null>(null);
    const [schoolInfo, setSchoolInfo] = useState<any>(null);
    const [academicYear, setAcademicYear] = useState<string>('');
    const [currentTerm, setCurrentTerm] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, [user]);

    const loadStats = async () => {
        try {
            if (!user) return;
            const [analyticsData, info, settings] = await Promise.all([
                fetchSchoolAnalytics({
                    school: '', branch: '', state: '', city: '', pincode: ''
                }),
                fetchSchoolInfo(),
                getSchoolSettings()
            ]);
            setStats(analyticsData);
            setSchoolInfo(info);
            setAcademicYear(settings?.academicYear || '2024-25');
            setCurrentTerm(settings?.term || 'Term 1');
            onLoaded?.();
        } catch (error) {
            console.error("Failed to load analytics", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return null;
    }

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    const completionRate = stats.totalStudents > 0 ? ((stats.totalAssessments / stats.totalStudents) * 100).toFixed(1) : "0";

    const wellnessChartData = [
        { name: 'Thriving', value: stats.wellnessDistribution.thriving, color: '#10b981' },
        { name: 'Stable', value: stats.wellnessDistribution.stable, color: '#3b82f6' },
        { name: 'Needs Support', value: stats.wellnessDistribution.needsSupport, color: '#f59e0b' },
        { name: 'At Risk', value: stats.wellnessDistribution.atRisk, color: '#ef4444' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome Greeting - Matching User Image */}
            <div className="text-center py-6 space-y-2">
                <h1 className="text-4xl font-bold text-[#1e293b]">{getTimeGreeting()}, {schoolInfo?.name || schoolInfo?.schoolName || 'School Administrator'}</h1>
                <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
                    Welcome to your school dashboard. Monitor student wellness and academic progress in real-time.
                </p>
            </div>

            <div id="management-overview-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={<Users className="h-4 w-4 text-gray-400" />}
                    trend="From all grades"
                    trendColor="text-gray-500"
                />
                <StatsCard
                    title="Assessments Completed"
                    value={stats.totalAssessments}
                    icon={<FileText className="h-4 w-4 text-gray-400" />}
                    trend={`${completionRate}% completion rate`}
                    trendColor="text-gray-500"
                />
                <StatsCard
                    title="High Risk Students"
                    value={stats.highRiskStudents}
                    icon={<AlertTriangle className="h-4 w-4 text-red-400" />}
                    trend={`Requiring Attention`}
                    trendColor="text-red-500"
                    highlight={stats.highRiskStudents > 0}
                />
                <StatsCard
                    title="Overall Wellbeing"
                    value={stats.averageWellbeingScore.toFixed(1)}
                    icon={<BarChart3 className="h-4 w-4 text-gray-400" />}
                    trend="Based on latest assessments"
                    trendColor="text-gray-500"
                />
            </div>

            {/* Charts Section - Image 2 */}
            <div id="management-overview-charts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assessment Completion Bar Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <div className="space-y-0.5">
                            <CardTitle className="text-xl font-bold">Assessment Completion</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.gradeCompletionData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                                <Bar dataKey="total" name="Total Students" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={30} />
                                <Bar dataKey="completed" name="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="text-center text-xs text-slate-500 -mt-2 relative z-10">
                            Overall completion rate: {completionRate}%
                        </div>
                    </CardContent>
                </Card>

                {/* Wellness Distribution Donut Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl font-bold">Wellness Distribution</CardTitle>
                        <CardDescription>Overview of student wellness status across all grades</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[320px] relative flex flex-col pt-0">
                        <div className="h-[220px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={wellnessChartData.some(d => d.value > 0) ? wellnessChartData : [{ name: 'No Data', value: 1, color: '#f1f5f9' }]}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={65}
                                        outerRadius={90}
                                        paddingAngle={wellnessChartData.some(d => d.value > 0) ? 5 : 0}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {wellnessChartData.some(d => d.value > 0) ? (
                                            wellnessChartData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))
                                        ) : (
                                            <Cell fill="#f1f5f9" />
                                        )}
                                    </Pie>
                                    {wellnessChartData.some(d => d.value > 0) && <Tooltip />}
                                </PieChart>
                            </ResponsiveContainer>
                            {!wellnessChartData.some(d => d.value > 0) && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-slate-400 font-bold text-sm">No Data</span>
                                    <span className="text-slate-300 text-[10px]">Pending Assessments</span>
                                </div>
                            )}
                        </div>
                        {/* Legend matching Image 2 */}
                        <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-2 px-1">
                            {wellnessChartData.map((item) => {
                                const totalWellnessCount = wellnessChartData.reduce((acc, curr) => acc + curr.value, 0);
                                return (
                                    <div key={item.name} className="flex items-center gap-2 text-[11px] font-semibold text-slate-600 min-w-0">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                        <span className="truncate whitespace-nowrap">
                                            {item.name}
                                            <span className="ml-1 text-slate-400 font-medium">
                                                ({totalWellnessCount > 0 ? Math.round((item.value / totalWellnessCount) * 100) : 0}%)
                                            </span>
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Action Needed Section - Image 3 Style Toggle */}
            {stats.totalStudents === 0 && (
                <Card className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 border-blue-100/50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <UserPlus className="w-32 h-32" />
                    </div>
                    <CardContent className="p-8 text-center flex flex-col items-center relative z-10">
                        <div className="bg-white p-3 rounded-full mb-4 shadow-sm ring-4 ring-blue-50">
                            <UserPlus className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Let's Get Started</h3>
                        <p className="text-slate-600 max-w-lg mb-8 leading-relaxed">
                            Your dashboard is looking a bit empty. Start by adding your students and teachers to unlock the full potential of the platform.
                        </p>
                        <div className="flex flex-wrap gap-4 justify-center">
                            <Button onClick={() => onNavigate?.('students')} size="lg" className="bg-blue-600 hover:bg-blue-700 h-12 px-8 rounded-xl">
                                Add Students
                            </Button>
                            <Button onClick={() => onNavigate?.('teachers')} size="lg" variant="outline" className="bg-white h-12 px-8 rounded-xl border-slate-200">
                                Add Teachers
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bottom Row - Quick Actions & Status (Image 3 Bottom) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card id="management-overview-quick-actions" className="border-slate-200/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-50">
                        <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            <button
                                onClick={() => onNavigate?.('students')}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        <UserPlus className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-slate-700">Add New Student</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                            </button>
                            <button
                                onClick={() => onNavigate?.('assignments')}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                        <BookOpen className="h-4 w-4" />
                                    </div>
                                    <span className="font-medium text-slate-700">Manage Assignments</span>
                                </div>
                                <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
                            </button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-slate-200/60 shadow-sm">
                    <CardHeader className="pb-3 border-b border-slate-50">
                        <CardTitle className="text-base font-semibold">System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Academic Year</span>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-900 font-bold border-none">{academicYear}</Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">Current Phase</span>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 font-bold border-none">{currentTerm}</Badge>
                            </div>
                            <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon, trend, trendColor, highlight, valueColor }: any) {
    return (
        <Card className={cn(
            "border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-300",
            highlight && "border-red-100 bg-red-50/30"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-500">{title}</CardTitle>
                <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-white transition-colors">
                    {icon}
                </div>
            </CardHeader>
            <CardContent>
                <div className={cn("text-3xl font-bold tracking-tight text-slate-900", valueColor)}>{value}</div>
                <p className={cn("text-xs mt-1 font-medium", trendColor)}>
                    {trend}
                </p>
            </CardContent>
        </Card>
    )
}

