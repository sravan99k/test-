import React from 'react';
import PersonalizedDashboard from '@/components/student-dashboard/personalized/PersonalizedDashboard';

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Wellness Dashboard</h1>
      <PersonalizedDashboard onNavigateToGoals={() => window.location.href = '/wellness/goals'} />
    </div>
  );
}
