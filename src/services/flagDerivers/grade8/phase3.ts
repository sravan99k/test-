/**
 * Grade 8 Phase 3 Flag Deriver
 * 
 * Derives flags for Grade 8, Phase 3 (Final) Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions, getNumericValueForQuestionAnswer } from '../../flagEngine';
import type { MiniFlagsG8P3 } from '../types';

/**
 * Derives Mini flags for Grade 8 Phase 3 based on Major assessment responses.
 * 
 * Focuses on end-of-year and transition concerns: energy/motivation, academic engagement,
 * peer connections, home safety, self-harm, Grade 9 anxiety, emotional wellbeing,
 * and support access.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG8P3 = (questions: any[], responsesArray: any[]): MiniFlagsG8P3 => {
    const flags: MiniFlagsG8P3 = {
        energy_motivation_recheck: false,
        academic_engagement_recheck: false,
        peer_connection_recheck: false,
        home_safety_recheck: false,
        self_harm_recheck: false,
        academic_concerns_recheck: false,
        grade9_anxiety_recheck: false,
        emotional_concerns_recheck: false,
        support_access_recheck: false,
        safety_followup: false,
        no_flags_baseline: false,
        // New flags
        bullying_followup: false,
        emotional_check: false,
        general_stress_check: false,
        strengths_check: false,
        student_voice_check: false,
        energy_check: false,
        motivation_check: false,
        social_check: false,
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

        // Energy & motivation risk
        if (
            (domain === 'Energy' && flagged) ||
            (domain === 'Motivation' && (flagged || (numeric != null && numeric <= 2)))
        ) {
            flags.energy_motivation_recheck = true;
            flags.academic_concerns_recheck = true;
        }

        // Academic engagement risk
        if (domain === 'Academic' && subdomain === 'Engagement' && flagged) {
            flags.academic_engagement_recheck = true;
            flags.academic_concerns_recheck = true;
        }

        // Peer connection / isolation risk
        if (domain === 'Social' && subdomain === 'Connection/Isolation' && flagged) {
            flags.peer_connection_recheck = true;
        }

        // Mood / emotional concerns
        if (domain === 'Emotional' && subdomain === 'Mood' && flagged) {
            flags.emotional_concerns_recheck = true;
        }

        // Hopelessness / Grade 9 anxiety
        if (domain === 'Emotional' && subdomain === 'Hopelessness Screening' && flagged) {
            flags.grade9_anxiety_recheck = true;
            flags.emotional_concerns_recheck = true;
        }

        // Home safety
        if (domain === 'Safety' && subdomain === 'Home Safety' && flagged) {
            flags.home_safety_recheck = true;
            flags.safety_followup = true;
        }

        // Self-harm safety
        if (domain === 'Safety' && subdomain === 'Self-Harm' && flagged) {
            flags.self_harm_recheck = true;
            flags.safety_followup = true;
        }

        // Support access
        if (
            domain === 'Support' &&
            (flagged || (numeric != null && numeric >= 4))
        ) {
            flags.support_access_recheck = true;
        }

        // Strengths - Low self-concept/strengths
        if (domain === 'Strengths' && flagged) {
            flags.strengths_check = true;
            flags.emotional_concerns_recheck = true; // Map to emotional concerns (self-esteem)
        }

        // Direct mappings for other domains
        if ((domain === 'Bullying' || subdomain === 'Cyberbullying') && flagged) flags.bullying_followup = true;
        if (domain === 'Emotional' && flagged) flags.emotional_check = true;
        if ((domain === 'Stress' || domain === 'General Stress') && flagged) flags.general_stress_check = true;
        if (domain === 'Energy' && flagged) flags.energy_check = true;
        if (domain === 'Motivation' && flagged) flags.motivation_check = true;
        if (domain === 'Social' && flagged) flags.social_check = true;
        // Removed unreachable student_voice_check
    });

    // Fallback: If Rechecks are triggered, ensure corresponding scenario checks are also true
    if (flags.energy_motivation_recheck) {
        flags.energy_check = true;
        flags.motivation_check = true;
    }
    if (flags.peer_connection_recheck) flags.social_check = true;
    if (flags.emotional_concerns_recheck) flags.emotional_check = true;

    flags.no_flags_baseline = !hasAnyFlags(flags);

    return flags;
};
