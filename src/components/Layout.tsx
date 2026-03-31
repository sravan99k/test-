import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import { useAuth } from '@/hooks/useAuth';

export const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const isTeacherDashboard = location.pathname.startsWith('/teacher-dashboard');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hide navigation for teacher dashboard pages */}
      {!isTeacherDashboard && (
        <header className="sticky top-0 z-50 w-full">
          <Navigation />
        </header>
      )}
      
      {/* Main content area that will change with routes */}
      <main className={`flex-1 ${isTeacherDashboard ? 'pt-0' : ''}`}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
