export const pageTitles: Record<string, string> = {
  '/': 'Home',
  // Old wellness route
  '/wellness-dashboard': 'Wellness',
  // New wellness routes
  '/wellness/dashboard': 'Wellness',
  '/wellness/mood': 'Mood Tracker',
  '/wellness/journal': 'Journal',
  '/wellness/goals': 'Wellness Goals',
  '/wellness/badges': 'Achievement Badges',
  '/wellness/contact': 'Contact Support',
  '/wellness/feedback': 'Feedback',
  '/cognitive-tasks': 'Cognitive Tasks',
  '/buddysafe': 'BuddySafe',
  '/assessment': 'Assessment',
  '/assessment/new': 'New Assessment',
  '/my-assessments': 'My Assessments',
  '/progress-tracking': 'Progress Tracking',
  '/profile-settings': 'Profile Settings',
  '/resources': 'Resources',
  '/resources/:id': 'Resource Details',
  '/school-dashboard': 'School Dashboard',
  '/student-dashboard': 'Student Dashboard',
  // Teacher dashboard routes (old)
  '/teacher-dashboard': 'Teacher Dashboard',
  '/teacher-dashboard/students': 'Students',
  '/teacher-dashboard/assessments': 'Assessments',
  '/teacher-dashboard/resources': 'Resources',
  '/teacher-dashboard/activities': 'Activities',
  '/teacher-dashboard/support': 'Support',

  // Teacher dashboard routes (new)
  '/teacher/dashboard': 'Teacher Dashboard',
  '/teacher/students': 'Students',
  '/teacher/assessments': 'Assessments',
  '/teacher/resources': 'Resources',
  '/teacher/activities': 'Activities',
  '/teacher/support': 'Support',
  '/chat': 'Chat',
  '/alerts': 'Alerts',
  '/reports': 'Reports',
  '/analytics': 'Analytics',
  '/school-settings': 'School Settings',
  // Safety pages
  '/safety/cyberbullying': 'Cyberbullying Safety',
  '/safety/physical-bullying': 'Physical Bullying Safety',
  '/safety/academic-pressure': 'Academic Pressure Safety',
  '/safety/substance-abuse': 'Substance Abuse Safety',
};

export const getPageTitle = (path: string): string => {
  return pageTitles[path] || 'Novo Wellness';
};
