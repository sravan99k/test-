/**
 * Grade 10 Phase 3 Flag Deriver
 * 
 * Derives flags for Grade 10, Phase 3 (Final) Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions, getNumericValueForQuestionAnswer } from '../../flagEngine';
import type { MiniFlagsG10P3 } from '../types';

/**
 * Derives Mini flags for Grade 10 Phase 3 based on Major assessment responses.
 * 
 * Final board exam phase assessment covering physical health, academic confidence,
 * exam anxiety, coping skills, family support, social connection, support access,
 * and critical safety concerns.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG10P3 = (questions: any[], responsesArray: any[]): MiniFlagsG10P3 => {
    const flags: MiniFlagsG10P3 = {
        physical_health_recheck: false,
        academic_confidence_recheck: false,
        coping_skills_recheck: false,
        family_support_recheck: false,
        self_harm_recheck: false,
        exam_anxiety_recheck: false,
        support_access_recheck: false,
        safety_followup: false,
        no_flags_baseline: false,
        // New Flags
        hall_ticket_check: false,
        last_minute_panic_check: false,
        exam_day_logistics: false,
        post_exam_crash_check: false,
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

        // Physical health: sleep and somatic stress
        if (
            (domain === 'Sleep' && subdomain === 'Sleep Quality' && flagged) ||
            (domain === 'Somatic' && subdomain === 'Somatic Stress' && flagged)
        ) {
            flags.physical_health_recheck = true;
        }

        // Academic confidence and exam readiness
        if (
            (domain === 'Emotional' && subdomain === 'Confidence' && flagged) ||
            (domain === 'Academic' && subdomain === 'Strategy' && flagged)
        ) {
            flags.academic_confidence_recheck = true;
            flags.exam_anxiety_recheck = true;
        }

        // Coping skills and anxiety management
        if (domain === 'Cognitive Function' && subdomain === 'Executive Function' && flagged) {
            flags.coping_skills_recheck = true;
            flags.exam_anxiety_recheck = true;
        }

        if (domain === 'Motivation' && subdomain === 'School Engagement' && flagged) {
            flags.coping_skills_recheck = true;
            flags.exam_anxiety_recheck = true;
        }

        // Family environment and support
        if (domain === 'Family' && subdomain === 'Atmosphere' && flagged) {
            flags.family_support_recheck = true;
            flags.support_access_recheck = true;
        }

        // Social connection contributing to support access
        if (domain === 'Social' && subdomain === 'Connection' && flagged) {
            flags.support_access_recheck = true;
        }

        // Self-harm safety
        if (domain === 'Safety' && subdomain === 'Suicide Risk' && flagged) {
            flags.self_harm_recheck = true;
            flags.safety_followup = true;
        }

        // --- Missing Domains Added ---

        // Resilience - Recovery from Pre-Boards
        if (domain === 'Resilience' && flagged) {
            flags.exam_anxiety_recheck = true; // Lack of recovery indicates lingering anxiety
            flags.coping_skills_recheck = true; // Poor resilience suggests coping issues
        }

        // Logistics - Exam readiness
        if (domain === 'Logistics' && flagged) {
            flags.exam_anxiety_recheck = true; // Logistical unpreparedness causes anxiety

            // Hall Ticket Check (Always ask, but flag if specifically problematic)
            // In Mini 3.1, this is "Always ask". We can set it to true if we want to force the specific scenario logic,
            // or rely on the assessment engine to pick it up. Given scenarios have IDs, lets default to true if we want to ensure it runs.
            // Actually, Mini 3.1 says "Always ask".
            flags.hall_ticket_check = true;

            // Exam Day Logistics (Mini 3.2 "Always ask")
            flags.exam_day_logistics = true;
        }

        // Coping - Panic Plan
        if (domain === 'Coping' && flagged) {
            flags.coping_skills_recheck = true;
            flags.exam_anxiety_recheck = true;
        }

        // Resilience - Post Exam Crash
        if (domain === 'Resilience' && flagged) {
            flags.post_exam_crash_check = true; // Specific Scenario for Mini 3.2
        }

        // Panic - Last Minute
        if (domain === 'Panic' && flagged) {
            flags.last_minute_panic_check = true; // Specific Scenario
            flags.exam_anxiety_recheck = true;
        }

        // If Exam Anxiety is high, check panic
        if (flags.exam_anxiety_recheck) {
            flags.last_minute_panic_check = true;
        }
    });

    flags.no_flags_baseline = !hasAnyFlags(flags);

    return flags;
};
