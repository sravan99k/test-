import { db } from "@/integrations/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

export interface PendingMiniAssessment {
  grade: number;
  phase: number;
  assessmentId: string;
  fromAssessmentId?: string;
  fileKey?: string;
  flags?: Record<string, boolean>;
  status: "scheduled" | "completed" | "expired";
  createdAt?: any;
  dueAt?: number;
  completedAt?: any;
  nextMini?: {
    assessmentId: string;
    fileKey?: string;
    flags?: Record<string, boolean>;
  } | null;
}

const getPendingMiniDocRef = (userId: string, grade: number, phase: number) => {
  const docId = `pendingMini_${grade}_${phase}`;
  return doc(db, "users", userId, "meta", docId);
};

export const getPendingMiniForUser = async (
  userId: string,
  grade: number,
  phase: number
): Promise<PendingMiniAssessment | null> => {
  try {
    const ref = getPendingMiniDocRef(userId, grade, phase);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const data = snap.data() as PendingMiniAssessment;
    if (!data || data.status !== "scheduled") return null;

    return data;
  } catch (e) {
    console.error("[MiniAssessment] Failed to load pending mini", { userId, grade, phase }, e);
    return null;
  }
};

export const getMiniMetaForUser = async (
  userId: string,
  grade: number,
  phase: number
): Promise<PendingMiniAssessment | null> => {
  try {
    const ref = getPendingMiniDocRef(userId, grade, phase);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;

    const data = snap.data() as PendingMiniAssessment;
    if (!data) return null;

    return data;
  } catch (e) {
    console.error("[MiniAssessment] Failed to load mini meta", { userId, grade, phase }, e);
    return null;
  }
};

export const scheduleMiniForUser = async (
  userId: string,
  payload: Omit<PendingMiniAssessment, "status" | "createdAt"> & {
    status?: PendingMiniAssessment["status"];
  }
): Promise<void> => {
  try {
    const { grade, phase } = payload;
    const ref = getPendingMiniDocRef(userId, grade, phase);

    const sanitizeFlags = (
      flags?: Record<string, any>
    ): Record<string, boolean> | undefined => {
      if (!flags) return undefined;
      const cleaned: Record<string, boolean> = {};

      for (const [key, value] of Object.entries(flags)) {
        if (value === undefined) continue; // Skip undefined values entirely
        // Coerce any truthy/falsy value to an explicit boolean
        cleaned[key] = Boolean(value);
      }

      return Object.keys(cleaned).length > 0 ? cleaned : undefined;
    };

    const cleanedFlags = sanitizeFlags((payload as any).flags);
    const cleanedNextMiniFlags = sanitizeFlags(payload.nextMini?.flags as any);

    const data: PendingMiniAssessment = {
      grade: payload.grade,
      phase: payload.phase,
      assessmentId: payload.assessmentId,
      fromAssessmentId: payload.fromAssessmentId,
      fileKey: payload.fileKey,
      status: payload.status ?? "scheduled",
      createdAt: serverTimestamp(),
      ...(payload.dueAt != null ? { dueAt: payload.dueAt } : {}),
      ...(payload.completedAt != null ? { completedAt: payload.completedAt } : {}),
      ...(cleanedFlags ? { flags: cleanedFlags } : {}),
      ...(payload.nextMini
        ? {
            nextMini: {
              assessmentId: payload.nextMini.assessmentId,
              fileKey: payload.nextMini.fileKey,
              ...(cleanedNextMiniFlags ? { flags: cleanedNextMiniFlags } : {}),
            },
          }
        : {}),
    };

    await setDoc(ref, data, { merge: true });
  } catch (e) {
    console.error("[MiniAssessment] Failed to schedule mini assessment", { userId, payload }, e);
  }
};

export const completeMiniForUser = async (
  userId: string,
  grade: number,
  phase: number
): Promise<void> => {
  try {
    const ref = getPendingMiniDocRef(userId, grade, phase);
    await setDoc(
      ref,
      {
        status: "completed",
        completedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error("[MiniAssessment] Failed to mark mini as completed", { userId, grade, phase }, e);
  }
};
