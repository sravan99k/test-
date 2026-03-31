/**
 * Grade 6 Phase 3 Flag Deriver
 * 
 * Derives flags for Grade 6, Phase 3 (Final) Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions } from '../../flagEngine';
import type { MiniFlagsG6P3 } from '../types';

/**
 * Derives Mini flags for Grade 6 Phase 3 based on Major assessment responses.
 * 
 * Focuses on end-of-year concerns: burnout, energy levels, family stability,
 * home safety, self-harm crisis, and overall wellbeing.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG6P3 = (questions: any[], responsesArray: any[]): MiniFlagsG6P3 => {
    const flags: MiniFlagsG6P3 = {
        bullying_follow_up: false,
        home_safety_follow_up: false,
        self_harm_crisis_check: false,
        motivation_burnout_check: false,
        energy_check: false,
        family_check: false,
        general_stress_check: false,
        motivation_check: false,
        social_check: false,
        strengths_check: false,
        safety_followup: false,
        no_flags_baseline: false,
        academic_concerns: false,
        emotional_concerns: false,
        support_access: false,
        // Alias flags matching Mini 3.2 scenario IDs
        academic_concerns_final: false,
        emotional_concerns_final: false,
        support_access_final: false,
        bullying_followup: false,
    };

    const responseMap = createResponseMap(responsesArray);

    questions.forEach((q: any) => {
        const answer = getAnswerFromMap(q, questions, responseMap);
        if (answer == null) {
            return;
        }

        const domain = q.domain as string | undefined;
        const subdomain = q.subdomain as string | undefined;

        const flagged = isQuestionFlaggedByConditions(q, answer);

        if (
            domain === 'Safety' &&
            subdomain === 'Home Safety' &&
            flagged
        ) {
            flags.home_safety_follow_up = true;
            flags.safety_followup = true;
        }

        if (domain === 'Bullying' && flagged) {
            flags.bullying_follow_up = true;
            flags.bullying_followup = true;
        }

        if (
            domain === 'Safety' &&
            (subdomain === 'Self-Harm' || subdomain === 'Self-Harm Ideation') &&
            flagged
        ) {
            flags.self_harm_crisis_check = true;
            flags.safety_followup = true;
        }

        // Motivation / Burnout
        if (
            (domain === 'Motivation' || domain === 'Academic') &&
            flagged
        ) {
            flags.motivation_burnout_check = true;
            flags.motivation_check = true;
        }

        // Add Social -> Peer Connection to Burnout Check (Context: Winter Slump)
        if (
            domain === 'Social' &&
            subdomain === 'Peer Connection' &&
            flagged
        ) {
            flags.motivation_burnout_check = true;
        }

        // Energy and Sleep
        if ((domain === 'Energy' || domain === 'Sleep') && flagged) {
            flags.energy_check = true;
        }

        // Strengths
        if (domain === 'Strengths' && flagged) {
            flags.strengths_check = true;
        }

        // Family
        if (domain === 'Family' && flagged) {
            flags.family_check = true;
        }



        // Social (with subdomain check)
        if (
            domain === 'Social' &&
            subdomain === 'Peer Connection' &&
            flagged
        ) {
            flags.social_check = true;
        }

        if (
            domain === 'Social' &&
            subdomain === 'Tech Isolation' &&
            flagged
        ) {
            flags.social_check = true;
        }



        // Emotional domain (with Coping and Overall Mood subdomains)
        if (
            domain === 'Emotional' &&
            (subdomain === 'Coping' || subdomain === 'Overall Mood' || subdomain === 'Somatic') &&
            flagged
        ) {
            flags.general_stress_check = true; // Map emotional concerns to general stress
        }

        // New flags for Mini 3.2
        if (domain === 'Academic' && flagged) {
            flags.academic_concerns = true;
            flags.academic_concerns_final = true;
        }

        if (domain === 'Emotional' && flagged) {
            flags.emotional_concerns = true;
            flags.emotional_concerns_final = true;
        }

        if (domain === 'Family' && subdomain === 'Family Support' && flagged) {
            flags.support_access = true;
            flags.support_access_final = true;
        }
    });

    flags.no_flags_baseline = !hasAnyFlags(flags);

    return flags;
};
