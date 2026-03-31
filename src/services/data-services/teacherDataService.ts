// Teacher data service - loads real data from Firestore
import { db, auth } from '@/integrations/firebase';

// Helper function to generate privacy-safe messages
const generatePrivacySafeMessage = (trigger: { category?: string; subcategory?: string; severity?: string }): string => {
  const { category = 'general', subcategory = 'general', severity = 'monitor' } = trigger;

  // Base messages for different categories
  const messages: Record<string, Record<string, string>> = {
    'academic': {
      'exam-stress': 'Expressed significant stress about upcoming assessments',
      'homework-overload': 'Indicated feeling overwhelmed by academic workload',
      'subject-difficulty': 'Reported challenges with specific subject matter',
      'performance-anxiety': 'Showed signs of anxiety related to academic performance',
      'learning-gap': 'May be experiencing gaps in foundational knowledge',
      'general': 'Academic concern detected that may need attention'
    },
    'emotional': {
      'anxiety': 'Displayed signs of anxiety that may need attention',
      'depression': 'Showed indicators of low mood or depression',
      'stress': 'Experiencing high levels of stress',
      'self-esteem': 'Expressed concerns about self-worth or confidence',
      'emotional-regulation': 'May need support with emotional regulation',
      'general': 'Emotional concern detected that may need attention'
    },
    'social': {
      'bullying': 'May be experiencing or witnessing bullying behavior',
      'conflict': 'Involved in or affected by peer conflict',
      'isolation': 'Showing signs of social withdrawal or isolation',
      'friendship-issues': 'Experiencing difficulties in peer relationships',
      'peer-pressure': 'May be facing challenging peer dynamics',
      'general': 'Social concern detected that may need attention'
    },
    'safety': {
      'self-harm': 'Expressed thoughts of self-harm or suicidal ideation',
      'abuse': 'May be experiencing or at risk of abuse',
      'violence': 'Exposed to or at risk of violence',
      'substance-use': 'Potential substance use concerns',
      'self-neglect': 'Showing signs of self-neglect or risky behavior',
      'general': 'Safety concern detected that requires immediate attention'
    },
    'behavioral': {
      'disruptive': 'Displaying disruptive classroom behavior',
      'withdrawn': 'Showing withdrawal from participation',
      'defiant': 'Demonstrating oppositional or defiant behavior',
      'impulsive': 'Exhibiting impulsive or hyperactive tendencies',
      'disengaged': 'Appears disengaged from learning activities',
      'general': 'Behavioral concern detected that may need attention'
    },
    'general': {
      'general': 'Concern detected that may need attention'
    }
  };

  // Try to get specific message, fall back to category general, then to general
  return messages[category]?.[subcategory] ||
    messages[category]?.general ||
    messages.general.general;
};
import { collection, getDocs, doc, getDoc, onSnapshot, query, orderBy, Unsubscribe } from 'firebase/firestore';

export interface Note {
  id: string;
  content: string;
  type?: 'observation' | 'communication' | 'achievement';
  category?: string;
  phaseId?: number;
  assessmentId?: string;
  timestamp: any; // Can be Date or Firebase Timestamp
  author: string;
  pinned?: boolean;
}

export interface DomainScore {
  label: string;
  score: number;
  delta?: number;
  category: 'wellbeing' | 'engagement' | 'academic' | 'social';
}

export interface TeacherStudent {
  uid: string;
  name: string;
  class: string;
  rollNo?: string;
  fullProfile?: {
    grade: string;
    age: number;
    parentContact: string;
    parentEmail: string;
    emergencyContact: string;
    address: string;
    medicalInfo: string;
    [key: string]: any;
  };
  riskLevel: 'low' | 'medium' | 'high';
  riskPercentage?: number;
  wellbeingScore: number;
  engagementRate: number;
  lastActivity: string;
  lastAssessmentDate?: string;
  reason?: string;
  duration?: string;
  avatar?: string;
  notes?: Note[];
  assessments?: Array<{
    date: number;
    wellbeingScore: number;
    engagementScore?: number;
    phaseId?: number;
    type?: 'MAJOR' | 'FOLLOW_UP' | 'MINI' | 'EXIT';
    domainScores?: Record<string, number>;
  }>;
  domainBreakdown?: DomainScore[];
  riskSurge?: boolean;
  currentPhaseId?: number;
}

export interface TeacherAnalytics {
  totalStudents: number;
  averageWellbeing: number;
  engagementRate: number;
  participationRate: number;
  performanceData: Array<{
    month: string;
    wellbeingScore: number;
    engagementScore: number;
  }>;
}

export interface TeacherActivity {
  id: string;
  title: string;
  type: 'mindfulness' | 'gratitude-practice' | 'emotional-expression' | 'stress-relief' | 'self-awareness' | 'social-skills' | 'assessment' | 'workshop' | 'counseling';
  status: 'scheduled' | 'active' | 'completed' | 'cancelled' | 'missed';
  description: string;
  scheduledDate: string;
  duration: number;
  participants: string[];
  objectives: string[];
  facilitator: string;
  location: string;
  notes?: string;
  participantNames?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface TeacherSession {
  id: string;
  title: string;
  type: 'individual' | 'small-group' | 'parent-teacher';
  scheduledDate: string;
  duration: number;
  participants: string[];
  participantNames?: string[];
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'missed';
  agenda: string[];
  outcome?: string;
  nextSteps?: string[];
  createdAt?: any;
  updatedAt?: any;
}

// Students list will be fetched from Firestore


// Fetch teacher analytics from Firestore
export const fetchTeacherAnalytics = async (classes: string[]): Promise<TeacherAnalytics> => {
  try {
    // For now, return basic analytics
    // TODO: Calculate from real student data
    return {
      totalStudents: 0, // Will be calculated from students
      averageWellbeing: 0,
      engagementRate: 0,
      participationRate: 0,
      performanceData: []
    };
  } catch (error) {
    console.error('[TeacherData] Error fetching analytics:', error);
    throw error;
  }
};

export const fetchTeacherStudents = async (classes: string[]): Promise<TeacherStudent[]> => {
  try {
    if (!auth.currentUser) {
      console.log('[TeacherData] No authenticated user');
      return [];
    }

    // Get teacher info from current user's Firestore document
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.error('[TeacherData] User document not found');
      return [];
    }

    const userData = userDocSnap.data();
    const teacherId = userData.teacherId;
    const schoolId = userData.schoolId;
    const adminId = userData.parentAdminId;
    const organizationId = userData.organizationId;
    const isIndependent = userData.isIndependent;

    if (!teacherId || !schoolId || !adminId) {
      console.error('[TeacherData] Missing teacher/school/admin ID');
      return [];
    }

    // Determine school path
    let schoolPath = '';
    if (isIndependent) {
      schoolPath = `users/${adminId}/schools/${schoolId}`;
    } else {
      schoolPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;
    }

    // Step 1: Get student IDs assigned to this teacher from assignments
    const assignmentsPath = `${schoolPath}/assignments/_list/teachers/${teacherId}/students`;
    console.log('[TeacherData] Fetching assignments from:', assignmentsPath);

    const assignmentsSnapshot = await getDocs(collection(db, assignmentsPath));
    const studentIds = assignmentsSnapshot.docs.map(doc => doc.id);

    if (studentIds.length === 0) {
      console.log('[TeacherData] No students assigned to this teacher');
      return [];
    }

    // Step 2: Fetch full student data from school/students
    const studentsPath = `${schoolPath}/students`;
    console.log('[TeacherData] Fetching student data from:', studentsPath);

    const studentsData: TeacherStudent[] = [];

    for (const studentId of studentIds) {
      const studentDocRef = doc(db, studentsPath, studentId);
      const studentDocSnap = await getDoc(studentDocRef);

      if (studentDocSnap.exists()) {
        const data = studentDocSnap.data();
        studentsData.push({
          uid: studentDocSnap.id,
          name: data.name || `${data.firstName} ${data.lastName}`,
          class: data.grade || 'N/A',
          riskLevel: data.riskLevel || 'low',
          wellbeingScore: data.wellbeingScore || 0,
          engagementRate: data.engagementRate || 80,
          lastActivity: data.lastActivity || new Date().toISOString().split('T')[0],
          fullProfile: {
            grade: data.grade || 'N/A',
            age: data.age || 0,
            parentContact: data.parentPhone || '',
            parentEmail: data.parentEmail || '',
            emergencyContact: data.parentPhone || '',
            address: data.address || '',
            medicalInfo: data.medicalInfo || 'None'
          }
        });
      }
    }

    console.log('[TeacherData] Loaded students:', studentsData.length);
    return studentsData;
  } catch (error) {
    console.error('[TeacherData] Error fetching students:', error);
    return [];
  }
};

// Additional helper functions for teacher dashboard

export const getStudentsByRiskLevel = (students: TeacherStudent[], riskLevel: 'low' | 'medium' | 'high') => {
  return students.filter(student => student.riskLevel === riskLevel);
};

export const getClassStatistics = (students: TeacherStudent[], className: string) => {
  const classStudents = students.filter(student => student.class === className);
  const averageWellbeing = classStudents.reduce((sum, student) => sum + student.wellbeingScore, 0) / classStudents.length;

  return {
    totalStudents: classStudents.length,
    averageWellbeing: Math.round(averageWellbeing),
    riskDistribution: {
      low: classStudents.filter(s => s.riskLevel === 'low').length,
      medium: classStudents.filter(s => s.riskLevel === 'medium').length,
      high: classStudents.filter(s => s.riskLevel === 'high').length,
    }
  };
};

export const getRecentActivityStudents = (students: TeacherStudent[], days: number = 7) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  return students.filter(student => {
    const lastActivity = new Date(student.lastActivity);
    return lastActivity >= cutoffDate;
  });
};

/**
 * Set up real-time listener for teacher's students with their latest assessment data
 * @param callback Function to call when student data updates
 * @returns Unsubscribe function to stop listening
 */
export const subscribeToTeacherStudents = async (
  callback: (students: TeacherStudent[]) => void
): Promise<Unsubscribe | null> => {
  try {
    if (!auth.currentUser) {
      console.log('[TeacherData] No authenticated user');
      return null;
    }

    // Get teacher info
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.error('[TeacherData] User document not found');
      return null;
    }

    const userData = userDocSnap.data();
    const teacherId = userData.teacherId;
    const schoolId = userData.schoolId;
    const adminId = userData.parentAdminId;
    const organizationId = userData.organizationId;
    const isIndependent = userData.isIndependent;

    if (!teacherId || !schoolId || !adminId) {
      console.error('[TeacherData] Missing teacher/school/admin ID');
      return null;
    }

    // Determine school path
    let schoolPath = '';
    if (isIndependent) {
      schoolPath = `users/${adminId}/schools/${schoolId}`;
    } else {
      schoolPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;
    }

    // Get student IDs assigned to this teacher
    const assignmentsPath = `${schoolPath}/assignments/_list/teachers/${teacherId}/students`;
    const assignmentsSnapshot = await getDocs(collection(db, assignmentsPath));
    const studentIds = assignmentsSnapshot.docs.map(doc => doc.id);

    if (studentIds.length === 0) {
      console.log('[TeacherData] No students assigned to this teacher');
      callback([]);
      return () => { }; // Return empty unsubscribe function
    }

    // Set up listeners for each student and their assessments
    const unsubscribers: Unsubscribe[] = [];
    const studentsMap = new Map<string, TeacherStudent>();

    const updateCallback = () => {
      callback(Array.from(studentsMap.values()));
    };

    for (const studentId of studentIds) {
      const studentDocRef = doc(db, `${schoolPath}/students`, studentId);

      // Listen to student document
      const unsubStudent = onSnapshot(studentDocRef, async (studentDoc) => {
        if (studentDoc.exists()) {
          const data = studentDoc.data();

          // Get latest assessment for this student
          const assessmentsPath = `${schoolPath}/students/${studentId}/assessments`;
          const assessmentsQuery = query(
            collection(db, assessmentsPath),
            orderBy('assessmentDate', 'desc')
          );

          // Set up listener for assessments
          const unsubAssessments = onSnapshot(
            assessmentsQuery,
            (assessmentsSnap) => {
              let riskLevel: 'low' | 'medium' | 'high' = 'low';
              let wellbeingScore = 0;
              let lastActivity = new Date().toISOString().split('T')[0];
              let reason = '';
              let assessments: { date: number; wellbeingScore: number }[] = [];

              console.log(`[TeacherData] Assessments for ${studentId}:`, assessmentsSnap.size, 'found');

              if (!assessmentsSnap.empty) {
                const latestAssessment = assessmentsSnap.docs[0].data();
                const riskPercentage = latestAssessment.riskPercentage || 0;
                const riskCategory = typeof latestAssessment.riskCategory === 'object'
                  ? (latestAssessment.riskCategory.label || 'Low Risk')
                  : (latestAssessment.riskCategory || 'Low Risk');

                console.log(`[TeacherData] Latest assessment for ${studentId}:`, {
                  riskPercentage,
                  riskCategory,
                  assessmentDate: latestAssessment.assessmentDate
                });

                // Calculate wellbeing score (inverse of risk)
                wellbeingScore = Math.round(100 - riskPercentage);

                // Determine risk level
                if (riskCategory === 'High Risk' || riskPercentage >= 70) {
                  riskLevel = 'high';
                  reason = 'High risk assessment score';
                } else if (riskCategory === 'Moderate Risk' || riskPercentage >= 40) {
                  riskLevel = 'medium';
                  reason = 'Moderate risk indicators';
                } else {
                  riskLevel = 'low';
                }

                // Get last activity date
                if (latestAssessment.assessmentDate) {
                  const assessmentDate = latestAssessment.assessmentDate.toDate();
                  lastActivity = assessmentDate.toISOString().split('T')[0];
                }

                // Build full assessments history for chart bucketing
                assessments = assessmentsSnap.docs.map(docSnap => {
                  const aData = docSnap.data() as any;
                  const aRiskPercentage = aData.riskPercentage || 0;
                  const aWellbeingScore = Math.round(100 - aRiskPercentage);

                  let dateMs = Date.now();
                  const rawDate = aData.assessmentDate;
                  if (rawDate?.toDate) {
                    dateMs = rawDate.toDate().getTime();
                  } else if (rawDate instanceof Date) {
                    dateMs = rawDate.getTime();
                  } else if (typeof rawDate === 'number') {
                    dateMs = rawDate;
                  }

                  return {
                    date: dateMs,
                    wellbeingScore: aWellbeingScore,
                    domainScores: aData.domainScores || {}
                  };
                });
              }

              // Update student in map
              studentsMap.set(studentId, {
                uid: studentId,
                name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
                class: data.grade || data.class || 'N/A',
                riskLevel,
                wellbeingScore,
                engagementRate: data.engagementRate || 80,
                lastActivity,
                reason,
                fullProfile: {
                  grade: data.grade || 'N/A',
                  age: data.age || 0,
                  parentContact: data.parentPhone || '',
                  parentEmail: data.parentEmail || '',
                  emergencyContact: data.parentPhone || '',
                  address: data.address || '',
                  medicalInfo: data.medicalInfo || 'None'
                },
                assessments
              });

              updateCallback();
            },
            (error) => {
              console.error(`[TeacherData] Error listening to assessments for ${studentId}:`, error);
              console.error('[TeacherData] This might be a missing Firebase index. Check Firebase console.');
              // Still update with default values
              studentsMap.set(studentId, {
                uid: studentId,
                name: data.name || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown',
                class: data.grade || data.class || 'N/A',
                riskLevel: 'low',
                wellbeingScore: 0,
                engagementRate: data.engagementRate || 80,
                lastActivity: new Date().toISOString().split('T')[0],
                reason: '',
                fullProfile: {
                  grade: data.grade || 'N/A',
                  age: data.age || 0,
                  parentContact: data.parentPhone || '',
                  parentEmail: data.parentEmail || '',
                  emergencyContact: data.parentPhone || '',
                  address: data.address || '',
                  medicalInfo: data.medicalInfo || 'None'
                }
              });
              updateCallback();
            });

          unsubscribers.push(unsubAssessments);
        }
      });

      unsubscribers.push(unsubStudent);
    }

    // Return combined unsubscribe function
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  } catch (error) {
    console.error('[TeacherData] Error setting up real-time listener:', error);
    return null;
  }
};

/**
 * Calculate real-time analytics from student data
 */
export const calculateAnalyticsFromStudents = (students: TeacherStudent[]): TeacherAnalytics => {
  if (students.length === 0) {
    return {
      totalStudents: 0,
      averageWellbeing: 0,
      engagementRate: 0,
      participationRate: 0,
      performanceData: []
    };
  }

  const studentsWithWellbeing = students.filter(s => s.wellbeingScore > 0);
  const averageWellbeing = studentsWithWellbeing.length > 0
    ? Math.round(studentsWithWellbeing.reduce((sum, s) => sum + s.wellbeingScore, 0) / studentsWithWellbeing.length)
    : 0;

  const totalEngagement = students.reduce((sum, s) => sum + s.engagementRate, 0);
  const averageEngagement = students.length > 0
    ? Math.round(totalEngagement / students.length)
    : 0;

  // Generate performance data for last 3 months
  const performanceData = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();

  for (let i = 2; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    performanceData.push({
      month: months[monthIndex],
      wellbeingScore: averageWellbeing,
      engagementScore: averageEngagement
    });
  }

  return {
    totalStudents: students.length,
    averageWellbeing,
    engagementRate: averageEngagement,
    participationRate: Math.round(averageEngagement * 0.9), // Mocking participation as 90% of engagement for now
    performanceData
  };
};

/**
 * Teacher Assessment Assignment Interface
 */
export interface TeacherAssessmentAssignment {
  id: string;
  title: string;
  type: 'wellbeing' | 'cognitive' | 'behavioral' | 'academic' | 'social';
  status: 'draft' | 'active' | 'completed' | 'archived';
  studentsAssigned: number;
  studentsCompleted: number;
  createdDate: string;
  startDate: string;
  endDate: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  assignedStudents: string[];
  createdBy?: string;
}

/**
 * Subscribe to real-time teacher assessment assignments
 */
export const subscribeToTeacherAssessments = async (
  callback: (assessments: TeacherAssessmentAssignment[]) => void
): Promise<(() => void) | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('[TeacherAssessments] No authenticated user');
      return null;
    }

    // Get teacher user data
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      console.error('[TeacherAssessments] User document not found');
      return null;
    }

    const userData = userDoc.data();
    const adminId = userData.parentAdminId;
    const schoolId = userData.schoolId;
    const organizationId = userData.organizationId;

    if (!adminId || !schoolId) {
      console.error('[TeacherAssessments] Missing school information');
      return null;
    }

    // Construct path
    const isIndependent = !organizationId;
    const schoolPath = isIndependent
      ? `users/${adminId}/schools/${schoolId}`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

    console.log('[TeacherAssessments] Setting up listener at:', schoolPath);

    // Set up listener for assessment assignments
    const assignmentsPath = `${schoolPath}/assessment_assignments`;
    const assignmentsQuery = query(
      collection(db, assignmentsPath),
      orderBy('createdDate', 'desc')
    );

    const unsubscribe = onSnapshot(assignmentsQuery, async (snapshot) => {
      console.log('[TeacherAssessments] Received', snapshot.size, 'assignments');

      if (snapshot.empty) {
        callback([]);
        return;
      }

      const assessments: TeacherAssessmentAssignment[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const assignedStudentIds = data.assignedStudents || [];

        // Count completed assessments for each assigned student
        let completedCount = 0;

        for (const studentId of assignedStudentIds) {
          try {
            const studentAssessmentsPath = `${schoolPath}/students/${studentId}/assessments`;
            const studentAssessmentsQuery = query(
              collection(db, studentAssessmentsPath),
              orderBy('assessmentDate', 'desc')
            );

            const studentAssessments = await getDocs(studentAssessmentsQuery);

            // Check if student has any assessment within the date range
            if (!studentAssessments.empty) {
              const startDate = data.startDate ? new Date(data.startDate) : null;
              const endDate = data.endDate ? new Date(data.endDate) : null;

              const hasCompletedInRange = studentAssessments.docs.some(doc => {
                const assessmentData = doc.data();
                const assessmentDate = assessmentData.assessmentDate?.toDate();

                if (!assessmentDate) return false;
                if (startDate && assessmentDate < startDate) return false;
                if (endDate && assessmentDate > endDate) return false;

                return true;
              });

              if (hasCompletedInRange) {
                completedCount++;
              }
            }
          } catch (error) {
            console.error(`[TeacherAssessments] Error checking student ${studentId}:`, error);
          }
        }

        assessments.push({
          id: docSnap.id,
          title: data.title || 'Untitled Assessment',
          type: data.type || 'wellbeing',
          status: data.status || 'draft',
          studentsAssigned: assignedStudentIds.length,
          studentsCompleted: completedCount,
          createdDate: data.createdDate || new Date().toISOString().split('T')[0],
          startDate: data.startDate || '',
          endDate: data.endDate || '',
          description: data.description || '',
          priority: data.priority,
          assignedStudents: assignedStudentIds,
          createdBy: data.createdBy
        });
      }

      callback(assessments);
    });

    return unsubscribe;
  } catch (error) {
    console.error('[TeacherAssessments] Error setting up listener:', error);
    return null;
  }
};

/**
 * Chat Trigger Interface
 */
export interface ChatTrigger {
  id: string;
  studentId: string;
  studentName: string;
  message: string;
  privacySafeMessage: string; // AI-generated, privacy-safe version of the message
  severity: 'monitor' | 'low' | 'medium' | 'high' | 'critical';
  category: string;
  subcategory: string;
  reason: string;
  timestamp: Date;
  schoolId: string;
  organizationId?: string;
  indicators: string[]; // Key indicators from the message
  recommendedActions: string[]; // Suggested actions for teachers
  engagementMetrics?: {
    interactionCount: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    peakTimes?: string[];
  };
  status?: 'new' | 'in-progress' | 'resolved' | 'escalated';
  lastUpdated: Date;
  metadata?: {
    isAnonymous?: boolean;
    requiresFollowUp?: boolean;
    confidenceScore?: number;
  };
}

/**
 * Subscribe to real-time chat triggers for teacher's students
 */
export const subscribeToChatTriggers = async (
  callback: (triggers: ChatTrigger[]) => void
): Promise<(() => void) | null> => {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.error('[ChatTriggers] No authenticated user');
      return null;
    }

    // Get teacher user data
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      console.error('[ChatTriggers] User document not found');
      return null;
    }

    const userData = userDoc.data();
    const teacherId = userData.teacherId;
    const adminId = userData.parentAdminId;
    const schoolId = userData.schoolId;
    const organizationId = userData.organizationId;

    if (!teacherId || !schoolId || !adminId) {
      console.error('[ChatTriggers] Missing teacher/school information');
      return null;
    }

    // Determine school path
    const isIndependent = !organizationId;
    const schoolPath = isIndependent
      ? `users/${adminId}/schools/${schoolId}`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

    // Get student IDs assigned to this teacher
    const assignmentsPath = `${schoolPath}/assignments/_list/teachers/${teacherId}/students`;
    const assignmentsSnapshot = await getDocs(collection(db, assignmentsPath));
    const studentIds = assignmentsSnapshot.docs.map(doc => doc.id);

    if (studentIds.length === 0) {
      console.log('[ChatTriggers] No students assigned to this teacher');
      callback([]);
      return () => { };
    }

    console.log('[ChatTriggers] Monitoring triggers for', studentIds.length, 'students');

    // Set up listeners for each student's chatTriggers subcollection
    const unsubscribers: Unsubscribe[] = [];
    const triggersMap = new Map<string, ChatTrigger>();

    const updateCallback = () => {
      // Sort by timestamp descending (most recent first)
      const sortedTriggers = Array.from(triggersMap.values()).sort((a, b) =>
        b.timestamp.getTime() - a.timestamp.getTime()
      );
      callback(sortedTriggers);
    };

    for (const studentId of studentIds) {
      const triggersPath = `${schoolPath}/students/${studentId}/chatTriggers`;
      const triggersQuery = query(
        collection(db, triggersPath),
        orderBy('timestamp', 'desc')
      );

      const unsubTriggers = onSnapshot(
        triggersQuery,
        (snapshot) => {
          snapshot.docChanges().forEach(change => {
            const data = change.doc.data();
            const triggerId = change.doc.id;

            if (change.type === 'added' || change.type === 'modified') {
              // Handle timestamp - could be Firestore Timestamp, Date, or number
              let timestamp: Date;
              if (data.timestamp?.toDate) {
                timestamp = data.timestamp.toDate();
              } else if (data.timestamp instanceof Date) {
                timestamp = data.timestamp;
              } else if (typeof data.timestamp === 'number') {
                timestamp = new Date(data.timestamp);
              } else {
                timestamp = new Date(); // Fallback to now
              }

              // Generate a privacy-safe message based on category and subcategory
              const privacySafeMessage = generatePrivacySafeMessage({
                category: data.category,
                subcategory: data.subcategory || 'general',
                severity: data.severity
              });

              triggersMap.set(triggerId, {
                id: triggerId,
                studentId: data.studentId,
                studentName: data.studentName,
                message: data.message,
                privacySafeMessage: data.privacySafeMessage || privacySafeMessage,
                severity: data.severity || 'monitor',
                category: data.category || 'general',
                subcategory: data.subcategory || 'general',
                reason: data.reason || 'Pattern detected in student interactions',
                timestamp: timestamp,
                schoolId: data.schoolId,
                organizationId: data.organizationId,
                indicators: data.indicators || [
                  `Category: ${data.category || 'general'}`,
                  data.severity ? `Severity: ${data.severity}` : null,
                  data.subcategory ? `Subcategory: ${data.subcategory}` : null
                ].filter(Boolean) as string[],
                recommendedActions: data.recommendedActions || [
                  'Check in with the student privately',
                  'Document the concern in the student record',
                  'Consider referring to school counselor if concerns persist'
                ],
                engagementMetrics: data.engagementMetrics || {
                  interactionCount: data.interactionCount || 1,
                  trend: data.trend || 'stable',
                  peakTimes: data.peakTimes || []
                },
                status: data.status || 'new',
                lastUpdated: new Date(),
                metadata: {
                  isAnonymous: data.metadata?.isAnonymous || false,
                  requiresFollowUp: data.metadata?.requiresFollowUp || false,
                  confidenceScore: data.metadata?.confidenceScore || 0.8
                }
              });
            } else if (change.type === 'removed') {
              triggersMap.delete(triggerId);
            }
          });

          updateCallback();
        },
        (error) => {
          console.error(`[ChatTriggers] Error listening to triggers for ${studentId}:`, error);
        }
      );

      unsubscribers.push(unsubTriggers);
    }

    // Return combined unsubscribe function
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  } catch (error) {
    console.error('[ChatTriggers] Error setting up listener:', error);
    return null;
  }
};

/**
 * Subscribe to teacher activities
 */
export const subscribeToTeacherActivities = async (
  callback: (activities: TeacherActivity[]) => void
): Promise<(() => void) | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;

    const userData = userDoc.data();
    const adminId = userData.parentAdminId;
    const schoolId = userData.schoolId;
    const organizationId = userData.organizationId;
    const teacherId = userData.teacherId;

    if (!adminId || !schoolId || !teacherId) return null;

    const schoolPath = !organizationId
      ? `users/${adminId}/schools/${schoolId}`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

    const activitiesPath = `${schoolPath}/teachers/${teacherId}/activities`;
    const activitiesQuery = query(
      collection(db, activitiesPath),
      orderBy('scheduledDate', 'desc')
    );

    return onSnapshot(activitiesQuery, (snapshot) => {
      const activities = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeacherActivity[];
      callback(activities);
    });
  } catch (error) {
    console.error('[TeacherActivities] Error:', error);
    return null;
  }
};

/**
 * Subscribe to teacher sessions
 */
export const subscribeToTeacherSessions = async (
  callback: (sessions: TeacherSession[]) => void
): Promise<(() => void) | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;

    const userData = userDoc.data();
    const adminId = userData.parentAdminId;
    const schoolId = userData.schoolId;
    const organizationId = userData.organizationId;
    const teacherId = userData.teacherId;

    if (!adminId || !schoolId || !teacherId) return null;

    const schoolPath = !organizationId
      ? `users/${adminId}/schools/${schoolId}`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

    const sessionsPath = `${schoolPath}/teachers/${teacherId}/sessions`;
    const sessionsQuery = query(
      collection(db, sessionsPath),
      orderBy('scheduledDate', 'desc')
    );

    return onSnapshot(sessionsQuery, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeacherSession[];
      callback(sessions);
    });
  } catch (error) {
    console.error('[TeacherSessions] Error:', error);
    return null;
  }
};

/**
 * Resolve a chat trigger and add an internal note
 */
export const resolveChatTrigger = async (
  studentId: string,
  triggerId: string,
  note: string,
  status: 'resolved' | 'in-progress' = 'resolved'
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    if (!userData) return;

    const { schoolId, parentAdminId: adminId, organizationId } = userData;
    const schoolPath = !organizationId
      ? `users/${adminId}/schools/${schoolId}`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

    const triggerRef = doc(db, `${schoolPath}/students/${studentId}/chatTriggers`, triggerId);

    await setDoc(triggerRef, {
      status,
      resolutionNote: note,
      resolvedBy: user.email,
      lastUpdated: serverTimestamp()
    }, { merge: true });

    // Fetch student to get current phase for the note
    const studentDoc = await getDoc(doc(db, `${schoolPath}/students`, studentId));
    const studentData = studentDoc.data();

    // Also add this as a clinical note to the student's record
    await addStudentNote(studentId, {
      content: note,
      category: 'Intervention',
      author: user.email || 'Teacher',
      type: 'observation',
      phaseId: studentData?.currentPhaseId || 1
    });

  } catch (error) {
    console.error('[ChatTriggers] Error resolving trigger:', error);
    throw error;
  }
};

/**
 * Add a clinical/pedagogical note to a student's record
 */
export const addStudentNote = async (
  studentId: string,
  note: Omit<Note, 'id' | 'timestamp'>
): Promise<void> => {
  try {
    const user = auth.currentUser;
    if (!user) return;

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const userData = userDoc.data();
    if (!userData) return;

    const { schoolId, parentAdminId: adminId, organizationId } = userData;
    const schoolPath = !organizationId
      ? `users/${adminId}/schools/${schoolId}`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

    const notesCollection = collection(db, `${schoolPath}/students/${studentId}/notes`);

    await setDoc(doc(notesCollection), {
      ...note,
      timestamp: serverTimestamp(),
    });

  } catch (error) {
    console.error('[StudentNotes] Error adding note:', error);
    throw error;
  }
};

import { setDoc, serverTimestamp } from 'firebase/firestore';