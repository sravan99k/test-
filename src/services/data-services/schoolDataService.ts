import { db, auth } from "@/integrations/firebase";
import { collection, getDocs, doc, getDoc, query, orderBy, limit, startAfter, DocumentSnapshot, writeBatch, serverTimestamp, setDoc, deleteDoc } from "firebase/firestore";

// Draft saving interfaces
export interface TransitionDraftState {
  studentId: string;
  action: 'promote' | 'retain' | 'left';
  section: string;
  reviewed: boolean;
}

export interface TransitionDraft {
  academicYear: string;
  targetYear: string;
  lastUpdated: any;
  studentStates: Record<string, TransitionDraftState>;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender?: string;
  grade: string;
  section: string;
  risk_level: 'low' | 'medium' | 'high';
  last_assessment: string;
  wellbeing_score: number;
  attendance: number;
  dateAdded: string;
  parentName?: string;
  parentPhone?: string;
  interventions: {
    type: string;
    date: string;
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  }[];
  assessments: {
    date: string;
    score: number;
    category: string;
  }[];
}

export interface SchoolAnalytics {
  totalStudents: number;
  highRiskStudents: number;
  interventionsThisMonth: number;
  averageWellbeingScore: number;
  wellbeingTrend: 'improving' | 'declining' | 'stable';
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  wellnessDistribution: {
    thriving: number;
    stable: number;
    needsSupport: number;
    atRisk: number;
  };
  gradeCompletionData: Array<{
    name: string;
    total: number;
    completed: number;
  }>;
  totalAssessments: number;
  interventionSuccessRate: number;
  gradeDistribution: Record<string, number>;
  recentAssessments: Array<{
    date: string;
    count: number;
  }>;
}

export interface StudentPromotionUpdate {
  studentId: string;
  action: 'promote' | 'retain' | 'left';
  newSection?: string;
  currentGrade: string;
}

export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot | null;
}

export interface PaginatedStudentsResult {
  students: Student[];
  lastDoc: DocumentSnapshot | null;
  hasMore: boolean;
}

/**
 * Fetch real students from Firestore for a school with pagination support
 */
export const fetchStudentsPaginated = async (
  filters: {
    school: string;
    branch: string;
    state: string;
    city: string;
    pincode: string;
  },
  options: PaginationOptions = {}
): Promise<PaginatedStudentsResult> => {
  const { pageSize = 50, lastDoc = null } = options;

  try {
    if (!auth.currentUser) {
      console.error('[SchoolData] No authenticated user');
      return { students: [], lastDoc: null, hasMore: false };
    }

    // Get user document to find school location
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (!userDocSnap.exists()) {
      console.error('[SchoolData] User document not found');
      return { students: [], lastDoc: null, hasMore: false };
    }

    const userData = userDocSnap.data();
    console.log('[SchoolData] User Data:', userData);

    const adminId = userData.parentAdminId || auth.currentUser.uid;
    const schoolId = userData.schoolId;
    const organizationId = userData.organizationId;
    const isIndependent = userData.isIndependent;

    console.log('[SchoolData] Path Variables:', { adminId, schoolId, organizationId, isIndependent });

    if (!adminId || !schoolId) {
      console.error('[SchoolData] Missing school information');
      return { students: [], lastDoc: null, hasMore: false };
    }

    // Construct path to students collection - fallback to schools if organizationId is missing
    const studentsPath = (isIndependent || !organizationId)
      ? `users/${adminId}/schools/${schoolId}/students`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students`;

    console.log('[SchoolData] Final Path:', studentsPath);

    // Build query with pagination
    let studentsQuery = query(
      collection(db, studentsPath),
      orderBy('name'),
      limit(pageSize + 1)
    );

    if (lastDoc) {
      studentsQuery = query(
        collection(db, studentsPath),
        orderBy('name'),
        startAfter(lastDoc),
        limit(pageSize + 1)
      );
    }

    const studentsSnapshot = await getDocs(studentsQuery);

    if (studentsSnapshot.empty) {
      console.log('[SchoolData] No students found at:', studentsPath);
      return { students: [], lastDoc: null, hasMore: false };
    }

    const hasMore = studentsSnapshot.docs.length > pageSize;
    const studentDocs = hasMore ? studentsSnapshot.docs.slice(0, pageSize) : studentsSnapshot.docs;
    const newLastDoc = studentDocs.length > 0 ? studentDocs[studentDocs.length - 1] : null;

    // Optimized fetch: Only query assessments if not already denormalized on the student doc
    const studentsData = await Promise.all(studentDocs.map(async (studentDoc) => {
      const studentData = studentDoc.data();

      // Check for denormalized data first (Performance optimization)
      if (studentData.latestAssessment) {
        const la = studentData.latestAssessment;
        let lastAssessment = 'No data';
        if (la.assessmentDate) {
          const date = la.assessmentDate.toDate ? la.assessmentDate.toDate() : new Date(la.assessmentDate);
          lastAssessment = date.toISOString().split('T')[0];
        }

        return {
          id: studentDoc.id,
          name: studentData.name || `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim() || 'Unknown',
          email: studentData.email || studentData.parentEmail || '',
          phone: studentData.phone || '',
          gender: studentData.gender || 'Not specified',
          grade: studentData.grade || 'N/A',
          section: studentData.section || 'A',
          risk_level: studentData.riskLevel || (la.riskPercentage >= 70 ? 'high' : la.riskPercentage >= 40 ? 'medium' : 'low'),
          last_assessment: lastAssessment,
          wellbeing_score: la.wellbeingScore || Math.round(100 - la.riskPercentage),
          attendance: studentData.attendance || 90,
          dateAdded: studentData.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0],
          parentName: studentData.parentName || '',
          parentPhone: studentData.parentPhone || '',
          interventions: studentData.interventions || [],
          assessments: []
        } as Student;
      }

      // Fallback for legacy data/old students (this is what made it slow before)
      const assessmentsPath = `${studentsPath}/${studentDoc.id}/assessments`;
      const assessmentsQuery = query(
        collection(db, assessmentsPath),
        orderBy('assessmentDate', 'desc'),
        limit(1)
      );

      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      let wellbeingScore = 0;
      let lastAssessment = 'No data';

      try {
        const assessmentsSnapshot = await getDocs(assessmentsQuery);
        if (!assessmentsSnapshot.empty) {
          const latestAssessment = assessmentsSnapshot.docs[0].data();
          const riskPercentage = latestAssessment.riskPercentage || 0;
          riskLevel = riskPercentage >= 70 ? 'high' : riskPercentage >= 40 ? 'medium' : 'low';
          wellbeingScore = Math.round(100 - riskPercentage);
          if (latestAssessment.assessmentDate) {
            const date = latestAssessment.assessmentDate.toDate();
            lastAssessment = date.toISOString().split('T')[0];
          }
        }
      } catch (err) {
        console.warn(`[SchoolData] Assessment error for ${studentDoc.id}:`, err);
      }

      return {
        id: studentDoc.id,
        name: studentData.name || `${studentData.firstName || ''} ${studentData.lastName || ''}`.trim() || 'Unknown',
        email: studentData.email || studentData.parentEmail || '',
        phone: studentData.phone || '',
        gender: studentData.gender || 'Not specified',
        grade: studentData.grade || 'N/A',
        section: studentData.section || 'A',
        risk_level: riskLevel,
        last_assessment: lastAssessment,
        wellbeing_score: wellbeingScore,
        attendance: studentData.attendance || 90,
        dateAdded: studentData.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || new Date().toISOString().split('T')[0],
        parentName: studentData.parentName || '',
        parentPhone: studentData.parentPhone || '',
        interventions: studentData.interventions || [],
        assessments: []
      } as Student;
    }));

    console.log(`[SchoolData] Successfully loaded ${studentsData.length} students.`);
    return { students: studentsData, lastDoc: newLastDoc, hasMore };
  } catch (error) {
    console.error('[SchoolData] Error fetching students:', error);
    return { students: [], lastDoc: null, hasMore: false };
  }
};

/**
 * Fetch all students (non-paginated) - Use with caution for large schools
 */
export const fetchStudents = async (filters: {
  school: string;
  branch: string;
  state: string;
  city: string;
  pincode: string;
}): Promise<Student[]> => {
  const result = await fetchStudentsPaginated(filters, { pageSize: 1000 });
  return result.students;
};

/**
 * Calculate analytics from real student data
 */
export const fetchSchoolAnalytics = async (filters: {
  school: string;
  branch: string;
  state: string;
  city: string;
  pincode: string;
}): Promise<SchoolAnalytics> => {
  try {
    // Fetch students first (using high limit for analytics)
    const students = await fetchStudents(filters);

    // Calculate risk distribution
    const riskDistribution = {
      low: students.filter(s => s.risk_level === 'low').length,
      medium: students.filter(s => s.risk_level === 'medium').length,
      high: students.filter(s => s.risk_level === 'high').length
    };

    // Calculate wellness distribution (only for students with assessments)
    const activeStudents = students.filter(s => s.last_assessment !== 'No data');
    const wellnessDistribution = {
      thriving: activeStudents.filter(s => s.wellbeing_score >= 80).length,
      stable: activeStudents.filter(s => s.wellbeing_score >= 60 && s.wellbeing_score < 80).length,
      needsSupport: activeStudents.filter(s => s.wellbeing_score >= 40 && s.wellbeing_score < 60).length,
      atRisk: activeStudents.filter(s => s.wellbeing_score < 40).length
    };

    // Calculate grade completion data
    const grades = Array.from(new Set(students.map(s => s.grade))).sort();
    const gradeCompletionData = grades.map(grade => {
      const gradeStudents = students.filter(s => s.grade === grade);
      const completed = gradeStudents.filter(s => s.last_assessment !== 'No data').length;
      return {
        name: `Grade ${grade}`,
        total: gradeStudents.length,
        completed
      };
    });

    const totalAssessments = students.filter(s => s.last_assessment !== 'No data').length;

    // Calculate grade distribution
    const gradeDistribution: Record<string, number> = {};
    students.forEach(student => {
      const grade = student.grade;
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    });

    // Calculate overall wellbeing score (weighted average based on recency)
    const now = Date.now();
    let weightedSum = 0;
    let totalWeight = 0;

    const weightForAgeDays = (ageDays: number) => {
      if (ageDays <= 7) return 1.0;
      if (ageDays <= 30) return 0.7;
      if (ageDays <= 90) return 0.5;
      return 0.3;
    };

    students.forEach(student => {
      if (student.last_assessment !== 'No data') {
        const assessmentDate = new Date(student.last_assessment);
        const ageDays = Math.max(0, (now - assessmentDate.getTime()) / (1000 * 60 * 60 * 24));
        const weight = weightForAgeDays(ageDays);
        weightedSum += student.wellbeing_score * weight;
        totalWeight += weight;
      }
    });

    const averageWellbeingScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

    // Count interventions this month
    const currentMonth = new Date().getMonth();
    const interventionsThisMonth = students.reduce((count, student) => {
      const monthInterventions = student.interventions.filter(int => {
        const intDate = new Date(int.date);
        return intDate.getMonth() === currentMonth;
      });
      return count + monthInterventions.length;
    }, 0);

    // Calculate intervention success rate
    const allInterventions = students.flatMap(s => s.interventions);
    const completedInterventions = allInterventions.filter(i => i.status === 'completed').length;
    const interventionSuccessRate = allInterventions.length > 0
      ? Math.round((completedInterventions / allInterventions.length) * 100)
      : 0;

    return {
      totalStudents: students.length,
      highRiskStudents: riskDistribution.high,
      interventionsThisMonth,
      averageWellbeingScore,
      wellbeingTrend: 'stable',
      riskDistribution,
      wellnessDistribution,
      gradeCompletionData,
      totalAssessments,
      interventionSuccessRate,
      gradeDistribution,
      recentAssessments: []
    };
  } catch (error) {
    console.error('[SchoolData] Error calculating analytics:', error);
    throw error;
  }
};

/**
 * Fetch basic school info (name, etc)
 */
export const fetchSchoolInfo = async () => {
  try {
    if (!auth.currentUser) return null;
    const userDocSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (!userDocSnap.exists()) return null;

    const userData = userDocSnap.data();
    const adminId = userData.parentAdminId || auth.currentUser.uid;
    const schoolId = userData.schoolId;
    const organizationId = userData.organizationId;
    const isIndependent = userData.isIndependent;

    if (!adminId || !schoolId) return null;

    const schoolPath = (isIndependent || !organizationId)
      ? `users/${adminId}/schools/${schoolId}`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

    const schoolSnap = await getDoc(doc(db, schoolPath));
    if (schoolSnap.exists()) {
      return { id: schoolSnap.id, ...schoolSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('[SchoolData] Error fetching school info:', error);
    return null;
  }
};

/**
 * Fetch school settings (including academic year)
 */
export const getSchoolSettings = async () => {
  try {
    if (!auth.currentUser) return null;
    const userDocSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (!userDocSnap.exists()) return null;

    const userData = userDocSnap.data();
    const adminId = userData.parentAdminId || auth.currentUser.uid;
    const schoolId = userData.schoolId;
    const organizationId = userData.organizationId;
    const isIndependent = userData.isIndependent;

    const schoolPath = (isIndependent || !organizationId)
      ? `users/${adminId}/schools/${schoolId}`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

    const settingsSnap = await getDoc(doc(db, `${schoolPath}/settings`, "academic"));
    if (settingsSnap.exists()) {
      const data = settingsSnap.data();
      return {
        academicYear: data.academicYear || "2025-26",
        term: data.term || "Phase 2"
      };
    }

    // Return default if not found
    return { academicYear: "2025-26", term: "Phase 2" };
  } catch (error) {
    console.error('[SchoolData] Error fetching settings:', error);
    return { academicYear: "2025-26" };
  }
};

/**
 * Update academic year and promote/retain students
 */
export const updateAcademicYear = async (newYear: string, studentUpdates: StudentPromotionUpdate[]) => {
  const batch = writeBatch(db);

  try {
    if (!auth.currentUser) throw new Error("Not authenticated");
    const userDocSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
    const userData = userDocSnap.data()!;

    const adminId = userData.parentAdminId || auth.currentUser.uid;
    const schoolId = userData.schoolId;
    const organizationId = userData.organizationId;
    const isIndependent = userData.isIndependent;

    const schoolPath = (isIndependent || !organizationId)
      ? `users/${adminId}/schools/${schoolId}`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

    const CHUNK_SIZE = 450;
    const promotedCount = studentUpdates.filter(u => u.action === 'promote').length;
    const leftCount = studentUpdates.filter(u => u.action === 'left').length;
    const retainedCount = studentUpdates.filter(u => u.action === 'retain').length;

    for (let i = 0; i < studentUpdates.length; i += CHUNK_SIZE) {
      const chunk = studentUpdates.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);

      chunk.forEach(update => {
        const studentRef = doc(db, `${schoolPath}/students`, update.studentId);

        if (update.action === 'promote') {
          const nextGrade = parseInt(update.currentGrade) + 1;
          batch.update(studentRef, {
            grade: String(nextGrade),
            section: update.newSection || 'A',
            updatedAt: serverTimestamp()
          });
        } else if (update.action === 'retain') {
          batch.update(studentRef, {
            section: update.newSection || 'A',
            updatedAt: serverTimestamp()
          });
        } else if (update.action === 'left') {
          batch.update(studentRef, {
            status: 'left',
            updatedAt: serverTimestamp()
          });
        }
      });

      // Special case: Add settings update to the FIRST batch only
      if (i === 0) {
        const settingsRef = doc(db, `${schoolPath}/settings`, "academic");
        batch.set(settingsRef, { academicYear: newYear }, { merge: true });
      }

      await batch.commit();
    }

    return {
      count: promotedCount,
      leftCount: leftCount,
      retainedCount: retainedCount
    };
  } catch (error) {
    console.error('[SchoolData] Error updating academic year:', error);
    throw error;
  }
};

/**
 * Save academic year transition draft
 */
export const saveTransitionDraft = async (draft: TransitionDraft) => {
  try {
    if (!auth.currentUser) throw new Error("Not authenticated");
    const userDocSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
    const userData = userDocSnap.data()!;

    const adminId = userData.parentAdminId || auth.currentUser.uid;
    const schoolId = userData.schoolId;
    const organizationId = userData.organizationId;
    const isIndependent = userData.isIndependent;

    const schoolPath = (isIndependent || !organizationId)
      ? `users/${adminId}/schools/${schoolId}`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

    const draftRef = doc(db, `${schoolPath}/settings`, "academicTransitionDraft");
    await setDoc(draftRef, { ...draft, lastUpdated: serverTimestamp() });

    console.log('[SchoolData] Draft saved successfully');
  } catch (error) {
    console.error('[SchoolData] Error saving draft:', error);
    throw error;
  }
};

/**
 * Load academic year transition draft
 */
export const loadTransitionDraft = async (): Promise<TransitionDraft | null> => {
  try {
    if (!auth.currentUser) return null;
    const userDocSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
    if (!userDocSnap.exists()) return null;

    const userData = userDocSnap.data();
    const adminId = userData.parentAdminId || auth.currentUser.uid;
    const schoolId = userData.schoolId;
    const organizationId = userData.organizationId;
    const isIndependent = userData.isIndependent;

    const schoolPath = (isIndependent || !organizationId)
      ? `users/${adminId}/schools/${schoolId}`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

    const draftSnap = await getDoc(doc(db, `${schoolPath}/settings`, "academicTransitionDraft"));
    if (draftSnap.exists()) {
      return draftSnap.data() as TransitionDraft;
    }
    return null;
  } catch (error) {
    console.error('[SchoolData] Error loading draft:', error);
    return null;
  }
};

/**
 * Delete academic year transition draft
 */
export const deleteTransitionDraft = async () => {
  try {
    if (!auth.currentUser) throw new Error("Not authenticated");
    const userDocSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
    const userData = userDocSnap.data()!;

    const adminId = userData.parentAdminId || auth.currentUser.uid;
    const schoolId = userData.schoolId;
    const organizationId = userData.organizationId;
    const isIndependent = userData.isIndependent;

    const schoolPath = (isIndependent || !organizationId)
      ? `users/${adminId}/schools/${schoolId}`
      : `users/${adminId}/organizations/${organizationId}/schools/${schoolId}`;

    const draftRef = doc(db, `${schoolPath}/settings`, "academicTransitionDraft");
    await deleteDoc(draftRef);

    console.log('[SchoolData] Draft deleted successfully');
  } catch (error) {
    console.error('[SchoolData] Error deleting draft:', error);
    throw error;
  }
};