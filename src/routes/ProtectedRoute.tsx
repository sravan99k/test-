import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

import { UserRoleType } from '@/types/auth';

interface ProtectedRouteProps {
  allowedRoles?: UserRoleType[];
  redirectTo?: string;
}

export const ProtectedRoute = ({
  allowedRoles = ['student', 'management', 'teacher', 'admin', 'organization'],
  redirectTo = '/auth',
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // If user's role is not allowed, redirect to appropriate dashboard
  const userRole = user.role as 'student' | 'management' | 'teacher' | 'admin' | 'organization' | undefined;
  if (userRole && !allowedRoles.includes(userRole)) {
    const defaultRoute =
      userRole === 'admin' ? '/admin' :
        userRole === 'organization' ? '/organization-dashboard' :
          userRole === 'management' ? '/school-dashboard' :
            userRole === 'teacher' ? '/teacher-dashboard' :
              '/student-dashboard';
    return <Navigate to={defaultRoute} replace />;
  }

  // If user is authenticated and has the right role, render the child routes
  return <Outlet />;
};