import { db, auth } from "@/integrations/firebase";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";

export type EnabledAssessmentsState = Record<string, boolean>;

interface UserSchoolContext {
  adminId: string;
  schoolId: string;
  organizationId?: string | null;
  isIndependent?: boolean;
}

const getUserSchoolContext = async (): Promise<UserSchoolContext | null> => {
  if (!auth.currentUser) return null;

  const userRef = doc(db, "users", auth.currentUser.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return null;

  const data: any = snap.data();

  const adminId: string | undefined = data.parentAdminId || auth.currentUser.uid;
  const schoolId: string | undefined = data.schoolId;
  let organizationId: string | null | undefined = data.organizationId || null;
  const isIndependent: boolean | undefined = data.isIndependent;

  // For student users, it's possible that the student record doesn't carry the
  // organizationId even though the parent admin does. In that case, we look up
  // the admin user and reuse their organizationId so that both management and
  // students resolve the same assessmentEnablement config path.
  const role: string | undefined = data.role;
  if (
    role === "student" &&
    !organizationId &&
    adminId &&
    adminId !== auth.currentUser.uid
  ) {
    try {
      const adminRef = doc(db, "users", adminId);
      const adminSnap = await getDoc(adminRef);
      if (adminSnap.exists()) {
        const adminData: any = adminSnap.data();
        if (adminData && adminData.organizationId) {
          organizationId = adminData.organizationId;
        }
      }
    } catch (e: any) {
      console.warn("[AssessmentManagement] Failed to load admin context for student", e?.message || e);
    }
  }

  if (!adminId || !schoolId) return null;

  return { adminId, schoolId, organizationId: organizationId || null, isIndependent };
};

const getConfigDocPath = async (): Promise<string | null> => {
  const ctx = await getUserSchoolContext();
  if (!ctx) return null;

  const base = ctx.organizationId
    ? `users/${ctx.adminId}/organizations/${ctx.organizationId}/schools/${ctx.schoolId}`
    : `users/${ctx.adminId}/schools/${ctx.schoolId}`;

  return `${base}/config/assessmentEnablement`;
};

export const loadEnabledAssessments = async (): Promise<EnabledAssessmentsState> => {
  try {
    const path = await getConfigDocPath();
    console.log('[AssessmentManagement] Loading enabled assessments from path:', path);

    if (!path) {
      console.warn('[AssessmentManagement] No config path available (no school context)');
      return {};
    }

    const ref = doc(db, path);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      console.warn('[AssessmentManagement] Config document does not exist at path:', path);
      console.log('[AssessmentManagement] Creating default config document with empty assessments');
      
      try {
        await setDoc(ref, { enabledAssessments: {} }, { merge: true });
        console.log('[AssessmentManagement] Default config document created successfully');
      } catch (createError: any) {
        console.error('[AssessmentManagement] Failed to create default config document:', createError?.message || createError);
      }
      
      return {};
    }

    const data = snap.data();
    const enabledAssessments = (data.enabledAssessments || {}) as EnabledAssessmentsState;
    console.log('[AssessmentManagement] Loaded enabledAssessments:', enabledAssessments);

    return enabledAssessments;
  } catch (e) {
    console.error("[AssessmentManagement] Failed to load enabled assessments", e);
    return {};
  }
};

export const saveEnabledAssessments = async (state: EnabledAssessmentsState): Promise<void> => {
  try {
    const path = await getConfigDocPath();
    if (!path) return;

    const ref = doc(db, path);
    await setDoc(ref, { enabledAssessments: state }, { merge: true });
  } catch (e) {
    console.error("[AssessmentManagement] Failed to save enabled assessments", e);
  }
};

export interface GradeAssessmentStats {
  totalStudents: number;
  completedStudents: number;
  avgScore: number; // 0-100 wellbeing score
  distribution: {
    excellent: number; // 90+
    good: number; // 70-89
    average: number; // 50-69
    below50: number; // <50
  };
  recentSubmissions: {
    studentId: string;
    name: string;
    date: Date;
    score: number; // wellbeing 0-100
  }[];
}

const normalizeGradeDigits = (value: unknown): string => {
  if (value == null) return "";
  const match = String(value).match(/\d+/);
  return match ? match[0] : "";
};

export const getGradeAssessmentStats = async (
  grade: number | string
): Promise<GradeAssessmentStats | null> => {
  try {
    const ctx = await getUserSchoolContext();
    if (!ctx) return null;

    const base = ctx.organizationId
      ? `users/${ctx.adminId}/organizations/${ctx.organizationId}/schools/${ctx.schoolId}`
      : `users/${ctx.adminId}/schools/${ctx.schoolId}`;

    const studentsRef = collection(db, `${base}/students`);
    const snap = await getDocs(studentsRef);

    const targetGrade = normalizeGradeDigits(grade);

    let totalStudents = 0;
    const completed: { studentId: string; name: string; date: Date; score: number }[] = [];

    snap.forEach((docSnap) => {
      const data: any = docSnap.data();

      const studentGradeDigits = normalizeGradeDigits(data.grade || data.class);
      if (!studentGradeDigits || studentGradeDigits !== targetGrade) return;

      totalStudents++;

      const latest = (data.latestAssessment as any) || null;
      if (!latest) return;

      const rawRisk = typeof latest.riskPercentage === "number" ? latest.riskPercentage : 0;
      const wellbeingScore = typeof latest.wellbeingScore === "number"
        ? latest.wellbeingScore
        : Math.round(100 - Number(rawRisk || 0));

      let date = new Date();
      const rawDate = latest.assessmentDate || data.lastAssessmentDate;
      if (rawDate?.toDate) {
        date = rawDate.toDate();
      } else if (rawDate instanceof Date) {
        date = rawDate;
      } else if (typeof rawDate === "number") {
        date = new Date(rawDate);
      }

      const name =
        data.name || `${data.firstName || ""} ${data.lastName || ""}`.trim() || "Unknown";

      completed.push({
        studentId: docSnap.id,
        name,
        date,
        score: wellbeingScore,
      });
    });

    if (totalStudents === 0) {
      return {
        totalStudents: 0,
        completedStudents: 0,
        avgScore: 0,
        distribution: { excellent: 0, good: 0, average: 0, below50: 0 },
        recentSubmissions: [],
      };
    }

    const completedStudents = completed.length;

    let avgScore = 0;
    if (completedStudents > 0) {
      const totalScore = completed.reduce((sum, c) => sum + (c.score || 0), 0);
      avgScore = Math.round(totalScore / completedStudents);
    }

    const distribution = { excellent: 0, good: 0, average: 0, below50: 0 };
    completed.forEach((c) => {
      if (c.score >= 90) distribution.excellent++;
      else if (c.score >= 70) distribution.good++;
      else if (c.score >= 50) distribution.average++;
      else distribution.below50++;
    });

    const recentSubmissions = completed
      .slice()
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 10);

    return {
      totalStudents,
      completedStudents,
      avgScore,
      distribution,
      recentSubmissions,
    };
  } catch (e) {
    console.error("[AssessmentManagement] Failed to compute grade stats", e);
    return null;
  }
};
