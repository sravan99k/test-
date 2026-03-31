/**
 * Grade 9 Phase 1 Flag Deriver
 * 
 * Derives flags for Grade 9, Phase 1 Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions, getNumericValueForQuestionAnswer } from '../../flagEngine';
import type { MiniFlagsG9P1 } from '../types';

/**
 * Derives Mini flags for Grade 9 Phase 1 based on Major assessment responses.
 * 
 * Focuses on Grade 9 transition challenges: academic shock from increased workload,
 * career/stream anxiety, sleep disruption, and mood concerns.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG9P1 = (questions: any[], responsesArray: any[]): MiniFlagsG9P1 => {
    const flags: MiniFlagsG9P1 = {
        academic_shock_recheck: false,
        career_anxiety_recheck: false,
        sleep_recheck: false,
        mood_recheck: false,
        no_flags_baseline: false,
        strengths_check: false,
        academic_confidence_recheck: false,
        social_check: false,
        digital_wellbeing_check: false,
        family_pressure_recheck: false,
        support_check: false,
        // New flags
        burnout_check: false,
        general_stress_check: false,
        family_check: false,
        sleep_check: false,
        mood_check: false,
        study_habit_check: false,
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

        // Academic shock and low confidence
        if (
            (domain === 'Academic' && subdomain === 'Academic Shock' && flagged) ||
            (domain === 'Academic' && subdomain === 'Academic Confidence' && (flagged || (numeric != null && numeric >= 4)))
        ) {
            flags.academic_shock_recheck = true;
            flags.study_habit_check = true; // Academic shock often related to study habits
        }

        // Career / stream anxiety
        if (domain === 'Career' && subdomain === 'Stream Anxiety' && flagged) {
            flags.career_anxiety_recheck = true;
        }

        // Sleep reduction
        if (domain === 'Sleep' && subdomain === 'Sleep Quality' && flagged) {
            flags.sleep_recheck = true;
            flags.sleep_check = true; // Alias for Mini 1.2
        }

        if (domain === 'Mood' && subdomain === 'Depression Screening' && flagged) {
            flags.mood_recheck = true;
            flags.mood_check = true; // Alias for Mini 1.2
        }

        // Strengths
        if (domain === 'Strengths' && flagged) {
            flags.strengths_check = true;
        }

        // Academic Confidence (Specific check distinct from shock)
        if (domain === 'Academic' && subdomain === 'Academic Confidence' && (flagged || (numeric != null && numeric >= 4))) {
            flags.academic_confidence_recheck = true;
        }

        // Social Sacrifice
        if (domain === 'Social' && subdomain === 'Social Sacrifice' && flagged) {
            flags.social_check = true;
        }

        // Digital Wellbeing
        if (domain === 'Digital Well-being' && flagged) {
            flags.digital_wellbeing_check = true;
        }

        // Family Pressure
        if (domain === 'Family' && flagged) {
            flags.family_pressure_recheck = true;
            flags.family_check = true; // Alias for Mini 1.2
        }

        // Teacher Support
        if (domain === 'Support' && flagged) {
            flags.support_check = true;
        }

        // CRITICAL: Safety domain (Self-Harm, Trauma, Online Safety)
        // These are AUTO RED FLAG situations that need immediate intervention
        if (domain === 'Safety' && flagged) {
            // Safety concerns trigger mood recheck for counselor follow-up
            flags.mood_recheck = true;
            // Self-harm specifically
            if (subdomain === 'Self-Harm') {
                flags.mood_recheck = true; // Mental health concern
            }
        }

        // --- Missing Domains Added ---

        // Burnout - High workload stress
        if (domain === 'Burnout' && flagged) {
            flags.academic_shock_recheck = true; // Burnout affects academic performance
            flags.sleep_recheck = true; // Burnout often impacts sleep
            flags.burnout_check = true; // Direct scenario trigger
        }

        // Lifestyle - Work-life balance issues
        if (domain === 'Lifestyle' && flagged) {
            flags.sleep_recheck = true; // Lifestyle imbalance impacts sleep
            flags.general_stress_check = true; // Lifestyle stress contributes to general stress
        }

        // Resilience - Poor coping mechanisms
        if (domain === 'Resilience' && flagged) {
            flags.mood_recheck = true; // Low resilience affects mental health
        }

        // Self - Body image, self-worth issues
        if (domain === 'Self' && flagged) {
            flags.strengths_check = true; // Self-issues affect self-concept
            flags.mood_recheck = true; // Self-esteem impacts mood
        }

        // Somatic - Physical symptoms of stress
        if (domain === 'Somatic' && flagged) {
            flags.mood_recheck = true; // Somatic symptoms often indicate stress/anxiety
            flags.general_stress_check = true; // Somatic symptoms are a key stress indicator
        }

        // Substance - Risk behavior
        if (domain === 'Substance' && flagged) {
            flags.mood_recheck = true; // Substance use often correlates with mental health
        }
    });

    flags.no_flags_baseline = !hasAnyFlags(flags);

    return flags;
};
