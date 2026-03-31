/**
 * Grade 7 Phase 3 Flag Deriver
 * 
 * Derives flags for Grade 7, Phase 3 (Final) Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions, getNumericValueForQuestionAnswer } from '../../flagEngine';
import type { MiniFlagsG7P3 } from '../types';

/**
 * Derives Mini flags for Grade 7 Phase 3 based on Major assessment responses.
 * 
 * Focuses on end-of-year concerns: energy/fatigue, motivation, coping skills,
 * digital wellbeing, family support, safety issues, and academic readiness.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG7P3 = (questions: any[], responsesArray: any[]): MiniFlagsG7P3 => {
    const flags: MiniFlagsG7P3 = {
        energy_fatigue_check: false,
        motivation_check: false,
        coping_check: false,
        digital_wellbeing_check: false,
        family_support_check: false,
        bullying_check: false,
        self_harm_check: false,
        academic_check: false,
        social_check: false,
        strengths_check: false,
        student_voice_check: false,
        home_safety_check: false,
        no_flags_baseline: false,
        exam_prep_check: true, // Always check
        general_readiness_check: true, // Always check
        general_readiness: true, // Alias for Mini 3.2 scenario ID
    };

    const responseMap = createResponseMap(responsesArray);

    // 1. Domain Checks
    questions.forEach((q: any) => {
        const answer = getAnswerFromMap(q, questions, responseMap);
        if (answer == null) return;
        const subdomain = q.subdomain as string | undefined;

        // Determine if question should be flagged (either by conditions or by numeric default)
        const numericValue = getNumericValueForQuestionAnswer(q, answer);
        const flaggedByConditions = isQuestionFlaggedByConditions(q, answer);

        // Default flagging for critical domains where flagConditions might be missing in JSON
        // Using >= 3 as a general threshold for "Moderate/Somewhat/neutral" or worse
        const flagged = flaggedByConditions || (numericValue != null && numericValue >= 3);

        const domain = q.domain as string | undefined;

        if (flagged) {
            if (domain === 'Energy') flags.energy_fatigue_check = true;
            if (domain === 'Motivation') flags.motivation_check = true;
            if (domain === 'Emotional') flags.coping_check = true;
            if (domain === 'Digital' || domain === 'Digital Well-being') flags.digital_wellbeing_check = true;
            if (domain === 'Family') flags.family_support_check = true;
            if (domain === 'Bullying') flags.bullying_check = true;
            if (domain === 'Safety' && (q.subdomain === 'Self-Harm' || q.subdomain === 'Self Harm')) flags.self_harm_check = true;
            if (domain === 'Safety' && q.subdomain === 'Home Safety') flags.home_safety_check = true;
            if (domain === 'Academic') flags.academic_check = true;
            if (domain === 'Social') flags.social_check = true;
            if (domain === 'Strengths') flags.strengths_check = true;
            if (domain === 'Emotional' && q.subdomain === 'Isolation') flags.student_voice_check = true;

            // --- Missing Domains Added ---
            if (domain === 'Risk') flags.coping_check = true; // High risk often indicates poor coping
            if (domain === 'Self') flags.coping_check = true; // Body image issues affect coping
            if (domain === 'Biological') flags.energy_fatigue_check = true; // Mood/Hormonal affects energy
            if (domain === 'Sleep') flags.energy_fatigue_check = true; // Sleep directly impacts energy
            if (domain === 'Future') flags.academic_check = true; // Anxiety about G8 affects academic readiness
            if (domain === 'Tech') flags.digital_wellbeing_check = true;
            if (domain === 'Resilience') flags.coping_check = true; // Resilience is about coping strategies

        }


    });




    const anyFlag =
        flags.energy_fatigue_check ||
        flags.motivation_check ||
        flags.coping_check ||
        flags.digital_wellbeing_check ||
        flags.family_support_check ||
        flags.bullying_check ||
        flags.self_harm_check ||
        flags.academic_check ||
        flags.social_check ||
        flags.strengths_check ||
        flags.home_safety_check ||
        flags.student_voice_check;

    if (!anyFlag) {
        flags.no_flags_baseline = true;
    }

    return flags;
};
