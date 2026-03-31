/**
 * Grade 9 Phase 2 Flag Deriver
 * 
 * Derives flags for Grade 9, Phase 2 (Mid-Year) Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions, getNumericValueForQuestionAnswer } from '../../flagEngine';
import type { MiniFlagsG9P2 } from '../types';

/**
 * Derives Mini flags for Grade 9 Phase 2 based on Major assessment responses.
 * 
 * Focuses on mid-year board exam pressures: exam anxiety, late-night studying affecting
 * sleep, mood/self-worth impacts, family pressure/fear of reaction, and self-harm.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG9P2 = (questions: any[], responsesArray: any[]): MiniFlagsG9P2 => {
    const flags: MiniFlagsG9P2 = {
        exam_stress_recheck: false,
        sleep_recheck: false,
        mood_recheck: false,
        family_pressure_recheck: false,
        self_harm_followup: false,
        strengths_check: false,
        social_comparison_check: false,
        somatic_check: false,
        no_flags_baseline: false,
        // New flags
        general_stress_check: false,
        emotional_check: false,
        social_check: false,
        exam_anxiety_check: false,
        // Aliases
        self_harm_crisis: false,
        exam_anxiety_followup: false,
        sleep_study_balance: false,
        self_worth_recovery: false,
        somatic_symptoms_followup: false,
        family_pressure_followup: false,
        panic_overwhelm_recovery: false,
        post_exam_recovery: false,
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

        // Exam Stress (Result Anxiety)
        if (domain === 'Academic' && subdomain === 'Result Anxiety' && flagged) {
            flags.exam_stress_recheck = true;
            flags.exam_anxiety_check = true; // Alias
            flags.exam_anxiety_followup = true; // Alias for Mini 2.1
            flags.post_exam_recovery = true; // Specific post-exam recovery scenario
        }

        // Sleep
        if (domain === 'Sleep' && flagged) {
            flags.sleep_recheck = true;
            flags.sleep_study_balance = true; // Alias for Mini 2.1
        }

        // Mood & Emotional
        if ((domain === 'Mood' || domain === 'Emotional') && flagged) {
            flags.mood_recheck = true;
            flags.emotional_check = true; // Alias

            if (subdomain === 'Panic/Overwhelm') {
                flags.panic_overwhelm_recovery = true; // Specific scenario
            }
        }

        // Family Pressure
        if (domain === 'Family' && flagged) {
            flags.family_pressure_recheck = true;
            flags.family_pressure_followup = true; // Alias for Mini 2.1
        }

        // Self Harm
        if (domain === 'Safety' && subdomain === 'Self-Harm' && flagged) {
            flags.self_harm_followup = true;
            flags.self_harm_crisis = true; // Alias for Mini 2.1
        }

        // Strengths & Self-Worth
        if ((domain === 'Strengths' || domain === 'Self') && flagged) {
            flags.strengths_check = true;
            flags.self_worth_recovery = true; // Alias for Mini 2.1
        }

        // Social
        if (domain === 'Social' && flagged) {
            flags.social_check = true;
            if (subdomain === 'Comparison') {
                flags.social_comparison_check = true;
            }
        }

        // Somatic
        if (domain === 'Somatic' && flagged) {
            flags.somatic_check = true;
            flags.somatic_symptoms_followup = true; // Alias for Mini 2.1
            flags.general_stress_check = true; // Somatic implies general stress
        }

        // General Stress from Lifestyle/Health
        if ((domain === 'Lifestyle' || domain === 'Health') && flagged) {
            flags.general_stress_check = true;
            flags.sleep_recheck = true; // Often impacts sleep
            flags.sleep_study_balance = true; // Alias
        }

        // Career - can add to general stress
        if (domain === 'Career' && flagged) {
            flags.general_stress_check = true;
        }

        // Support - lack of support is a risk
        if (domain === 'Support' && flagged) {
            // Often related to emotional check
            flags.emotional_check = true;
        }
        // Resilience - Analysis of mistakes
        if (domain === 'Resilience' && flagged) {
            flags.mood_recheck = true; // Poor resilience indicates mood/coping issues
        }
    });

    flags.no_flags_baseline = !hasAnyFlags(flags);

    return flags;
};
