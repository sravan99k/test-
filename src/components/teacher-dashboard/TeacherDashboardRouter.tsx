import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import TeacherDashboard from '@/teacher/pages/TeacherDashboard';

const TeacherDashboardRouter: React.FC = () => {
  const { user, loading } = useAuth();

  // If no user is logged in and not loading, show a message
  if (!user && !loading) {
    return <div>Please log in to access the teacher dashboard.</div>;
  }

  // The TeacherLayout will handle the navigation and layout
  // We just need to return the dashboard content here
  return <TeacherDashboard />;
};

export default TeacherDashboardRouter;
