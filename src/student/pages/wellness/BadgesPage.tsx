import React from 'react';
import AchievementBadges from '@/components/gamification/AchievementBadges';

export default function BadgesPage() {
  return (
    <div id="wellness-badges-section">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Achievement Badges</h1>
      <AchievementBadges />
    </div>
  );
}
