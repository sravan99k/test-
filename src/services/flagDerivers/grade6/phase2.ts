/**
 * Grade 6 Phase 2 Flag Deriver
 * 
 * Derives flags for Grade 6, Phase 2 (Mid-Year) Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions, getNumericValueForQuestionAnswer } from '../../flagEngine';
import type { MiniFlagsG6P2 } from '../types';

/**
 * Derives Mini flags for Grade 6 Phase 2 based on Major assessment responses.
 * 
 * Focuses on mid-year stressors: exam stress, sleep issues, family support,
 * self-harm ideation, and bullying concerns.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG6P2 = (questions: any[], responsesArray: any[]): MiniFlagsG6P2 => {
    const flags: MiniFlagsG6P2 = {
        exam_stress: false,
        self_harm: false,
        family_support: false,
        sleep_issues: false,
        bullying: false,
        no_flags_mid_year: false,
        exam_stress_recheck: false,
        exam_stress_final_check: false,
        sleep_recheck: false,
        sleep_final_check: false,
        family_support_recheck: false,
        family_support_final: false,
        self_harm_recheck: false,
        self_harm_crisis_check: false,
        bullying_check: false,
        academic_support_check: false,
        social_check: false,
        strengths_check: false,
        academic_check: false,
        // Alias flags for Mini 2.2 scenario IDs
        bullying_followup: false,
        exam_stress_check: false,
        sleep_check: false,
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
        const numeric = getNumericValueForQuestionAnswer(q, answer);

        if (
            flagged &&
            (
                domain === 'Exam Stress' ||
                (domain === 'Emotional' && (
                    subdomain === 'Anxiety' ||
                    subdomain === 'Overwhelm' ||
                    subdomain === 'Frustration Tolerance' ||
                    subdomain === 'Somatic'
                ))
            )
        ) {
            flags.exam_stress = true;
            flags.exam_stress_recheck = true;
            flags.exam_stress_final_check = true;
            flags.exam_stress_check = true;
        }

        // Sleep issues from Sleep domain
        if (domain === 'Sleep' && flagged) {
            flags.sleep_issues = true;
            flags.sleep_recheck = true;
            flags.sleep_final_check = true;
            flags.sleep_check = true;
        }

        // Bullying from Bullying domain
        if (domain === 'Bullying' && flagged) {
            flags.bullying = true;
            flags.bullying_check = true;
            flags.bullying_followup = true;
        }

        // Family support risk from Family / Family Support domain
        if (
            domain === 'Family' &&
            subdomain === 'Family Support' &&
            (flagged || (numeric != null && numeric <= 2))
        ) {
            flags.family_support = true;
            flags.family_support_recheck = true;
            flags.family_support_final = true;
        }

        // Self-harm ideation from Safety / Self-Harm Ideation
        if (
            domain === 'Safety' &&
            subdomain === 'Self-Harm Ideation' &&
            flagged
        ) {
            flags.self_harm = true;
            flags.self_harm_recheck = true;
            flags.self_harm_crisis_check = true;
        }

        // Optional: text-analysis based crisis language in exam-stress open question


        // Missing domains added based on audit:
        // Academic Support domain (no subdomain in JSON)
        if (domain === 'Academic Support' && flagged) {
            flags.academic_support_check = true;
        }

        // Social domain
        if (
            domain === 'Social' &&
            (subdomain === 'Peer Connection' || subdomain === 'Conditional Friendship') &&
            flagged
        ) {
            flags.social_check = true;
        }

        // Strengths domain (no subdomain in JSON)
        if (domain === 'Strengths' && flagged) {
            flags.strengths_check = true;
        }



        // Academic domain - Comparison and Resilience
        if (domain === 'Academic' && flagged) {
            flags.academic_check = true;
        }

        // Self domain - Academic Self-Worth
        if (domain === 'Self' && flagged) {
            flags.academic_check = true;
        }

        // School Environment - Homework, Teachers, Pace
        if (domain === 'School Environment' && flagged) {
            flags.academic_check = true;
        }
    });

    if (
        !flags.exam_stress &&
        !flags.self_harm &&
        !flags.family_support &&
        !flags.sleep_issues &&
        !flags.bullying
    ) {
        flags.no_flags_mid_year = true;
    }

    return flags;
};
