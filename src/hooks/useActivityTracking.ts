import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { saveCheckIn, updateEngagementTime } from '@/services/wellnessService';

/**
 * Hook to track user activity and engagement time
 * Creates check-in when user performs meaningful actions
 * Tracks active time spent on the platform
 */
export function useActivityTracking() {
  const { user } = useAuth();
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [engagementMinutes, setEngagementMinutes] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const lastActivityRef = useRef<number>(Date.now());
  const engagementIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check if user has already checked in today
  useEffect(() => {
    if (!user) return;

    const checkTodayCheckIn = () => {
      const lastCheckIn = localStorage.getItem(`last_checkin_${user.uid}`);
      if (lastCheckIn) {
        const lastDate = new Date(lastCheckIn);
        const today = new Date();
        const isSameDay = 
          lastDate.getDate() === today.getDate() &&
          lastDate.getMonth() === today.getMonth() &&
          lastDate.getFullYear() === today.getFullYear();
        
        setHasCheckedInToday(isSameDay);
      }
    };

    checkTodayCheckIn();
  }, [user]);

  // Track engagement time (only when user is active)
  useEffect(() => {
    if (!user) return;

    const updateEngagement = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastActivityRef.current;
      
      // Only count as active if user was active in last 30 seconds
      if (timeSinceLastActivity < 30000) {
        const minutesElapsed = Math.floor((now - startTimeRef.current) / 60000);
        setEngagementMinutes(minutesElapsed);
      }
    };

    // Update engagement every 10 seconds
    engagementIntervalRef.current = setInterval(updateEngagement, 10000);

    // Reset inactivity timeout on any user activity
    const resetInactivity = () => {
      lastActivityRef.current = Date.now();
      
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      window.addEventListener(event, resetInactivity);
    });

    return () => {
      if (engagementIntervalRef.current) {
        clearInterval(engagementIntervalRef.current);
      }
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, resetInactivity);
      });
    };
  }, [user]);

  // Save engagement time periodically
  useEffect(() => {
    if (!user || engagementMinutes === 0) return;

    const saveEngagement = async () => {
      try {
        await updateEngagementTime({
          userId: user.uid,
          minutes: engagementMinutes
        });
      } catch (error) {
        console.error('[ActivityTracking] Error saving engagement time:', error);
      }
    };

    // Save every 5 minutes
    const saveInterval = setInterval(saveEngagement, 5 * 60 * 1000);

    return () => clearInterval(saveInterval);
  }, [user, engagementMinutes]);

  /**
   * Record a check-in when user performs a meaningful action
   * @param activityType - Type of activity performed (mood, journal, goal, etc.)
   * @param activityDetails - Optional details about the activity
   */
  const recordActivity = async (activityType: string, activityDetails?: string) => {
    if (!user || hasCheckedInToday) return;

    try {
      console.log('[ActivityTracking] Recording activity:', activityType);
      
      await saveCheckIn({
        userId: user.uid,
        mood: activityType,
        notes: activityDetails || `Engaged with ${activityType}`
      });

      // Mark as checked in for today
      localStorage.setItem(`last_checkin_${user.uid}`, new Date().toISOString());
      setHasCheckedInToday(true);

      console.log('[ActivityTracking] Check-in recorded successfully');
    } catch (error) {
      console.error('[ActivityTracking] Error recording activity:', error);
    }
  };

  return {
    recordActivity,
    hasCheckedInToday,
    engagementMinutes
  };
}
