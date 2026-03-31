import React from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { GeminiChat } from '@/components/chat/GeminiChat';


import OnboardingTour from '@/components/OnboardingTour';

const TeacherLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation Header */}
      <Navigation />
      <OnboardingTour />

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full">
        <Outlet />
      </main>

      {/* Floating Chat Widget and Help Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <GeminiChat />
      </div>

    </div>
  );
};

export default TeacherLayout;