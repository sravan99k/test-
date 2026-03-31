import { db } from '../integrations/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, serverTimestamp, setDoc } from 'firebase/firestore';

/**
 * Save assessment results for a student
 * @param {Object} params - Assessment parameters
 * @param {string} params.studentId - Student's user ID
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.schoolId - School ID
 * @param {string} params.organizationId - Organization ID (optional, null for independent schools)
 * @param {number} params.riskPercentage - Overall risk percentage (0-100)
 * @param {string} params.riskCategory - Risk category: "High Risk", "Moderate Risk", or "Low Risk"
 * @param {Object} params.riskDistribution - Breakdown of risk answers
 * @param {number} params.riskDistribution.highRisk - Count of high-risk answers
 * @param {number} params.riskDistribution.moderateRisk - Count of moderate-risk answers
 * @param {number} params.riskDistribution.lowRisk - Count of low-risk answers
 * @param {Array} params.responses - Optional: Individual question responses
 * @param {string} params.assessmentId - Optional: The unique ID of the assessment (e.g., "g6-p1-major")
 */
export async function saveAssessment({
  studentId,
  adminId,
  schoolId,
  organizationId,
  riskPercentage,
  riskCategory,
  riskDistribution,
  responses = [],
  assessmentId
}) {
  console.log('[saveAssessment] Saving assessment for student:', studentId);

  try {
    // Determine the correct path based on school type
    let assessmentsPath;

    if (organizationId) {
      // Organization school
      assessmentsPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}/assessments`;
    } else {
      // Independent school
      assessmentsPath = `users/${adminId}/schools/${schoolId}/students/${studentId}/assessments`;
    }

    console.log('[saveAssessment] Saving to path:', assessmentsPath);

    // Create assessment document
    const assessmentData = {
      riskPercentage: Number(riskPercentage),
      riskCategory,
      riskDistribution: {
        highRisk: Number(riskDistribution.highRisk || 0),
        moderateRisk: Number(riskDistribution.moderateRisk || 0),
        lowRisk: Number(riskDistribution.lowRisk || 0)
      },
      assessmentDate: serverTimestamp(),
      createdAt: serverTimestamp()
    };

    // Optionally include responses if provided
    if (responses && responses.length > 0) {
      assessmentData.responses = responses;
      assessmentData.totalQuestions = responses.length;
    }

    if (assessmentId) {
      assessmentData.assessmentId = assessmentId;
    }



    let assessmentRef;
    if (assessmentId) {
      // Use deterministic ID (slug)
      assessmentRef = doc(db, assessmentsPath, assessmentId);
      await setDoc(assessmentRef, assessmentData, { merge: true });
    } else {
      // Fallback to random ID if no slug provided (legacy behavior)
      console.warn('[saveAssessment] No assessmentId provided, falling back to random ID');
      assessmentRef = await addDoc(collection(db, assessmentsPath), assessmentData);
    }

    // Denormalization: Upsert student document with latest assessment summary for performance
    const studentDocPath = organizationId
      ? `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}`
      : `users/${adminId}/schools/${schoolId}/students/${studentId}`;

    await setDoc(
      doc(db, studentDocPath),
      {
        latestAssessment: {
          riskPercentage: Number(riskPercentage),
          riskCategory,
          assessmentDate: serverTimestamp(),
          wellbeingScore: Math.round(100 - Number(riskPercentage))
        },
        lastAssessmentDate: serverTimestamp(),
        riskLevel: riskPercentage >= 70 ? 'high' : riskPercentage >= 40 ? 'medium' : 'low'
      },
      { merge: true }
    );

    console.log('[saveAssessment] Assessment saved and student doc updated successfully');
    return { success: true, assessmentId: assessmentRef.id };

  } catch (error) {
    console.error('[saveAssessment] Error saving assessment:', error);
    throw error;
  }
}

/**
 * Get all assessments for a student
 * @param {Object} params - Query parameters
 * @param {string} params.studentId - Student's user ID
 * @param {string} params.adminId - Admin user ID
 * @param {string} params.schoolId - School ID
 * @param {string} params.organizationId - Organization ID (optional)
 */
export async function getStudentAssessments({
  studentId,
  adminId,
  schoolId,
  organizationId
}) {
  console.log('[getStudentAssessments] Fetching assessments for student:', studentId);

  try {
    // Determine the correct path
    let assessmentsPath;

    if (organizationId) {
      assessmentsPath = `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students/${studentId}/assessments`;
    } else {
      assessmentsPath = `users/${adminId}/schools/${schoolId}/students/${studentId}/assessments`;
    }

    console.log('[getStudentAssessments] Fetching from path:', assessmentsPath);

    // Query assessments ordered by date (newest first)
    const assessmentsQuery = query(
      collection(db, assessmentsPath),
      orderBy('assessmentDate', 'desc')
    );

    const snapshot = await getDocs(assessmentsQuery);

    const assessments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      assessmentDate: doc.data().assessmentDate?.toDate()
    }));

    console.log('[getStudentAssessments] Found assessments:', assessments.length);
    return assessments;

  } catch (error) {
    console.error('[getStudentAssessments] Error fetching assessments:', error);
    throw error;
  }
}

/**
 * Get the latest assessment for a student
 * @param {Object} params - Query parameters
 */
export async function getLatestAssessment({
  studentId,
  adminId,
  schoolId,
  organizationId
}) {
  console.log('[getLatestAssessment] Fetching latest assessment for student:', studentId);

  try {
    const assessments = await getStudentAssessments({
      studentId,
      adminId,
      schoolId,
      organizationId
    });

    return assessments.length > 0 ? assessments[0] : null;

  } catch (error) {
    console.error('[getLatestAssessment] Error fetching latest assessment:', error);
    throw error;
  }
}

/**
 * Calculate risk category based on percentage
 * @param {number} riskPercentage - Risk percentage (0-100)
 * @returns {string} Risk category
 */
export function calculateRiskCategory(riskPercentage) {
  if (riskPercentage >= 70) {
    return 'High Risk';
  } else if (riskPercentage >= 40) {
    return 'Moderate Risk';
  } else {
    return 'Low Risk';
  }
}

/**
 * Calculate risk distribution from responses
 * @param {Array} responses - Array of question responses with riskLevel
 * @returns {Object} Risk distribution counts
 */
export function calculateRiskDistribution(responses) {
  const distribution = {
    highRisk: 0,
    moderateRisk: 0,
    lowRisk: 0
  };

  responses.forEach(response => {
    const riskLevel = response.riskLevel?.toLowerCase() || '';

    if (riskLevel.includes('high')) {
      distribution.highRisk++;
    } else if (riskLevel.includes('moderate')) {
      distribution.moderateRisk++;
    } else if (riskLevel.includes('low')) {
      distribution.lowRisk++;
    }
  });

  return distribution;
}

/**
 * Calculate overall risk percentage from responses
 * @param {Array} responses - Array of question responses with score field
 * @returns {number} Risk percentage (0-100)
 */
export function calculateRiskPercentage(responses) {
  if (!responses || responses.length === 0) return 0;

  // Calculate based on actual scores (0-4 scale)
  // This matches the calculation in AssessmentResults.tsx
  let totalScore = 0;
  let count = 0;

  responses.forEach(response => {
    if (response.score !== undefined && response.score !== null) {
      totalScore += response.score;
      count++;
    }
  });

  if (count === 0) return 0;

  // Formula: (actualScore / maxPossibleScore) * 100
  // Max possible score = count * 4 (since max score per question is 4)
  const percentage = (totalScore / (count * 4)) * 100;

  return Math.round(percentage * 100) / 100; // Round to 2 decimal places
}
