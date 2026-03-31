import React from 'react';
import WellnessGoals from '@/components/goals/WellnessGoals';

export default function GoalsPage() {
  return (
    <div id="wellness-goals-section">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Wellness Goals</h1>
      <WellnessGoals />
    </div>
  );
}
