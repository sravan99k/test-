import { db } from '../../integrations/firebase';
import { collection, addDoc, getDocs, query, orderBy, where, serverTimestamp, doc, getDoc, updateDoc, deleteDoc, setDoc, runTransaction, Timestamp } from 'firebase/firestore';

/**
 * Get the student's path information from their user document
 * @param {string} userId - Firebase auth UID
 * @returns {Promise<Object>} Student path information
 */
async function getStudentPathInfo(userId: string) {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.data();

    if (!userData) {
        throw new Error('User data not found');
    }

    const studentId = userData.studentId;
    const adminId = userData.parentAdminId || userData.adminId;
    const schoolId = userData.schoolId;
    const organizationId = userData.organizationId || null;

    if (!studentId) {
        throw new Error('Missing studentId in users/{uid} document');
    }
    if (!adminId) {
        throw new Error('Missing parentAdminId in users/{uid} document');
    }
    if (!schoolId) {
        throw new Error('Missing schoolId in users/{uid} document');
    }

    return {
        studentId,
        adminId,
        schoolId,
        organizationId
    };
}

/**
 * Get the base path for a student's resource entries
 * Path: users/{adminId}/organizations/{orgId}/schools/{schoolId}/students/{studentId}/resources/stress-management/entries
 * @param {Object} pathInfo - Student path information
 * @returns {string} Base path for entries
 */
function getStudentEntriesPath(pathInfo: any) {
    const { adminId, schoolId, organizationId, studentId } = pathInfo;
    let basePath = '';

    if (organizationId) {
        basePath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}`;
    } else {
        basePath = `users/${adminId}/schools/${schoolId}/students/${studentId}`;
    }

    return `${basePath}/resources/stress-management/entries`;
}

/**
 * Get the base path for a student's entries for a specific resource module
 * @param {Object} pathInfo - Student path information
 * @param {string} moduleKey - e.g. 'stress-management' | 'sleep-relaxation'
 */
function getStudentEntriesPathFor(pathInfo: any, moduleKey: string) {
    const { adminId, schoolId, organizationId, studentId } = pathInfo;
    const basePath = organizationId
        ? `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}`
        : `users/${adminId}/schools/${schoolId}/students/${studentId}`;
    return `${basePath}/resources/${moduleKey}/entries`;
}

/**
 * Get the base path for a student's wellness badges
 * Path: users/{adminId}/organizations/{orgId}/schools/{schoolId}/students/{studentId}/wellness/badges
 */
function getStudentWellnessBadgesPath(pathInfo: any) {
    const { adminId, schoolId, organizationId, studentId } = pathInfo;
    const basePath = organizationId
        ? `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}`
        : `users/${adminId}/schools/${schoolId}/students/${studentId}`;
    return `${basePath}/wellness_badges`;
}

// ==================== STUDY PLANS ====================

export async function saveStudyPlan(userId: string, planData: any) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPath(pathInfo);

        const docData = {
            ...planData,
            type: 'study-plan',
            userId,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, entriesPath), docData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error saving study plan:', error);
        throw error;
    }
}

// ==================== SLEEP RELAXATION ====================

function computeSleepHours(bedTime: string, wakeTime: string): number {
    // bedTime, wakeTime: 'HH:mm' 24-hour format
    const [bh, bm] = bedTime.split(':').map(Number);
    const [wh, wm] = wakeTime.split(':').map(Number);
    let minutes = (wh * 60 + wm) - (bh * 60 + bm);
    if (minutes < 0) minutes += 24 * 60; // cross midnight
    return Math.round((minutes / 60) * 10) / 10;
}

export async function logSleep(userId: string, bedTime: string, wakeTime: string, feeling: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'sleep-relaxation');
        const today = new Date().toISOString().split('T')[0];
        const logId = `sleep_${today}`;
        const summaryId = 'summary';
        const hours = computeSleepHours(bedTime, wakeTime);

        await runTransaction(db, async (transaction) => {
            const logRef = doc(db, entriesPath, logId);
            const summaryRef = doc(db, entriesPath, summaryId);

            // Reads first
            const summaryDoc = await transaction.get(summaryRef);

            let newStreak = 1;
            let lastDate = '';

            if (summaryDoc.exists()) {
                const data = summaryDoc.data();
                const currentStreak = data.sleepStreak || 0;
                lastDate = data.lastSleepDate || '';

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastDate === today) {
                    newStreak = currentStreak;
                } else if (lastDate === yesterdayStr) {
                    newStreak = currentStreak + 1;
                } else {
                    newStreak = 1;
                }
            }

            // Writes after reads
            transaction.set(logRef, {
                date: today,
                bedTime,
                wakeTime,
                feeling,
                hours,
                type: 'sleep-log',
                userId,
                createdAt: serverTimestamp()
            });

            transaction.set(summaryRef, {
                type: 'stats',
                userId,
                sleepStreak: newStreak,
                lastSleepDate: today
            }, { merge: true });
        });

        return { success: true };
    } catch (error) {
        console.error('Error logging sleep:', error);
        throw error;
    }
}

export async function getSleepLogs(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'sleep-relaxation');
        const q = query(
            collection(db, entriesPath),
            where('type', '==', 'sleep-log')
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        return items.sort((a, b) => (a?.date < b?.date ? 1 : -1));
    } catch (error) {
        console.error('Error fetching sleep logs:', error);
        throw error;
    }
}

export async function deleteSleepLog(userId: string, logId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'sleep-relaxation');
        await deleteDoc(doc(db, entriesPath, logId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting sleep log:', error);
        throw error;
    }
}

export async function getSleepRelaxationStats(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'sleep-relaxation');
        const summaryRef = doc(db, entriesPath, 'summary');
        const snap = await getDoc(summaryRef);
        if (snap.exists()) return snap.data();
        return { sleepStreak: 0, lastSleepDate: null };
    } catch (error) {
        console.error('Error fetching sleep stats:', error);
        throw error;
    }
}

// ==================== HEALTHY MIND HABITS ====================

export async function logSelfTalk(userId: string, texts: string[]) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'healthy-mind-habits');
        const today = new Date().toISOString().split('T')[0];
        const logId = `selftalk_${today}`;
        const summaryId = 'summary';

        await runTransaction(db, async (transaction) => {
            const logRef = doc(db, entriesPath, logId);
            const summaryRef = doc(db, entriesPath, summaryId);

            // read first
            const summaryDoc = await transaction.get(summaryRef);
            let newStreak = 1;
            let lastDate = '';
            if (summaryDoc.exists()) {
                const data = summaryDoc.data();
                const current = data.selfTalkStreak || 0;
                lastDate = data.lastSelfTalkDate || '';
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                if (lastDate === today) newStreak = current; else if (lastDate === yesterdayStr) newStreak = current + 1; else newStreak = 1;
            }

            // writes
            transaction.set(logRef, {
                date: today,
                texts,
                type: 'selftalk-log',
                userId,
                createdAt: serverTimestamp()
            });
            transaction.set(summaryRef, {
                type: 'stats',
                userId,
                selfTalkStreak: newStreak,
                lastSelfTalkDate: today
            }, { merge: true });
        });
        return { success: true };
    } catch (error) {
        console.error('Error logging self talk:', error);
        throw error;
    }
}

export async function logGratitude(userId: string, items: string[]) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'healthy-mind-habits');
        const today = new Date().toISOString().split('T')[0];
        const logId = `gratitude_${today}`;
        const summaryId = 'summary';

        await runTransaction(db, async (transaction) => {
            const logRef = doc(db, entriesPath, logId);
            const summaryRef = doc(db, entriesPath, summaryId);

            // read first
            const summaryDoc = await transaction.get(summaryRef);
            let newStreak = 1;
            let lastDate = '';
            if (summaryDoc.exists()) {
                const data = summaryDoc.data();
                const current = data.gratitudeStreak || 0;
                lastDate = data.lastGratitudeDate || '';
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                if (lastDate === today) newStreak = current; else if (lastDate === yesterdayStr) newStreak = current + 1; else newStreak = 1;
            }

            // writes
            transaction.set(logRef, {
                date: today,
                items,
                type: 'gratitude-log',
                userId,
                createdAt: serverTimestamp()
            });
            transaction.set(summaryRef, {
                type: 'stats',
                userId,
                gratitudeStreak: newStreak,
                lastGratitudeDate: today
            }, { merge: true });
        });
        return { success: true };
    } catch (error) {
        console.error('Error logging gratitude:', error);
        throw error;
    }
}

export async function logReframe(userId: string, detail: any = {}) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'healthy-mind-habits');
        const today = new Date().toISOString().split('T')[0];
        const logId = `reframe_${today}`;
        const summaryId = 'summary';

        await runTransaction(db, async (transaction) => {
            const logRef = doc(db, entriesPath, logId);
            const summaryRef = doc(db, entriesPath, summaryId);

            // read first
            const summaryDoc = await transaction.get(summaryRef);
            let newStreak = 1;
            let lastDate = '';
            if (summaryDoc.exists()) {
                const data = summaryDoc.data();
                const current = data.reframeStreak || 0;
                lastDate = data.lastReframeDate || '';
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                if (lastDate === today) newStreak = current; else if (lastDate === yesterdayStr) newStreak = current + 1; else newStreak = 1;
            }

            // writes
            transaction.set(logRef, {
                date: today,
                completed: true,
                detail,
                type: 'reframe-log',
                userId,
                createdAt: serverTimestamp()
            });
            transaction.set(summaryRef, {
                type: 'stats',
                userId,
                reframeStreak: newStreak,
                lastReframeDate: today
            }, { merge: true });
        });
        return { success: true };
    } catch (error) {
        console.error('Error logging reframe:', error);
        throw error;
    }
}

export async function getHealthyMindStats(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'healthy-mind-habits');
        const summaryRef = doc(db, entriesPath, 'summary');
        const snap = await getDoc(summaryRef);
        if (snap.exists()) return snap.data();
        return { selfTalkStreak: 0, lastSelfTalkDate: null, gratitudeStreak: 0, lastGratitudeDate: null, reframeStreak: 0, lastReframeDate: null };
    } catch (error) {
        console.error('Error fetching healthy mind stats:', error);
        throw error;
    }
}

export async function getStudyPlans(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPath(pathInfo);

        const q = query(
            collection(db, entriesPath),
            where('type', '==', 'study-plan')
        );

        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[];
        return items.sort((a, b) => {
            const ta = a?.createdAt?.toMillis ? a.createdAt.toMillis() : (a?.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
            const tb = b?.createdAt?.toMillis ? b.createdAt.toMillis() : (b?.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
            return tb - ta;
        });
    } catch (error) {
        console.error('Error fetching study plans:', error);
        throw error;
    }
}

export async function deleteStudyPlan(userId: string, planId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPath(pathInfo);
        await deleteDoc(doc(db, entriesPath, planId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting study plan:', error);
        throw error;
    }
}

// ==================== FOCUS & STUDY SKILL - STUDY PLANNER ====================

export async function saveFocusStudyPlan(userId: string, planData: any) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'focus-study-skill');
        const docData = {
            ...planData,
            type: 'study-plan',
            userId,
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, entriesPath), docData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error saving focus study plan:', error);
        throw error;
    }
}

export async function getFocusStudyPlans(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'focus-study-skill');
        const q = query(
            collection(db, entriesPath),
            where('type', '==', 'study-plan')
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[];
        return items.sort((a, b) => {
            const ta = a?.createdAt?.toMillis ? a.createdAt.toMillis() : (a?.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
            const tb = b?.createdAt?.toMillis ? b.createdAt.toMillis() : (b?.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
            return tb - ta;
        });
    } catch (error) {
        console.error('Error fetching focus study plans:', error);
        throw error;
    }
}

export async function deleteFocusStudyPlan(userId: string, planId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'focus-study-skill');
        await deleteDoc(doc(db, entriesPath, planId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting focus study plan:', error);
        throw error;
    }
}

// ==================== PEER SUPPORT & SHARING - SUPPORT CIRCLE ====================

export async function saveSupportCircle(userId: string, circleData: any) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'peer-support-sharing');
        const docData = {
            ...circleData,
            type: 'support-circle',
            userId,
            createdAt: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, entriesPath), docData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error saving support circle:', error);
        throw error;
    }
}

export async function getSupportCircles(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'peer-support-sharing');
        const q = query(
            collection(db, entriesPath),
            where('type', '==', 'support-circle')
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        return items.sort((a, b) => {
            const ta = a?.createdAt?.toMillis ? a.createdAt.toMillis() : (a?.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
            const tb = b?.createdAt?.toMillis ? b.createdAt.toMillis() : (b?.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
            return tb - ta;
        });
    } catch (error) {
        console.error('Error fetching support circles:', error);
        throw error;
    }
}

export async function deleteSupportCircle(userId: string, circleId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'peer-support-sharing');
        await deleteDoc(doc(db, entriesPath, circleId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting support circle:', error);
        throw error;
    }
}

// ==================== WELLNESS BADGES ====================

export async function awardBadge(
    userId: string,
    badge: { key: string; name: string; icon?: string; description?: string; earnedAt?: string }
) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const badgesPath = getStudentWellnessBadgesPath(pathInfo);
        const id = badge.key;
        const payload = {
            name: badge.name,
            icon: badge.icon || 'star',
            description: badge.description || '',
            earnedAt: badge.earnedAt || new Date().toISOString(),
            userId,
            createdAt: serverTimestamp()
        };
        await setDoc(doc(db, badgesPath, id), payload, { merge: true });
        return { success: true };
    } catch (error) {
        console.error('Error awarding badge:', error);
        throw error;
    }
}

export async function hasBadge(userId: string, key: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const badgesPath = getStudentWellnessBadgesPath(pathInfo);
        const snap = await getDoc(doc(db, badgesPath, key));
        return snap.exists();
    } catch (error) {
        console.error('Error checking badge existence:', error);
        throw error;
    }
}

export async function listBadges(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const badgesPath = getStudentWellnessBadgesPath(pathInfo);
        const snapshot = await getDocs(collection(db, badgesPath));
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error listing badges:', error);
        throw error;
    }
}

export async function deleteBadge(userId: string, key: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const badgesPath = getStudentWellnessBadgesPath(pathInfo);
        await deleteDoc(doc(db, badgesPath, key));
        return { success: true };
    } catch (error) {
        console.error('Error deleting badge:', error);
        throw error;
    }
}

// ==================== GROWTH MINDSET & MOTIVATION - GROWTH JOURNAL ====================

export async function logGrowthJournal(userId: string, entry: { goal: string; effort: string; gratitude: string }) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'growth-mindset-motivation');

        const today = new Date();
        const isoDate = today.toISOString();

        // Utility to get Monday of the week
        const getMonday = (d: Date) => {
            const date = new Date(d);
            const day = date.getDay();
            const diff = date.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(date.setDate(diff));
        };
        const sameWeek = (a: Date, b: Date) => getMonday(a).setHours(0, 0, 0, 0) === getMonday(b).setHours(0, 0, 0, 0);
        const previousWeek = (a: Date, b: Date) => {
            const ma = getMonday(a); ma.setHours(0, 0, 0, 0);
            const mb = getMonday(b); mb.setHours(0, 0, 0, 0);
            const diffDays = (ma.getTime() - mb.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays === 7; // a is one week after b
        };

        // Use a weekly doc id to avoid multiple increments within the same week
        const monday = getMonday(today);
        const y = monday.getFullYear();
        const m = (monday.getMonth() + 1).toString().padStart(2, '0');
        const d = monday.getDate().toString().padStart(2, '0');
        const weekId = `${y}-${m}-${d}`; // Monday date key
        const logId = `journal_${weekId}`;
        const summaryId = 'summary';

        await runTransaction(db, async (transaction) => {
            const logRef = doc(db, entriesPath, logId);
            const summaryRef = doc(db, entriesPath, summaryId);

            const summaryDoc = await transaction.get(summaryRef);

            let newStreak = 1;
            let lastDateStr = '';
            if (summaryDoc.exists()) {
                const data = summaryDoc.data();
                const current = Number(data.journalStreakWeeks || 0);
                lastDateStr = data.lastJournalDate || '';
                if (lastDateStr) {
                    const last = new Date(lastDateStr);
                    if (sameWeek(today, last)) {
                        newStreak = current; // already logged this week
                    } else if (previousWeek(today, last)) {
                        newStreak = Math.min(4, current + 1);
                    } else {
                        newStreak = 1;
                    }
                }
            }

            // Write/overwrite this week's journal entry
            transaction.set(logRef, {
                date: isoDate,
                goal: entry.goal,
                effort: entry.effort,
                gratitude: entry.gratitude,
                type: 'growth-journal',
                userId,
                createdAt: serverTimestamp()
            });

            transaction.set(summaryRef, {
                type: 'stats',
                userId,
                journalStreakWeeks: newStreak,
                lastJournalDate: isoDate
            }, { merge: true });
        });

        return { success: true };
    } catch (error) {
        console.error('Error logging growth journal:', error);
        throw error;
    }
}

export async function getGrowthMindsetStats(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'growth-mindset-motivation');
        const summaryRef = doc(db, entriesPath, 'summary');
        const snap = await getDoc(summaryRef);
        if (snap.exists()) return snap.data();
        return { journalStreakWeeks: 0, lastJournalDate: null };
    } catch (error) {
        console.error('Error fetching growth mindset stats:', error);
        throw error;
    }
}

export async function getGrowthJournalEntries(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'growth-mindset-motivation');
        const q = query(
            collection(db, entriesPath),
            where('type', '==', 'growth-journal')
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
        return items.sort((a, b) => {
            const ta = a?.createdAt?.toMillis ? a.createdAt.toMillis() : (a?.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0);
            const tb = b?.createdAt?.toMillis ? b.createdAt.toMillis() : (b?.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0);
            return tb - ta;
        });
    } catch (error) {
        console.error('Error fetching growth journal entries:', error);
        throw error;
    }
}

export async function deleteGrowthJournalEntry(userId: string, entryId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPathFor(pathInfo, 'growth-mindset-motivation');
        await deleteDoc(doc(db, entriesPath, entryId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting growth journal entry:', error);
        throw error;
    }
}

// ==================== EXERCISE LOGS ====================

export async function logExercise(userId: string, description: string) {
    console.log('Starting logExercise for userId:', userId);
    try {
        const pathInfo = await getStudentPathInfo(userId);
        console.log('Path info retrieved:', pathInfo);
        const entriesPath = getStudentEntriesPath(pathInfo);
        console.log('Entries path:', entriesPath);

        const today = new Date().toISOString().split('T')[0];
        const logId = `exercise_${today}`;
        const summaryId = 'summary';

        await runTransaction(db, async (transaction) => {
            const logRef = doc(db, entriesPath, logId);
            const summaryRef = doc(db, entriesPath, summaryId);

            // READS FIRST (required by Firestore transactions)
            const summaryDoc = await transaction.get(summaryRef);

            let newStreak = 1;
            let lastDate = '';

            if (summaryDoc.exists()) {
                const data = summaryDoc.data();
                const currentStreak = data.exerciseStreak || 0;
                lastDate = data.lastExerciseDate || '';

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastDate === today) {
                    newStreak = currentStreak; // Already logged today, keep streak
                } else if (lastDate === yesterdayStr) {
                    newStreak = currentStreak + 1; // Consecutive day
                } else {
                    newStreak = 1; // Streak broken or new
                }
            }

            // WRITES AFTER ALL READS
            transaction.set(logRef, {
                date: today,
                exercised: true,
                description,
                type: 'exercise-log',
                userId,
                createdAt: serverTimestamp()
            });

            transaction.set(summaryRef, {
                type: 'stats',
                userId,
                exerciseStreak: newStreak,
                lastExerciseDate: today
            }, { merge: true });
        });

        console.log('Transaction completed successfully');
        return { success: true };
    } catch (error) {
        console.error('Error logging exercise:', error);
        // Log more details if available
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        throw error;
    }
}

export async function getExerciseLogs(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPath(pathInfo);

        const q = query(
            collection(db, entriesPath),
            where('type', '==', 'exercise-log')
        );

        const snapshot = await getDocs(q);
        const items = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as any[];
        return items.sort((a, b) => (a?.date < b?.date ? 1 : -1));
    } catch (error) {
        console.error('Error fetching exercise logs:', error);
        throw error;
    }
}

export async function deleteExerciseLog(userId: string, logId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPath(pathInfo);
        await deleteDoc(doc(db, entriesPath, logId));
        // Note: Deleting a log does NOT automatically recalculate the streak in this simple implementation
        // Recalculating streaks historically would require reading all logs.
        return { success: true };
    } catch (error) {
        console.error('Error deleting exercise log:', error);
        throw error;
    }
}

// ==================== HYDRATION LOGS ====================

export async function logHydration(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPath(pathInfo);
        const today = new Date().toISOString().split('T')[0];
        const logId = `hydration_${today}`;
        const summaryId = 'summary';

        await runTransaction(db, async (transaction) => {
            const logRef = doc(db, entriesPath, logId);
            const summaryRef = doc(db, entriesPath, summaryId);

            // READS FIRST (required by Firestore transactions)
            const summaryDoc = await transaction.get(summaryRef);

            let newStreak = 1;
            let lastDate = '';

            if (summaryDoc.exists()) {
                const data = summaryDoc.data();
                const currentStreak = data.hydrationStreak || 0;
                lastDate = data.lastHydrationDate || '';

                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastDate === today) {
                    newStreak = currentStreak;
                } else if (lastDate === yesterdayStr) {
                    newStreak = currentStreak + 1;
                } else {
                    newStreak = 1;
                }
            }

            // WRITES AFTER ALL READS
            transaction.set(logRef, {
                date: today,
                completed: true,
                type: 'hydration-log',
                userId,
                createdAt: serverTimestamp()
            });

            transaction.set(summaryRef, {
                type: 'stats',
                userId,
                hydrationStreak: newStreak,
                lastHydrationDate: today
            }, { merge: true });
        });

        return { success: true };
    } catch (error) {
        console.error('Error logging hydration:', error);
        throw error;
    }
}

export async function getHydrationStatus(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPath(pathInfo);
        const today = new Date().toISOString().split('T')[0];
        const logId = `hydration_${today}`;

        const logRef = doc(db, entriesPath, logId);
        const logDoc = await getDoc(logRef);

        return {
            hydratedToday: logDoc.exists() && logDoc.data().completed
        };
    } catch (error) {
        console.error('Error fetching hydration status:', error);
        throw error;
    }
}

// ==================== STATS SUMMARY ====================

export async function getStressManagementStats(userId: string) {
    try {
        const pathInfo = await getStudentPathInfo(userId);
        const entriesPath = getStudentEntriesPath(pathInfo);
        const summaryId = 'summary';

        const summaryRef = doc(db, entriesPath, summaryId);
        const summaryDoc = await getDoc(summaryRef);

        if (summaryDoc.exists()) {
            return summaryDoc.data();
        }
        return {
            hydrationStreak: 0,
            exerciseStreak: 0,
            lastHydrationDate: null,
            lastExerciseDate: null
        };
    } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
    }
}
