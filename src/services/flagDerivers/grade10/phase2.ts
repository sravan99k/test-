/**
 * Grade 10 Phase 2 Flag Deriver
 * 
 * Derives flags for Grade 10, Phase 2 (Mid-Year) Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions, getNumericValueForQuestionAnswer } from '../../flagEngine';
import type { MiniFlagsG10P2 } from '../types';

/**
 * Derives Mini flags for Grade 10 Phase 2 based on Major assessment responses.
 * 
 * Focuses on peak board exam pressures: academic confidence/exam anxiety,
 * time balance from late-night studying, sleep/somatic stress, family pressure,
 * and self-harm concerns.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG10P2 = (questions: any[], responsesArray: any[]): MiniFlagsG10P2 => {
    const flags: MiniFlagsG10P2 = {
        academic_confidence_recheck: false,
        time_balance_recheck: false,
        sleep_recheck: false,
        family_pressure_recheck: false,
        self_harm_followup: false,
        no_flags_baseline: false,
        // New Flags
        burnout_check: false,
        social_withdrawal_check: false,
        health_neglect_check: false,
        exam_stress_recheck: false,
        self_harm_crisis_recheck: false,
        emotional_breakdown_recheck: false,
        exam_anxiety_check: false,
        general_stress_check: false,
        social_check: false,
        somatic_check: false,
        strengths_check: false,
        support_check: false,
        pre_board_panic_check: false,
        motivation_loss_check: false,
        emotional_check: false,
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

        // Academic confidence and exam worry
        if (
            (domain === 'Exam Anxiety' && subdomain === 'Exam Stress' && flagged) ||
            (domain === 'Academic' && subdomain === 'Recall' && flagged)
        ) {
            flags.academic_confidence_recheck = true;
        }

        // Time balance via late-night study
        if (domain === 'Academic' && subdomain === 'Late-Night' && flagged) {
            flags.time_balance_recheck = true;
            flags.sleep_recheck = true;
        }

        // Sleep/physical stress
        if (domain === 'Somatic' && subdomain === 'Somatic Stress' && flagged) {
            flags.sleep_recheck = true;
        }

        // Family pressure/fear of disappointment
        if (domain === 'Family' && subdomain === 'Fear of Disappointment' && flagged) {
            flags.family_pressure_recheck = true;
        }

        // Self-harm follow-up
        if (domain === 'Safety' && subdomain === 'Self-Harm' && flagged) {
            flags.self_harm_followup = true;
        }

        // --- Missing Domains Added ---

        // --- Missing Domains Added ---

        // Social - Comparison/Withdrawal
        if (domain === 'Social' && flagged) {
            flags.academic_confidence_recheck = true;
            flags.social_check = true; // New Flag
            if (subdomain === 'Withdrawal') {
                flags.social_withdrawal_check = true; // Specific Scenario
            }
        }

        // Burnout - Motivation Loss
        if (domain === 'Burnout' && flagged) {
            flags.academic_confidence_recheck = true;
            flags.time_balance_recheck = true;
            flags.burnout_check = true; // New Flag
            if (subdomain === 'Motivation Loss') {
                flags.motivation_loss_check = true; // Specific Scenario
            }
        }

        // Emotional - Overwhelm/Reactivity
        if (domain === 'Emotional' && flagged) {
            flags.time_balance_recheck = true;
            flags.sleep_recheck = true;
            flags.emotional_check = true; // New Flag
            if (subdomain === 'Breakdown Risk') {
                flags.emotional_breakdown_recheck = true; // Specific Scenario
            }
        }

        // Health - Physical symptoms
        if (domain === 'Health' && flagged) {
            flags.sleep_recheck = true;
            if (subdomain === 'Neglect') {
                flags.health_neglect_check = true; // Specific Scenario
            }
        }

        // Somatic
        if (domain === 'Somatic' && flagged) {
            flags.somatic_check = true;
            flags.sleep_recheck = true;
        }

        // Strengths - Self-Concept
        if (domain === 'Strengths' && flagged) {
            flags.academic_confidence_recheck = true;
            flags.strengths_check = true; // New Flag
        }

        // Support - Usage of strategies
        if (domain === 'Support' && flagged) {
            flags.academic_confidence_recheck = true;
            flags.support_check = true; // New Flag
        }

        // Exam Anxiety - Pre-Board Panic
        if (domain === 'Exam Anxiety' && flagged) {
            flags.exam_anxiety_check = true;
            if (subdomain === 'Exam Stress' || subdomain === 'Panic') {
                flags.exam_stress_recheck = true;
                flags.pre_board_panic_check = true; // Mini 2.2 Scenario
            }
        }

        // General Stress
        if (domain === 'General Stress' || (domain === 'Open' && flagged)) {
            flags.general_stress_check = true;
        }

        // Aliases and Cross-Mapping
        if (flags.self_harm_followup) {
            flags.self_harm_crisis_recheck = true; // Alias
        }
    });

    flags.no_flags_baseline = !hasAnyFlags(flags);

    return flags;
};
