import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, Settings } from 'lucide-react';
import { StudentManagementView } from '@/components/school-dashboard/management/students/StudentManagementView';
import { TeacherManagementView } from '@/components/school-dashboard/management/teachers/TeacherManagementView';
import { AssignmentManagementView } from '@/components/school-dashboard/management/assignments/AssignmentManagementView';
import { AcademicSettingsView } from '@/components/school-dashboard/management/academic/AcademicSettingsView';
import { useAuth } from '@/hooks/useAuth';
import { Navigate, useSearchParams } from 'react-router-dom';
import { ManagementProvider } from '@/contexts/ManagementContext';

export default function UnifiedManagementPage() {
    const { user, loading } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'students');

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab) setActiveTab(tab);
        else setActiveTab('students');
    }, [searchParams]);

    const handleTabChange = (val: string) => {
        setActiveTab(val);
        setSearchParams({ tab: val });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500" />
            </div>
        );
    }

    // Redirect if not principal/management role
    if (!user || user.role !== 'management') {
        return <Navigate to="/auth" replace />;
    }

    return (
        <ManagementProvider>
            <div className="min-h-screen bg-gray-50/30">
                {/* Main content */}
                <div className="container mx-auto px-6 py-6 font-geist">
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
                        {/* Tab Navigation - No Overview here anymore */}
                        <TabsList className="grid w-full max-w-4xl grid-cols-4 mx-auto bg-white/80 backdrop-blur-xl shadow-lg shadow-gray-200/50 border border-gray-100 p-1 h-auto rounded-full">
                            <TabsTrigger value="teachers" className="rounded-full py-3 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all ease-in-out duration-300 font-bold text-sm">
                                <GraduationCap className="h-4 w-4" />
                                Teachers
                            </TabsTrigger>
                            <TabsTrigger value="students" className="rounded-full py-3 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all ease-in-out duration-300 font-bold text-sm">
                                <Users className="h-4 w-4" />
                                Students
                            </TabsTrigger>

                            <TabsTrigger value="assignments" className="rounded-full py-3 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all ease-in-out duration-300 font-bold text-sm">
                                <BookOpen className="h-4 w-4" />
                                Assignments
                            </TabsTrigger>
                            <TabsTrigger value="academic" className="rounded-full py-3 flex items-center justify-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all ease-in-out duration-300 font-bold text-sm">
                                <Settings className="h-4 w-4" />
                                School Setup
                            </TabsTrigger>
                        </TabsList>

                        {/* Tab Content */}
                        <TabsContent value="students" className="space-y-4 animate-in fade-in-50 duration-500">
                            <StudentManagementView />
                        </TabsContent>

                        <TabsContent value="teachers" className="space-y-4 animate-in fade-in-50 duration-500">
                            <TeacherManagementView />
                        </TabsContent>



                        <TabsContent value="assignments" className="space-y-4 animate-in fade-in-50 duration-500">
                            <AssignmentManagementView />
                        </TabsContent>

                        <TabsContent value="academic" className="space-y-4 animate-in fade-in-50 duration-500">
                            <AcademicSettingsView />
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </ManagementProvider>
    );
}
