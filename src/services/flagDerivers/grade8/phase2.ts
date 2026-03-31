/**
 * Grade 8 Phase 2 Flag Deriver
 * 
 * Derives flags for Grade 8, Phase 2 (Mid-Year) Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions, getNumericValueForQuestionAnswer } from '../../flagEngine';
import type { MiniFlagsG8P2 } from '../types';

/**
 * Derives Mini flags for Grade 8 Phase 2 based on Major assessment responses.
 * 
 * Focuses on mid-year pressures: exam stress, sleep  quality, family pressure/expectations,
 * and self-harm concerns.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG8P2 = (questions: any[], responsesArray: any[]): MiniFlagsG8P2 => {
    const flags: MiniFlagsG8P2 = {
        exam_stress_recheck: false,
        sleep_recheck: false,
        family_pressure_recheck: false,
        self_harm_followup: false,
        no_flags_baseline: false,
        // New flags
        career_clarity_check: false,
        strengths_check: false,
        social_check: false,
        general_stress_check: false,
        academic_check: false,
    };

    const responseMap = createResponseMap(responsesArray);

    questions.forEach((q: any) => {
        const answer = getAnswerFromMap(q, questions, responseMap);
        if (answer == null) {
            return;
        }

        const domain = q.domain as string | undefined;
        const subdomain = q.subdomain as string | undefined;

        const flaggedByConditions = isQuestionFlaggedByConditions(q, answer);
        const numeric = getNumericValueForQuestionAnswer(q, answer);

        // Default flagging for critical domains where flagConditions might be missing in JSON
        // Using >= 3 as a general threshold for "Moderate/Somewhat/neutral" or worse
        const flagged = flaggedByConditions || (numeric != null && numeric >= 3);

        // Map domains to simple check flags
        if (domain === 'Strengths' && flagged) flags.strengths_check = true;
        if (domain === 'Social' && flagged) flags.social_check = true;
        if (domain === 'Academic' && flagged) flags.academic_check = true;

        // Fix: Career Anxiety is a subdomain of Academic in Major JSON
        if ((domain === 'Career' || (domain === 'Academic' && subdomain === 'Career Anxiety')) && flagged) {
            flags.career_clarity_check = true;
        }

        // Fix: Map Emotional (Overwhelm/Hopelessness) to General Stress Check
        if ((domain === 'Exam Stress' || domain === 'Emotional') && flagged) {
            flags.general_stress_check = true;
        }

        if (
            (domain === 'Exam Stress' && flagged) ||
            (domain === 'Academic' &&
                subdomain === 'Recall Confidence' &&
                (flagged || (numeric != null && numeric <= 2)))
        ) {
            flags.exam_stress_recheck = true;
        }

        if (domain === 'Sleep' && flagged) {
            flags.sleep_recheck = true;
        }

        if (
            domain === 'Family' &&
            (subdomain === 'Pressure/Comparison' || subdomain === 'Expectation Stress') &&
            (flagged || (numeric != null && numeric >= 3))
        ) {
            flags.family_pressure_recheck = true;
        }

        if (
            domain === 'Safety' &&
            subdomain === 'Self-Harm' &&
            flagged
        ) {
            flags.self_harm_followup = true;
        }
        // --- Missing Domains Added ---

        // Strengths - Low self-concept contributes to stress vulnerability
        if (domain === 'Strengths' && flagged) {
            flags.exam_stress_recheck = true;
        }

        // Tech - distraction impacting study/stress
        if ((domain === 'Tech' || domain === 'Tech/Lifestyle') && flagged) {
            flags.exam_stress_recheck = true;
        }
    });

    flags.no_flags_baseline = !Boolean(
        flags.exam_stress_recheck ||
        flags.sleep_recheck ||
        flags.family_pressure_recheck ||
        flags.self_harm_followup
    );

    // If baseline, ensure general checks are on
    if (flags.no_flags_baseline) {
        flags.career_clarity_check = true;
        flags.strengths_check = true;
        flags.general_stress_check = true;
    }

    return flags;
};
