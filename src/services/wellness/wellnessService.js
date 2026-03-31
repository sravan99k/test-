import { db } from '../../integrations/firebase';
import { collection, addDoc, getDocs, query, orderBy, where, serverTimestamp, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';

/**
 * Get the student's path information from their user document
 * @param {string} userId - Firebase auth UID
 * @returns {Promise<Object>} Student path information
 */
async function getStudentPathInfo(userId) {
  const userDoc = await getDoc(doc(db, 'users', userId));
  const userData = userDoc.data();

  if (!userData) {
    throw new Error('User data not found');
  }

  return {
    studentId: userData.studentId,
    adminId: userData.parentAdminId,
    schoolId: userData.schoolId,
    organizationId: userData.organizationId || null
  };
}

/**
 * Get the base path for a student's collections
 * @param {Object} pathInfo - Student path information
 * @returns {string} Base path
 */
function getStudentBasePath(pathInfo) {
  const { adminId, schoolId, organizationId, studentId } = pathInfo;

  if (organizationId) {
    return `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}`;
  } else {
    return `users/${adminId}/schools/${schoolId}/students/${studentId}`;
  }
}

// ==================== MOOD ENTRIES ====================

/**
 * Save a mood entry for a student
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 * @param {number} params.moodScore - Mood score (1-10)
 * @param {string} params.moodLabel - Mood label
 * @param {string} params.notes - Optional notes
 */
export async function saveMoodEntry({ userId, moodScore, moodLabel, notes = '' }) {
  console.log('[saveMoodEntry] Saving mood entry for user:', userId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const moodEntriesPath = `${basePath}/mood_entries`;

    console.log('[saveMoodEntry] Saving to path:', moodEntriesPath);

    const moodData = {
      mood_score: Number(moodScore),
      mood_label: moodLabel,
      notes: notes || '',
      created_at: serverTimestamp(),
      user_id: userId
    };

    const moodRef = await addDoc(collection(db, moodEntriesPath), moodData);

    console.log('[saveMoodEntry] Mood entry saved:', moodRef.id);
    return { success: true, id: moodRef.id };
  } catch (error) {
    console.error('[saveMoodEntry] Error:', error);
    throw error;
  }
}

/**
 * Get mood entries for a student
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 * @param {number} params.limit - Optional limit
 */
export async function getMoodEntries({ userId, limit: limitCount }) {
  console.log('[getMoodEntries] Fetching mood entries for user:', userId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const moodEntriesPath = `${basePath}/mood_entries`;

    let q = query(
      collection(db, moodEntriesPath),
      orderBy('created_at', 'desc')
    );

    if (limitCount) {
      q = query(q, where('created_at', '!=', null));
    }

    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.() || new Date()
    }));

    console.log('[getMoodEntries] Found entries:', entries.length);
    return entries;
  } catch (error) {
    console.error('[getMoodEntries] Error:', error);
    throw error;
  }
}

// ==================== WELLNESS GOALS ====================

/**
 * Save a wellness goal for a student
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 * @param {string} params.title - Goal title
 * @param {string} params.description - Goal description
 * @param {string} params.dueDate - Due date (ISO string)
 */
export async function saveWellnessGoal({ userId, title, description, dueDate = null, emoji, target_frequency }) {
  console.log('[saveWellnessGoal] Saving goal for user:', userId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const goalsPath = `${basePath}/wellness_goals`;

    const goalData = {
      title,
      description,
      is_completed: false,
      due_date: dueDate,
      emoji: emoji || '🎯',
      target_frequency: target_frequency || 'daily',
      created_at: serverTimestamp(),
      user_id: userId
    };

    const goalRef = await addDoc(collection(db, goalsPath), goalData);

    console.log('[saveWellnessGoal] Goal saved:', goalRef.id);
    return { success: true, id: goalRef.id };
  } catch (error) {
    console.error('[saveWellnessGoal] Error:', error);
    throw error;
  }
}

/**
 * Get wellness goals for a student
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 * @param {boolean} params.activeOnly - Get only active goals
 */
export async function getWellnessGoals({ userId, activeOnly = false }) {
  console.log('[getWellnessGoals] Fetching goals for user:', userId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const goalsPath = `${basePath}/wellness_goals`;

    let q = query(
      collection(db, goalsPath),
      orderBy('created_at', 'desc')
    );

    if (activeOnly) {
      // Temporarily remove orderBy to avoid index requirement
      // TODO: Add composite index for is_completed + created_at
      q = query(
        collection(db, goalsPath),
        where('is_completed', '==', false)
      );
    }

    const snapshot = await getDocs(q);
    let goals = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      created_at: doc.data().created_at?.toDate?.() || new Date()
    }));

    // Sort client-side if we couldn't use orderBy in the query
    if (activeOnly) {
      goals = goals.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
    }

    console.log('[getWellnessGoals] Found goals:', goals.length);
    return goals;
  } catch (error) {
    console.error('[getWellnessGoals] Error:', error);
    throw error;
  }
}

/**
 * Update a wellness goal
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 * @param {string} params.goalId - Goal document ID
 * @param {Object} params.updates - Fields to update
 */
export async function updateWellnessGoal({ userId, goalId, updates }) {
  console.log('[updateWellnessGoal] Updating goal:', goalId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const goalPath = `${basePath}/wellness_goals/${goalId}`;

    await updateDoc(doc(db, goalPath), updates);

    console.log('[updateWellnessGoal] Goal updated successfully');
    return { success: true };
  } catch (error) {
    console.error('[updateWellnessGoal] Error:', error);
    throw error;
  }
}

/**
 * Delete a wellness goal
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 * @param {string} params.goalId - Goal document ID
 */
export async function deleteWellnessGoal({ userId, goalId }) {
  console.log('[deleteWellnessGoal] Deleting goal:', goalId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const goalPath = `${basePath}/wellness_goals/${goalId}`;

    await deleteDoc(doc(db, goalPath));

    console.log('[deleteWellnessGoal] Goal deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('[deleteWellnessGoal] Error:', error);
    throw error;
  }
}

// ==================== ACHIEVEMENTS ====================

/**
 * Save an achievement for a student
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 * @param {string} params.achievementName - Achievement name
 * @param {string} params.achievementType - Achievement type/ID (optional)
 * @param {string} params.description - Achievement description
 * @param {string} params.badgeIcon - Badge icon/emoji
 */
export async function saveAchievement({ userId, achievementName, achievementType, description, badgeIcon }) {
  console.log('[saveAchievement] Saving achievement for user:', userId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const achievementsPath = `${basePath}/achievements`;

    const achievementData = {
      achievement_name: achievementName,
      achievement_type: achievementType || achievementName.toLowerCase().replace(/\s+/g, '_'),
      description,
      badge_icon: badgeIcon,
      earned_at: serverTimestamp(),
      user_id: userId
    };

    const achievementRef = await addDoc(collection(db, achievementsPath), achievementData);

    console.log('[saveAchievement] Achievement saved:', achievementRef.id);
    return { success: true, id: achievementRef.id };
  } catch (error) {
    console.error('[saveAchievement] Error:', error);
    throw error;
  }
}

/**
 * Get achievements for a student
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 */
export async function getAchievements({ userId }) {
  console.log('[getAchievements] Fetching achievements for user:', userId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const achievementsPath = `${basePath}/achievements`;

    const q = query(
      collection(db, achievementsPath),
      orderBy('earned_at', 'desc')
    );

    const snapshot = await getDocs(q);
    const achievements = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      earned_at: doc.data().earned_at?.toDate?.() || new Date()
    }));

    console.log('[getAchievements] Found achievements:', achievements.length);
    return achievements;
  } catch (error) {
    console.error('[getAchievements] Error:', error);
    throw error;
  }
}

// ==================== CHECK-INS ====================

/**
 * Save a daily check-in for a student
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 * @param {string} params.mood - Optional mood
 * @param {string} params.notes - Optional notes
 */
export async function saveCheckIn({ userId, mood = '', notes = '' }) {
  console.log('[saveCheckIn] Saving check-in for user:', userId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const checkInsPath = `${basePath}/check_ins`;

    const checkInData = {
      date: serverTimestamp(),
      mood,
      notes,
      created_at: serverTimestamp(),
      user_id: userId
    };

    const checkInRef = await addDoc(collection(db, checkInsPath), checkInData);

    console.log('[saveCheckIn] Check-in saved:', checkInRef.id);
    return { success: true, id: checkInRef.id };
  } catch (error) {
    console.error('[saveCheckIn] Error:', error);
    throw error;
  }
}

/**
 * Update engagement time for a student
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 * @param {number} params.minutes - Total minutes engaged
 */
export async function updateEngagementTime({ userId, minutes }) {
  console.log('[updateEngagementTime] Updating engagement for user:', userId, 'Minutes:', minutes);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const engagementPath = `${basePath}/engagement_stats`;

    // Get today's date as a string (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];

    // Check if engagement record exists for today
    const engagementRef = doc(db, engagementPath, today);
    const engagementDoc = await getDoc(engagementRef);

    if (engagementDoc.exists()) {
      // Update existing record
      await updateDoc(engagementRef, {
        minutes_engaged: minutes,
        last_updated: serverTimestamp()
      });
    } else {
      // Create new record for today
      await setDoc(engagementRef, {
        date: today,
        minutes_engaged: minutes,
        user_id: userId,
        created_at: serverTimestamp(),
        last_updated: serverTimestamp()
      });
    }

    console.log('[updateEngagementTime] Engagement time updated');
    return { success: true };
  } catch (error) {
    console.error('[updateEngagementTime] Error:', error);
    throw error;
  }
}

/**
 * Get check-ins for a student
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 */
export async function getCheckIns({ userId }) {
  console.log('[getCheckIns] Fetching check-ins for user:', userId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const checkInsPath = `${basePath}/check_ins`;

    const q = query(
      collection(db, checkInsPath),
      orderBy('date', 'desc')
    );

    const snapshot = await getDocs(q);
    const checkIns = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || new Date()
    }));

    console.log('[getCheckIns] Found check-ins:', checkIns.length);
    return checkIns;
  } catch (error) {
    console.error('[getCheckIns] Error:', error);
    throw error;
  }
}

// ==================== MINDFULNESS SESSIONS ====================

/**
 * Save a mindfulness session for a student
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 * @param {string} params.type - Session type (meditation, breathing, yoga)
 * @param {number} params.duration - Duration in minutes
 */
export async function saveMindfulnessSession({ userId, type, duration }) {
  console.log('[saveMindfulnessSession] Saving session for user:', userId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const sessionsPath = `${basePath}/mindfulness_sessions`;

    const sessionData = {
      type,
      duration: Number(duration),
      completed_at: serverTimestamp(),
      created_at: serverTimestamp(),
      user_id: userId
    };

    const sessionRef = await addDoc(collection(db, sessionsPath), sessionData);

    console.log('[saveMindfulnessSession] Session saved:', sessionRef.id);
    return { success: true, id: sessionRef.id };
  } catch (error) {
    console.error('[saveMindfulnessSession] Error:', error);
    throw error;
  }
}

/**
 * Get mindfulness sessions for a student
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 * @param {Date} params.since - Optional start date
 */
export async function getMindfulnessSessions({ userId, since }) {
  console.log('[getMindfulnessSessions] Fetching sessions for user:', userId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const sessionsPath = `${basePath}/mindfulness_sessions`;

    let q = query(
      collection(db, sessionsPath),
      orderBy('completed_at', 'desc')
    );

    if (since) {
      q = query(
        collection(db, sessionsPath),
        where('completed_at', '>=', since),
        orderBy('completed_at', 'desc')
      );
    }

    const snapshot = await getDocs(q);
    const sessions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      completed_at: doc.data().completed_at?.toDate?.() || new Date()
    }));

    console.log('[getMindfulnessSessions] Found sessions:', sessions.length);
    return sessions;
  } catch (error) {
    console.error('[getMindfulnessSessions] Error:', error);
    throw error;
  }
}

// ==================== GAME PROGRESS ====================

/**
 * Get game progress for a student
 * @param {Object} params
 * @param {string} params.userId - Firebase auth UID
 */
export async function getGameProgress({ userId }) {
  console.log('[getGameProgress] Fetching game progress for user:', userId);

  try {
    const pathInfo = await getStudentPathInfo(userId);
    const basePath = getStudentBasePath(pathInfo);
    const gameProgressPath = `${basePath}/gameProgress`;

    const snapshot = await getDocs(collection(db, gameProgressPath));
    const progress = snapshot.docs.map(doc => ({
      gameId: doc.id,
      ...doc.data()
    }));

    // Aggregate stats
    let totalCompletedLevels = 0;
    let totalXP = 0;
    const gameStats = {};

    progress.forEach(game => {
      const completedCount = (game.completedLevels || []).length;
      totalCompletedLevels += completedCount;
      totalXP += (game.totalXP || 0);
      gameStats[game.gameId] = {
        completedCount,
        totalXP: game.totalXP || 0,
        maxLevel: Math.max(0, ...((game.completedLevels || []).map(l => parseInt(l) || 0)))
      };
    });

    console.log('[getGameProgress] Found progress for games:', progress.length);
    return {
      totalCompletedLevels,
      totalXP,
      gameStats,
      raw: progress
    };
  } catch (error) {
    console.error('[getGameProgress] Error fetching game progress:', error);
    return {
      totalCompletedLevels: 0,
      totalXP: 0,
      gameStats: {},
      raw: []
    };
  }
}
