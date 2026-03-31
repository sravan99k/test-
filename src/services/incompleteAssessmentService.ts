import { db } from "@/integrations/firebase";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

export interface IncompleteAssessment {
  userId: string;
  startedAt: number;
  responses: Record<number, any>;
  totalQuestions: number;
  categories: string[];
  currentQuestionIndex?: number;
}

const getDocRef = (userId: string) => {
  // Store under users/{uid}/meta/incompleteAssessment
  return doc(db, "users", userId, "meta", "incompleteAssessment");
};

export const getIncompleteAssessmentForUser = async (
  userId: string
): Promise<IncompleteAssessment | null> => {
  try {
    const ref = getDocRef(userId);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const data = snap.data() as IncompleteAssessment;
    if (!data || typeof data.startedAt !== "number") return null;
    return { ...data, userId };
  } catch (e) {
    console.error("[IncompleteAssessment] Failed to load incomplete assessment", e);
    return null;
  }
};

export const saveIncompleteAssessmentForUser = async (
  userId: string,
  payload: Omit<IncompleteAssessment, "userId">
): Promise<void> => {
  try {
    const ref = getDocRef(userId);
    const data: IncompleteAssessment = { ...payload, userId };
    await setDoc(ref, data, { merge: true });
  } catch (e) {
    console.error("[IncompleteAssessment] Failed to save incomplete assessment", e);
  }
};

export const clearIncompleteAssessmentForUser = async (
  userId: string
): Promise<void> => {
  try {
    const ref = getDocRef(userId);
    await deleteDoc(ref);
  } catch (e) {
    console.error("[IncompleteAssessment] Failed to clear incomplete assessment", e);
  }
};
