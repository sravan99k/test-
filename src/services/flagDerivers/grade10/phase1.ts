/**
 * Grade 10 Phase 1 Flag Deriver
 * 
 * Derives flags for Grade 10, Phase 1 Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions, getNumericValueForQuestionAnswer } from '../../flagEngine';
import type { MiniFlagsG10P1 } from '../types';

/**
 * Derives Mini flags for Grade 10 Phase 1 based on Major assessment responses.
 * 
 * Focuses on board exam shock, career anxiety about post-Grade 10 paths,
 * time management/executive function, sleep quality, and mood concerns.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG10P1 = (questions: any[], responsesArray: any[]): MiniFlagsG10P1 => {
    const flags: MiniFlagsG10P1 = {
        board_shock_recheck: false,
        career_worry_recheck: false,
        time_balance_recheck: false,
        sleep_recheck: false,
        mood_recheck: false,
        no_flags_baseline: false,
        strengths_check: false,
        academic_confidence_recheck: false,
        family_pressure_recheck: false,
        support_check: false,
        social_isolation_check: false,
        health_neglect_check: false,
        mid_term_anxiety_check: false,
        // New Aliases
        mood_check: false,
        general_stress_check: false,
        family_check: false,
        family_support_check: false,
        digital_wellbeing_check: false,
        sleep_check: false,
        time_management_recheck: false,
        time_management_followup: false,
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

        // Board academic shock
        if (domain === 'Academic' && subdomain === 'Board Shock' && flagged) {
            flags.board_shock_recheck = true;
        }

        // Career worry after Grade 10
        if (domain === 'Career' && subdomain === 'After Grade 10 Anxiety' && flagged) {
            flags.career_worry_recheck = true;
        }

        // Time balance / executive function
        if (
            domain === 'Time Management' &&
            subdomain === 'Executive Function' &&
            (flagged || (numeric != null && numeric >= 3))
        ) {
            flags.time_balance_recheck = true;
        }

        // Sleep quality and digital late-night use
        if (
            (domain === 'Sleep' && subdomain === 'Sleep Quality' && flagged) ||
            (domain === 'Digital Well-being' && subdomain === 'Escape Behavior' && flagged)
        ) {
            flags.sleep_recheck = true;
        }

        // Mood / depression screening
        if (domain === 'Mood' && subdomain === 'Depression Screening' && flagged) {
            flags.mood_recheck = true;
        }

        // Strengths
        if (domain === 'Strengths' && flagged) {
            flags.strengths_check = true;
        }

        // Academic Confidence
        if (domain === 'Academic' && subdomain === 'Confidence' && (flagged || (numeric != null && numeric >= 4))) {
            flags.academic_confidence_recheck = true;
        }

        // Family Pressure
        if (domain === 'Family' && flagged) {
            flags.family_pressure_recheck = true;
        }

        // Teacher Support
        if (domain === 'Support' && flagged) {
            flags.support_check = true;
        }

        // Social Isolation
        if (domain === 'Social' && subdomain === 'Isolation' && flagged) {
            flags.social_isolation_check = true;
        }

        // Health Neglect
        if (domain === 'Health' && subdomain === 'Neglect' && flagged) {
            flags.health_neglect_check = true;
        }

        // Mid-term anxiety (Academic subdomain)
        if (domain === 'Academic' && (subdomain === 'Fear of Failure' || subdomain === 'Board Shock') && flagged) {
            flags.mid_term_anxiety_check = true;
        }

        // --- Missing Domains Added ---

        // Cognitive - Focus/Concentration issues
        if (domain === 'Cognitive' && flagged) {
            flags.time_balance_recheck = true; // Difficulty focusing relates to executive function/time management
            flags.time_management_recheck = true; // Alias
            flags.time_management_followup = true; // Alias
        }

        // Lifestyle - Hobbies/Balance
        if (domain === 'Lifestyle' && flagged) {
            flags.time_balance_recheck = true; // Lack of balance
            flags.mood_recheck = true; // Loss of interest (anhedonia)
            flags.mood_check = true; // Alias
            flags.general_stress_check = true; // Imbalance causes stress
        }

        // Self-Worth - Academic Validation
        if (domain === 'Self-Worth' && flagged) {
            flags.mood_recheck = true; // Self-worth issues
            flags.mood_check = true; // Alias
            flags.academic_confidence_recheck = true; // Linked to academic performance
        }

        // Substance - Energy drinks/Reliance
        if (domain === 'Substance' && flagged) {
            flags.health_neglect_check = true; // Health risk
            flags.sleep_recheck = true; // Impact on sleep
            flags.sleep_check = true; // Alias
        }

        // General Stress (Open or any other indicator)
        if (domain === 'Open' && flagged) {
            flags.general_stress_check = true;
        }

        // Digital Well-being
        if (domain === 'Digital Well-being' && flagged) {
            flags.digital_wellbeing_check = true;
            flags.sleep_recheck = true; // Often affects sleep
        }

        // Family Aliases
        if (flags.family_pressure_recheck) {
            flags.family_check = true;
            flags.family_support_check = true; // If pressure exists, we need to check support
        }

        // Time Management Aliases
        if (flags.time_balance_recheck) {
            flags.time_management_recheck = true;
            flags.time_management_followup = true;
        }

        // Sleep Alias
        if (flags.sleep_recheck) {
            flags.sleep_check = true;
        }

        // Mood Alias
        if (flags.mood_recheck) {
            flags.mood_check = true;
        }
    });

    flags.no_flags_baseline = !hasAnyFlags(flags);

    return flags;
};
