
import React from 'react';
import { AssessmentManagementView } from '@/components/management/assessments/AssessmentManagementView';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

export default function AssessmentManagementPage() {
    const { user, loading } = useAuth();

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
        <div className="min-h-screen bg-gray-50/30">
            <div className="container mx-auto px-6 py-6 font-geist">
                <AssessmentManagementView />
            </div>
        </div>
    );
}
