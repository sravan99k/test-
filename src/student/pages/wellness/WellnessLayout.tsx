import React, { ReactNode, useCallback } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavItem {
  value: string;
  label: string;
  tooltip: string;
  path: string;
}

const WellnessLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || 'dashboard';

  // Smooth scroll to the main content section
  const scrollToJourney = useCallback(() => {
    const el = document.getElementById('wellness-journey');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const navItems: NavItem[] = [
    { value: 'dashboard', label: 'Dashboard', tooltip: 'Overview of your wellness stats', path: '/wellness/dashboard' },
    { value: 'mood', label: 'Mood', tooltip: 'Track your daily mood', path: '/wellness/mood' },
    { value: 'journal', label: 'Journal', tooltip: 'Guided journaling exercises', path: '/wellness/journal' },
    { value: 'goals', label: 'Goals', tooltip: 'Set and track wellness goals', path: '/wellness/goals' },
    { value: 'badges', label: 'Badges', tooltip: 'Earn badges for progress', path: '/wellness/badges' },

  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="relative  mb-10 p-8 flex flex-col md:flex-row items-center justify-between overflow-hidden min-h-[300px]">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/wellness.webp"
            alt="Wellness Background"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability */}
          {/* <div className="absolute inset-0 bg-gradient-to-r from-teal-900/80 to-blue-900/60"></div> */}
        </div>

        <div className="z-10 max-w-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome to Your Wellness Journey</h2>
          <p className="text-lg text-teal-100 mb-4 max-w-xl">
            Every step counts. Track your progress, set goals, and connect with a supportive community.
          </p>
          <div className="italic text-teal-200 mb-4">
            "Taking care of your mind is the first step to unlocking your true potential."
          </div>

        </div>
      </div>

      <div id="wellness-journey" className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex justify-center">
            <div id="onboarding-wellness-nav" className="inline-flex bg-blue-50 rounded-full p-1">
              <ul className="flex flex-wrap justify-center gap-1">
                {navItems.map((item) => (
                  <li key={item.value} className="relative group">
                    <Link
                      id={`onboarding-wellness-${item.value}`}
                      to={item.path}
                      className={cn(
                        'block px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-full',
                        currentPath === item.value
                          ? 'bg-blue-600 text-white'
                          : 'text-blue-600'
                      )}
                      aria-label={item.tooltip}
                    >
                      {item.label}
                    </Link>
                    <span className="absolute left-1/2 transform -translate-x-1/2 mt-2 z-10 opacity-0 group-hover:opacity-100 bg-black text-white text-xs rounded px-2 py-1 pointer-events-none transition-opacity duration-200"
                      style={{ whiteSpace: 'nowrap', bottom: '-2.5rem' }}>
                      {item.tooltip}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <div className="bg-white rounded-lg p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default WellnessLayout;