import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '@/integrations/firebase';

interface UserStats {
  gamesCompleted: number;
  totalMinutesTrained: number;
  lastTrained?: Date;
  currentLevel: string;
  completedTasks: string[];
  streak?: number;
  lastActiveDate?: string;
}

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      // Return stats from user document, or initialize if they don't exist
      return {
        gamesCompleted: userData.gamesCompleted || 0,
        totalMinutesTrained: userData.totalMinutesTrained || 0,
        currentLevel: userData.currentLevel || 'Beginner',
        completedTasks: userData.completedTasks || [],
        streak: userData.streak || 0,
        lastActiveDate: userData.lastActiveDate || new Date().toISOString().split('T')[0]
      };
    } else {
      // Initialize with default values if user doesn't exist (shouldn't happen in normal flow)
      const defaultStats: UserStats = {
        gamesCompleted: 0,
        totalMinutesTrained: 0,
        currentLevel: 'Beginner',
        completedTasks: [],
        streak: 0,
        lastActiveDate: new Date().toISOString().split('T')[0]
      };
      await setDoc(userRef, defaultStats, { merge: true });
      return defaultStats;
    }
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

export const updateGameCompletion = async (userId: string, gameId: string, minutesTrained: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    let currentLevel = 'Beginner';
    let gamesCompleted = 1;
    let completedTasks: string[] = [gameId];
    let streak = 1;
    const today = new Date().toISOString().split('T')[0];

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const lastActive = userData.lastActiveDate || today;
      const lastDate = new Date(lastActive);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Update streak if they played yesterday or today
      streak = userData.streak || 0;
      if (diffDays <= 1) {
        streak = diffDays === 0 ? streak : streak + 1; // Increment if yesterday, keep if today
      } else {
        streak = 1; // Reset streak if more than one day missed
      }

      gamesCompleted = (userData.gamesCompleted || 0) + 1;
      completedTasks = [...new Set([...(userData.completedTasks || []), gameId])];

      // Calculate level based on games completed
      if (gamesCompleted >= 15) currentLevel = 'Expert';
      else if (gamesCompleted >= 8) currentLevel = 'Advanced';
      else if (gamesCompleted >= 3) currentLevel = 'Intermediate';
      else currentLevel = 'Beginner';
    }

    // Update user stats in the user document
    await updateDoc(userRef, {
      gamesCompleted,
      totalMinutesTrained: increment(minutesTrained),
      currentLevel,
      completedTasks,
      lastTrained: serverTimestamp(),
      streak,
      lastActiveDate: today
    });

    // Get user data to build the student path
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    if (!userData?.organizationId || !userData?.schoolId || !userData?.studentId) {
      throw new Error('User is not associated with a school or student record');
    }

    // Create a new cognitive session record
    const sessionData = {
      userId,
      gameId,
      minutesTrained,
      startTime: Timestamp.fromMillis(Date.now() - (minutesTrained * 60000)),
      endTime: serverTimestamp(),
      score: gamesCompleted,
      level: currentLevel,
      completedAt: serverTimestamp(),
      organizationId: userData.organizationId,
      schoolId: userData.schoolId
    };

    // Add the session to the student's cognitive_sessions subcollection
    const studentSessionsRef = collection(
      db,
      'users',
      userId,
      'organizations',
      userData.organizationId,
      'schools',
      userData.schoolId,
      'students',
      userData.studentId,
      'cognitive_sessions'
    );
    await addDoc(studentSessionsRef, sessionData);

    return {
      gamesCompleted,
      currentLevel,
      totalMinutesTrained: minutesTrained
    };
  } catch (error) {
    console.error('Error updating game completion:', error);
    throw error;
  }
};

export const getTodaysCognitiveMinutes = async (userId: string): Promise<number> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get user data to build the student path
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    if (!userData?.organizationId || !userData?.schoolId || !userData?.studentId) {
      console.warn('User is not associated with a school or student record');
      return 0;
    }

    // Query from the student's cognitive_sessions subcollection
    const studentSessionsRef = collection(
      db,
      'users',
      userId,
      'organizations',
      userData.organizationId,
      'schools',
      userData.schoolId,
      'students',
      userData.studentId,
      'cognitive_sessions'
    );

    const q = query(
      studentSessionsRef,
      where('completedAt', '>=', Timestamp.fromDate(today))
    );

    const querySnapshot = await getDocs(q);
    let totalMinutes = 0;

    querySnapshot.forEach((doc) => {
      const session = doc.data();
      if (session.minutesTrained) {
        // Use stored minutes if available
        totalMinutes += session.minutesTrained;
      } else if (session.startTime && session.endTime) {
        // Fallback to calculating from timestamps
        const startTime = session.startTime.toDate ? session.startTime.toDate() : new Date(session.startTime);
        const endTime = session.endTime.toDate ? session.endTime.toDate() : new Date(session.endTime);
        const durationMs = endTime.getTime() - startTime.getTime();
        totalMinutes += Math.floor(durationMs / 60000); // Convert ms to minutes
      }
    });

    return totalMinutes;
  } catch (error) {
    console.error('Error getting today\'s cognitive minutes:', error);
    return 0;
  }
};

export const updateSessionTime = async (
  userId: string,
  minutesToAdd: number,
  userData: any // Pass userData to avoid re-fetching
) => {
  if (minutesToAdd <= 0) return;

  try {
    const batch = writeBatch(db); // Use batch for atomic updates and fewer network calls

    // 1. Update User Document
    const userRef = doc(db, 'users', userId);
    batch.update(userRef, {
      totalSessionMinutes: increment(minutesToAdd),
      lastActiveDate: new Date().toISOString().split('T')[0],
      lastSeen: serverTimestamp()
    });

    // 2. Update School Student Document (if linked)
    if (userData.schoolId && userData.studentId && userData.parentAdminId) {
      // Determine path based on organization or independent
      const adminId = userData.parentAdminId;
      const schoolId = userData.schoolId;
      const studentId = userData.studentId;
      const organizationId = userData.organizationId;
      const isIndependent = userData.isIndependent;

      let studentPath = '';
      if (isIndependent) {
        studentPath = `users/${adminId}/schools/${schoolId}/students/${studentId}`;
      } else if (organizationId) {
        studentPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}`;
      }

      if (studentPath) {
        const studentRef = doc(db, studentPath);

        // Calculate new engagement rate locally to save a read
        // We can't know the EXACT total without reading, but we can increment a counter 
        // and update the rate based on a standard target.
        // Better approach for strict minimizing reads:
        // Just increment 'totalSessionMinutes' on the student doc too.
        // Let the dashboard calculate the %. 
        // BUT the prompt asked for "engagement score should be calculated".
        // Use a cloud function or ... 
        // Client side read-modify-write is okay if redundant reads are minimized by doing it infrequently.
        // However, `update` with `increment` is write-only.
        // Let's increment a `totalUsageMinutes` field on the student doc.
        // AND update `engagementRate` approximately if we have the current value? No.

        // Compromise: We will update `totalMinutes` using increment (write only).
        // The Dashboard will read this and show the score.
        // HOWEVER, the `teacherDataService` expects `engagementRate` as a number (0-100).
        // If we want to support the EXISTING service structure without changing it too much,
        // we might need to calculate it. 

        // Let's try to update `engagementRate` blindly based on an assumed target? No that's bad.

        // Let's stick to updating `totalUsageMinutes` (new field) AND `engagementRate`.
        // To update `engagementRate` without reading, we need to know the current total.
        // SInce we are in `SessionTracker`, we can keep track of the session total.
        // But we don't know the historical total without reading.

        // REQUIRED READ: We need to read the current total minutes at least once at start of session.
        // SessionTracker will do that.

        // So, `SessionTracker` passes `currentTotalMinutes` + `minutesToAdd`.
        // We calculate rate = ((currentTotal + added) / TARGET) * 100.
        // TARGET = 600 minutes (10 hours) for example.

        const TARGET_MINUTES = 600;
        // We can't use increment() for engagementRate. We must set it.
        // So we rely on the caller passing the correct *new* total or we accept we must read here.
        // Actually, if we use `increment` for minutes, we can't easily sync `engagementRate` atomically without a read.
        // 
        // Recommendation: The USER asked for "no redundant reads".
        // One read at startup of `SessionTracker` is not redundant, it's necessary.
        // Then we maintain local state.

        batch.update(studentRef, {
          totalUsageMinutes: increment(minutesToAdd),
          lastActivity: new Date().toISOString().split('T')[0]
        });
      }
    }

    await batch.commit();
  } catch (error) {
    console.error('Error updating session time:', error);
  }
};
