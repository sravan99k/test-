import { useEffect, useState, useCallback } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, auth } from '@/integrations/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface LevelBestScores {
  [levelId: number]: number;
}

export interface GameProgressData {
  completedLevels: number[];
  bestScores: LevelBestScores;
  totalXP: number;
  lastUpdated?: any;
}

export interface UseLevelProgressResult {
  totalXP: number;
  completedLevels: Set<number>;
  bestScores: LevelBestScores;
  loading: boolean;
  /**
   * Whether a level is unlocked based on completion of the previous level.
   * Level 1 is always unlocked.
   */
  isLevelUnlocked: (levelId: number) => boolean;
  /**
   * Record a successful level completion and update XP and best score.
   */
  recordLevelCompletion: (levelId: number, percentageScore: number, xpEarned: number) => void;
}

interface UserPathData {
  organizationId?: string;
  schoolId?: string;
  studentId?: string;
  parentAdminId?: string;
  isIndependent?: boolean;
}

/**
 * Helper function to build the student document path
 */
function buildStudentPath(userData: UserPathData): string | null {
  const { organizationId, schoolId, studentId, parentAdminId, isIndependent } = userData;

  if (!schoolId || !studentId || !parentAdminId) {
    return null;
  }

  if (isIndependent) {
    return `users/${parentAdminId}/schools/${schoolId}/students/${studentId}`;
  } else if (organizationId) {
    return `users/${parentAdminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}`;
  }

  return null;
}

/**
 * Reusable hook to manage per-game level progress.
 * Data is stored in Firestore under: {studentPath}/gameProgress/{gameId}
 * Example: users/n6Wj5oh4RxS693tCC5fcIJzhNWp1/organizations/ramoji/schools/ramadevi-public-school/students/arav-sharma/gameProgress/digitSpan
 */
export function useLevelProgress(gameId: string): UseLevelProgressResult {
  const [totalXP, setTotalXP] = useState<number>(0);
  const [completedLevels, setCompletedLevels] = useState<Set<number>>(new Set());
  const [bestScores, setBestScores] = useState<LevelBestScores>({});
  const [loading, setLoading] = useState(true);
  const [studentPath, setStudentPath] = useState<string | null>(null);

  // Listen to auth state changes and fetch user path data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Fetch user document to get path components
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserPathData;
            const path = buildStudentPath(userData);
            setStudentPath(path);
          } else {
            setStudentPath(null);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error fetching user data for game progress:', error);
          setStudentPath(null);
          setLoading(false);
        }
      } else {
        setStudentPath(null);
        // Reset state when logged out
        setTotalXP(0);
        setCompletedLevels(new Set());
        setBestScores({});
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Listen to Firestore document for real-time updates
  useEffect(() => {
    if (!studentPath) {
      setLoading(false);
      return;
    }

    const docRef = doc(db, studentPath, 'gameProgress', gameId);

    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as GameProgressData;
          setTotalXP(data.totalXP || 0);
          setCompletedLevels(new Set(data.completedLevels || []));
          setBestScores(data.bestScores || {});
        } else {
          // Document doesn't exist yet - use defaults
          setTotalXP(0);
          setCompletedLevels(new Set());
          setBestScores({});
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to game progress:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [studentPath, gameId]);

  const isLevelUnlocked = useCallback((levelId: number): boolean => {
    if (levelId === 1) return true;
    return completedLevels.has(levelId - 1);
  }, [completedLevels]);

  const recordLevelCompletion = useCallback(
    async (levelId: number, percentageScore: number, xpEarned: number) => {
      if (!studentPath) {
        console.warn('Cannot record level completion: student path not available');
        return;
      }

      // Optimistically update local state
      const newCompletedLevels = new Set([...completedLevels, levelId]);
      const newTotalXP = totalXP + xpEarned;
      const newBestScores = {
        ...bestScores,
        [levelId]: Math.max(bestScores[levelId] || 0, percentageScore),
      };

      setCompletedLevels(newCompletedLevels);
      setTotalXP(newTotalXP);
      setBestScores(newBestScores);

      // Persist to Firestore
      try {
        const docRef = doc(db, studentPath, 'gameProgress', gameId);
        const { serverTimestamp } = await import('firebase/firestore');

        await setDoc(
          docRef,
          {
            completedLevels: Array.from(newCompletedLevels),
            bestScores: newBestScores,
            totalXP: newTotalXP,
            lastUpdated: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error('Failed to save game progress to Firestore:', error);
        // Revert optimistic update on failure
        setCompletedLevels(completedLevels);
        setTotalXP(totalXP);
        setBestScores(bestScores);
      }
    },
    [studentPath, gameId, completedLevels, totalXP, bestScores]
  );

  return {
    totalXP,
    completedLevels,
    bestScores,
    loading,
    isLevelUnlocked,
    recordLevelCompletion,
  };
}
