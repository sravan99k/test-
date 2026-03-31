/**
 * Grade 7 Phase 2 Flag Deriver
 * 
 * Derives flags for Grade 7, Phase 2 (Mid-Year) Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions } from '../../flagEngine';
import type { MiniFlagsG7P2 } from '../types';

/**
 * Derives Mini flags for Grade 7 Phase 2 based on Major assessment responses.
 * 
 * Focuses on mid-year pressures: exam stress, sleep quality, family pressure,
 * emotional overwhelm, self-harm concerns, bullying, and academic support needs.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG7P2 = (questions: any[], responsesArray: any[]): MiniFlagsG7P2 => {
    const flags: MiniFlagsG7P2 = {
        exam_stress_recheck: false,
        sleep_check: false,
        family_pressure_recheck: false,
        self_harm_followup: false,
        bullying_recheck: false,
        emotional_overwhelm_recheck: false,
        academic_support_check: false,
        general_stress_check: false,
        social_check: false,
        strengths_check: false,
        no_flags_mid_year: false,
        // Alias flags for Mini 2.1 / 2.2 scenario IDs
        exam_stress_check: false,
        exam_stress_persistent: false,
        self_harm_monitoring: false,
        bullying_persistent: false,
        bullying_followup: false,
        emotional_overwhelm_persistent: false,
        family_pressure_persistent: false,
        family_pressure_check: false,
    };

    const responseMap = createResponseMap(responsesArray);

    // 1. Domain Checks (General coverage following G8 pattern)
    questions.forEach((q: any) => {
        const answer = getAnswerFromMap(q, questions, responseMap);
        if (answer == null) return;

        const domain = q.domain as string | undefined;
        const subdomain = q.subdomain as string | undefined;
        const flagged = isQuestionFlaggedByConditions(q, answer);





        // Exam Stress
        if (domain === 'Exam Stress' && flagged) {
            flags.exam_stress_recheck = true;
            flags.exam_stress_check = true;
            flags.exam_stress_persistent = true;
        }

        // Sleep
        if (domain === 'Sleep' && flagged) {
            flags.sleep_check = true;
        }

        // Family
        if (domain === 'Family' && flagged) {
            flags.family_pressure_recheck = true;
            flags.family_pressure_check = true;
            flags.family_pressure_persistent = true;
        }

        // Emotional with Overwhelm subdomain
        if (
            domain === 'Emotional' &&
            subdomain === 'Overwhelm' &&
            flagged
        ) {
            flags.emotional_overwhelm_recheck = true;
            flags.emotional_overwhelm_persistent = true;
        }

        // Safety with Self-Harm subdomain
        if (
            domain === 'Safety' &&
            subdomain === 'Self-Harm' &&
            flagged
        ) {
            flags.self_harm_followup = true;
            flags.self_harm_monitoring = true;
        }

        // Bullying
        if (domain === 'Bullying' && flagged) {
            flags.bullying_recheck = true;
            flags.bullying_persistent = true;
            flags.bullying_followup = true;
        }

        // Academic Support
        if (domain === 'Academic Support' && flagged) {
            flags.academic_support_check = true;
        }

        // Social
        if (domain === 'Social' && flagged) {
            flags.social_check = true;
        }

        // Support (with Support Needs subdomain per JSON)
        if (domain === 'Support' && flagged) {
            flags.academic_support_check = true; // Map Support to academic_support_check
        }

        // --- Missing Domains Added ---

        // Strengths
        if (domain === 'Strengths' && flagged) {
            flags.strengths_check = true;
        }

        // Academic (General)
        if (domain === 'Academic' && flagged) {
            flags.exam_stress_recheck = true; // General academic issues contribute to exam stress

            if (subdomain === 'Parental Pressure') {
                flags.family_pressure_recheck = true;
                flags.family_pressure_check = true;
            }
        }

        // Self / Resilience / Future / Somatic / Tech / Lifestyle / Physical Health
        // Map these to general_stress_check if flagged
        if (
            (domain === 'Self' ||
                domain === 'Resilience' ||
                domain === 'Future' ||
                domain === 'Somatic' ||
                domain === 'Tech' ||
                domain === 'Lifestyle' ||
                domain === 'Physical Health') &&
            flagged
        ) {
            flags.general_stress_check = true;
            // Note: Physical Health (Eating) currently maps to General Stress. 
            // In future, consider Specific Health Follow-up if Mini supports it.
            if (domain === 'Somatic' || domain === 'Physical Health') {
                // ideally somatic_check if available, but general_stress_check is safe fallback
            }
        }
    });



    const anyFlag =
        flags.exam_stress_recheck ||
        flags.sleep_check ||
        flags.family_pressure_recheck ||
        flags.self_harm_followup ||
        flags.bullying_recheck ||
        flags.emotional_overwhelm_recheck ||
        flags.academic_support_check ||
        flags.general_stress_check ||
        flags.social_check ||
        flags.strengths_check;

    if (!anyFlag) {
        flags.no_flags_mid_year = true;
    }

    return flags;
};
