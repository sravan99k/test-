import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import StudentListPage from './StudentListPage';

const StudentListRouter: React.FC = () => {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return null;
  }

  // If no user is logged in, show a message
  if (!user) {
    return <div>Please log in to access the student list.</div>;
  }

  // The TeacherLayout will handle the navigation and layout
  // We just need to return the student list content here
  return <StudentListPage />;
};

export default StudentListRouter;
