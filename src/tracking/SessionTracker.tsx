
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { doc, getDoc, updateDoc, increment, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase';

const SESSION_UPDATE_INTERVAL = 60 * 1000; // 1 minute


export const SessionTracker = () => {
    const { user } = useAuth();
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const lastActivityRef = useRef<number>(Date.now());

    useEffect(() => {
        // Activity listeners to detect idle state
        const handleActivity = () => {
            lastActivityRef.current = Date.now();
        };

        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, handleActivity));

        return () => {
            events.forEach(event => document.removeEventListener(event, handleActivity));
        };
    }, []);

    useEffect(() => {
        if (!user || user.role !== 'student') {
            return;
        }

        const updateSessionTime = async () => {
            try {
                // 1. Check if tab is hidden
                if (document.visibilityState === 'hidden') return;

                // 2. Check if on assessment page
                if (window.location.pathname.includes('/assessment')) return;

                // 3. IDLE CHECK: Check if user has been active in the last 60 seconds
                const timeSinceLastActivity = Date.now() - lastActivityRef.current;
                if (timeSinceLastActivity > 60 * 1000) return;

                // Sync to school student record
                // Get Metadata for path construction
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                // Use userData from Firestore as it contains the custom profile fields
                if (userData?.schoolId && userData?.parentAdminId && userData?.studentId) {
                    const adminId = userData.parentAdminId;
                    const schoolId = userData.schoolId;
                    const studentId = userData.studentId;
                    const organizationId = userData.organizationId;
                    const isIndependent = userData.isIndependent;

                    let studentRefPath = '';
                    if (isIndependent) {
                        studentRefPath = `users/${adminId}/schools/${schoolId}/students/${studentId}`;
                    } else {
                        studentRefPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}`;
                    }

                    const studentRef = doc(db, studentRefPath);
                    const engagementRef = doc(db, studentRefPath, 'metrics', 'engagement');

                    // 1. Get current phase points/days from engagement document
                    const engagementSnap = await getDoc(engagementRef);
                    const studentSnap = await getDoc(studentRef); // Still need for currentPhaseId

                    if (studentSnap.exists()) {
                        const studentData = studentSnap.data();
                        const engagementData = engagementSnap.exists() ? engagementSnap.data() : { phases: {} };

                        const today = new Date().toISOString().split('T')[0];
                        const currentPhaseId = studentData.currentPhaseId || 1;

                        const phaseStats = engagementData.phases?.[currentPhaseId] || {
                            dailySessionMinutes: 0,
                            dailyEngagementRate: 0,
                            phaseTotalPointsPriorDays: 0,
                            phaseDaysCount: 0,
                            lastActive: '',
                            engagementRate: 0
                        };

                        let dailyMinutes = phaseStats.dailySessionMinutes || 0;
                        let phasePoints = phaseStats.phaseTotalPointsPriorDays || 0;
                        let phaseDays = phaseStats.phaseDaysCount || 0;
                        let lastDailyRate = phaseStats.dailyEngagementRate || 0;

                        // Transition Check: Is it a new day in this phase?
                        if (phaseStats.lastActive && phaseStats.lastActive !== today) {
                            phasePoints += lastDailyRate;
                            dailyMinutes = 0;
                            phaseDays += 1;
                            lastDailyRate = 0;
                        } else if (!phaseStats.lastActive) {
                            phaseDays = 1;
                        }

                        // Increment
                        dailyMinutes += 1;
                        const dailyEngagementRate = Math.min(100, Math.round((dailyMinutes / 30) * 100));

                        // Calculate Average
                        const safePhaseDays = Math.max(1, phaseDays);
                        const currentPhaseAverage = Math.round((phasePoints + dailyEngagementRate) / safePhaseDays);
                        const finalEngagementRate = Math.min(100, currentPhaseAverage);

                        // 2. Update Engagement Sub-document
                        await setDoc(engagementRef, {
                            currentPhaseId: currentPhaseId,
                            phases: {
                                ...engagementData.phases,
                                [currentPhaseId]: {
                                    dailySessionMinutes: dailyMinutes,
                                    dailyEngagementRate: dailyEngagementRate,
                                    engagementRate: finalEngagementRate,
                                    phaseTotalPointsPriorDays: phasePoints,
                                    phaseDaysCount: safePhaseDays,
                                    lastActive: today,
                                    updatedAt: serverTimestamp()
                                }
                            }
                        }, { merge: true });

                        // 3. Keep a summary on main student doc for faster dashboard listing
                        await updateDoc(studentRef, {
                            engagementRate: finalEngagementRate,
                            lastActive: today
                        });
                    }
                }
            } catch (error) {
                console.error('Error updating session time:', error);
            }
        };

        // Start interval
        intervalRef.current = setInterval(updateSessionTime, SESSION_UPDATE_INTERVAL);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [user]);

    return null;
};
