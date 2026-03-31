import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import { GeminiChat } from './student-dashboard/chat/GeminiChat';
import FloatingActionButton from './shared/FloatingActionButton';
import { useAuth } from '@/hooks/useAuth';
import OnboardingTour from './OnboardingTour';

export const AppLayout = () => {
  const location = useLocation();
  const { user, loading } = useAuth();
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  // Skip layout for auth page and teacher dashboard (since TeacherLayout handles its own navigation)
  if (location.pathname === '/auth' || location.pathname.startsWith('/teacher')) {
    return <Outlet />;
  }

  // Show a clean full-screen loader while auth state is initializing
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="Novo Wellness" className="h-16 w-auto animate-pulse" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  // Hide BuddyBot (GeminiChat) for organization routes, including organization dashboard
  const isOrganizationArea =
    location.pathname.startsWith('/organization') ||
    location.pathname.startsWith('/organization-');

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <OnboardingTour />

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Floating Chat Widget and Help Button - only for non-admin and non-management users */}
      {user?.role !== 'admin' && user?.role !== 'management' && (
        <>
          {!isOrganizationArea && (
            <div className="fixed bottom-6 right-6 z-50">
              <GeminiChat isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
            </div>
          )}

          {/* Show help button for students and teachers only */}
          {(user?.role === 'student' || user?.role === 'teacher') && <FloatingActionButton isChatOpen={isChatOpen} />}
        </>
      )}
    </div>
  );
};

export default AppLayout;