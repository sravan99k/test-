import { db, auth } from "@/integrations/firebase";
import { doc, getDoc, collection, getDocs, query, where, orderBy, limit, setDoc } from "firebase/firestore";
import { loadEnabledAssessments, EnabledAssessmentsState } from "./assessmentManagementService";

interface UserSchoolContext {
  adminId: string;
  schoolId: string;
  organizationId?: string | null;
  isIndependent?: boolean;
}

interface StudentAssessmentProgress {
  assessmentId: string;
  completedSections: string[];
  totalSections: number;
  isCompleted: boolean;
  completedAt?: Date;
  score?: number;
}

export interface AvailableAssessment {
  id: string;
  name: string;
  type: string;
  questions: number;
  sections?: Array<{
    id: string;
    name: string;
    questions: number;
    required: boolean;
  }>;
  phaseName: string;
  phasePeriod: string;
  isAvailable: boolean;
  isCompleted: boolean;
  progress: number;
  blockedBy?: string;
}

const getUserSchoolContext = async (): Promise<UserSchoolContext | null> => {
  if (!auth.currentUser) return null;

  const userRef = doc(db, "users", auth.currentUser.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;

  const data = snap.data();
  const adminId = data.parentAdminId || auth.currentUser.uid;
  const schoolId = data.schoolId;
  const organizationId = data.organizationId || null;
  const isIndependent = data.isIndependent;

  if (!adminId || !schoolId) return null;

  return { adminId, schoolId, organizationId, isIndependent };
};

const getConfigDocPath = async (): Promise<string | null> => {
  const ctx = await getUserSchoolContext();
  if (!ctx) return null;

  const base = ctx.organizationId
    ? `users/${ctx.adminId}/organizations/${ctx.organizationId}/schools/${ctx.schoolId}`
    : `users/${ctx.adminId}/schools/${ctx.schoolId}`;

  return `${base}/config/assessmentEnablement`;
};

const getStudentDocPath = async (): Promise<string | null> => {
  const ctx = await getUserSchoolContext();
  if (!ctx) return null;

  const base = ctx.organizationId
    ? `users/${ctx.adminId}/organizations/${ctx.organizationId}/schools/${ctx.schoolId}`
    : `users/${ctx.adminId}/schools/${ctx.schoolId}`;

  // FIX: Don't assume student ID is the Auth UID. Look it up.
  const studentsPath = `${base}/students`;

  if (!auth.currentUser?.uid) return null;

  try {
    const q = query(collection(db, studentsPath), where("studentUserId", "==", auth.currentUser.uid));
    const snap = await getDocs(q);
    if (!snap.empty) {
      return `${studentsPath}/${snap.docs[0].id}`;
    }
  } catch (e) {
    console.warn("Error resolving student slug in service, falling back to UID", e);
  }

  return `${studentsPath}/${auth.currentUser?.uid}`;
};

const getStudentProgress = async (): Promise<Record<string, StudentAssessmentProgress>> => {
  try {
    const studentPath = await getStudentDocPath();
    if (!studentPath) return {};

    const studentRef = doc(db, studentPath);
    const snap = await getDoc(studentRef);

    if (!snap.exists()) return {};

    const data = snap.data();
    const assessmentProgress = data.assessmentProgress || {};

    return assessmentProgress as Record<string, StudentAssessmentProgress>;
  } catch (e) {
    console.error("[StudentAssessment] Failed to get student progress", e);
    return {};
  }
};

const getAssessmentSequence = (gradeData: any) => {
  return gradeData.phases.flatMap((phase: any) =>
    phase.assessments.map((assessment: any) => ({
      ...assessment,
      phaseName: phase.name,
      phaseColor: phase.color,
      phasePeriod: phase.period
    }))
  );
};

const isAssessmentAvailableForStudent = (
  assessmentId: string,
  enabledAssessments: EnabledAssessmentsState,
  gradeData: any,
  studentProgress: Record<string, StudentAssessmentProgress>
): { isAvailable: boolean; blockedBy?: string } => {
  // Check if assessment is enabled by admin
  if (!enabledAssessments[assessmentId]) {
    return { isAvailable: false, blockedBy: "Not enabled by administrator" };
  }

  const sequence = getAssessmentSequence(gradeData);
  const currentIndex = sequence.findIndex(a => a.id === assessmentId);

  if (currentIndex === -1) return { isAvailable: false };

  // If it's the first assessment, it's available if enabled
  if (currentIndex === 0) return { isAvailable: true };

  // Check if previous assessment in sequence is completed by this student
  const previousAssessment = sequence[currentIndex - 1];
  const previousProgress = studentProgress[previousAssessment.id];

  if (!previousProgress || !previousProgress.isCompleted) {
    return {
      isAvailable: false,
      blockedBy: `Complete "${previousAssessment.name}" first`
    };
  }

  return { isAvailable: true };
};

export const getAvailableAssessmentsForStudent = async (
  grade: number
): Promise<AvailableAssessment[]> => {
  try {
    // Get enabled assessments from admin config
    const enabledAssessments = await loadEnabledAssessments();

    // Get student's progress
    const studentProgress = await getStudentProgress();

    // Get assessment journey data (this would need to be imported or shared)
    // For now, we'll use a simplified structure
    const gradeData = {
      phases: [
        {
          name: "The Transition",
          period: "June - August",
          color: "blue",
          assessments: [
            {
              id: "g6-p1-baseline",
              name: "The Baseline",
              type: "Major",
              questions: 20,
              sections: [
                { id: "baseline-demographics", name: "Student Background", questions: 5, required: true },
                { id: "baseline-academic", name: "Academic Stress", questions: 8, required: true },
                { id: "baseline-social", name: "Social Adjustment", questions: 7, required: true }
              ]
            },
            {
              id: "g6-p1-adjustment",
              name: "Adjustment Check",
              type: "Mini",
              questions: 4,
              sections: [
                { id: "adjustment-routine", name: "Daily Routine", questions: 2, required: true },
                { id: "adjustment-friends", name: "Friend Circle", questions: 2, required: true }
              ]
            }
          ]
        }
      ]
    };

    const sequence = getAssessmentSequence(gradeData);
    const availableAssessments: AvailableAssessment[] = [];

    sequence.forEach(assessment => {
      const availability = isAssessmentAvailableForStudent(
        assessment.id,
        enabledAssessments,
        gradeData,
        studentProgress
      );

      const progress = studentProgress[assessment.id];
      const completedSections = progress?.completedSections?.length || 0;
      const totalSections = assessment.sections?.length || 1;
      const progressPercentage = (completedSections / totalSections) * 100;

      availableAssessments.push({
        id: assessment.id,
        name: assessment.name,
        type: assessment.type,
        questions: assessment.questions,
        sections: assessment.sections,
        phaseName: assessment.phaseName,
        phasePeriod: assessment.phasePeriod,
        isAvailable: availability.isAvailable,
        isCompleted: progress?.isCompleted || false,
        progress: progressPercentage,
        blockedBy: availability.blockedBy
      });
    });

    return availableAssessments;
  } catch (e) {
    console.error("[StudentAssessment] Failed to get available assessments", e);
    return [];
  }
};

export const updateStudentAssessmentProgress = async (
  assessmentId: string,
  sectionId: string,
  isCompleted: boolean = false
): Promise<void> => {
  try {
    const studentPath = await getStudentDocPath();
    if (!studentPath) return;

    const studentRef = doc(db, studentPath);
    const snap = await getDoc(studentRef);

    let currentProgress: Record<string, StudentAssessmentProgress> = {};
    if (snap.exists()) {
      const data = snap.data();
      currentProgress = data.assessmentProgress || {};
    }

    // Initialize or update assessment progress
    if (!currentProgress[assessmentId]) {
      const assessment = getAvailableAssessmentsForStudent(6).then(assessments =>
        assessments.find(a => a.id === assessmentId)
      );

      currentProgress[assessmentId] = {
        assessmentId,
        completedSections: [],
        totalSections: 3, // Default, should be updated based on actual assessment
        isCompleted: false
      };
    }

    // Update section completion
    const assessmentProgress = currentProgress[assessmentId];
    if (isCompleted && !assessmentProgress.completedSections.includes(sectionId)) {
      assessmentProgress.completedSections.push(sectionId);
    }

    // Check if assessment is fully completed
    const assessment = await getAvailableAssessmentsForStudent(6).then(assessments =>
      assessments.find(a => a.id === assessmentId)
    );

    if (assessment && assessment.sections) {
      assessmentProgress.totalSections = assessment.sections.length;
      assessmentProgress.isCompleted = assessmentProgress.completedSections.length === assessment.sections.length;

      if (assessmentProgress.isCompleted) {
        assessmentProgress.completedAt = new Date();
      }
    }

    // Save updated progress
    await setDoc(studentRef, {
      assessmentProgress: currentProgress,
      lastAssessmentDate: new Date()
    }, { merge: true });

  } catch (e) {
    console.error("[StudentAssessment] Failed to update progress", e);
  }
};
