/**
 * Grade 6 Phase 1 Flag Deriver
 * 
 * Derives flags for Grade 6, Phase 1 Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions } from '../../flagEngine';
import type { MiniFlagsG6P1 } from '../types';

/**
 * Derives Mini flags for Grade 6 Phase 1 based on Major assessment responses.
 * 
 * Uses domain-driven pattern to map question domains/subdomains to specific flags.
 * Optimized with O(1) response lookups via createResponseMap.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG6P1 = (questions: any[], responsesArray: any[]): MiniFlagsG6P1 => {
    const flags: MiniFlagsG6P1 = {
        academic_anxiety: false,
        social_isolation: false,
        neurodevelopmental_concerns: false,
        trauma_exposure: false,
        trauma_recheck: false,
        neurodevelopmental_recheck: false,
        academic_anxiety_recheck: false,
        social_isolation_recheck: false,
        mood_concerns_recheck: false,
        bullying_recheck: false,
        bullying_followup: false,
        general_stress_check: false,
        mood_check: false,
        strengths_check: false,
        adult_support_followup: false,
        student_voice_followup: false,
        future_hope_check: false,
        adult_trust_check: false,
        self_regulation_check: false,
        self_worth_check: false,
        school_engagement_check: false,
        belonging_check: false,
        no_flags_baseline: false,
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

        // Academic anxiety: academic adjustment/anxiety questions that meet their flagConditions
        if (
            flaggedByConditions &&
            domain === 'Academic' &&
            (subdomain === 'Academic Adjustment' || subdomain === 'Academic Anxiety')
        ) {
            flags.academic_anxiety = true;
            flags.academic_anxiety_recheck = true;
        }

        // Social isolation: low peer connection / social inclusion
        if (
            flaggedByConditions &&
            domain === 'Social' &&
            (subdomain === 'Peer Connection' || subdomain === 'Social Inclusion')
        ) {
            flags.social_isolation = true;
            flags.social_isolation_recheck = true;
        }

        // Mood concerns check
        if (flaggedByConditions && domain === 'Mood') {
            flags.mood_concerns_recheck = true;
            flags.mood_check = true;
        }

        // Bullying / trauma exposure from explicit bullying-domain flags
        if (flaggedByConditions && domain === 'Bullying') {
            flags.trauma_exposure = true;
            flags.trauma_recheck = true;
            flags.bullying_recheck = true;
            flags.bullying_followup = true;
        }

        // Safety / Trauma exposure from Safety domain (witnessing violence, trauma)
        if (flaggedByConditions && domain === 'Safety' && subdomain === 'Trauma') {
            flags.trauma_exposure = true;
            flags.trauma_recheck = true;
        }





        // Adult Support - Check matches Domain: Adult Support
        if (flaggedByConditions && domain === 'Adult Support') {
            flags.adult_support_followup = true;
            // Also triggers Adult Trust check if specifically related to trust question (Q24 / S2)
            // or generally if support is lacking, we want to check trust.
            flags.adult_trust_check = true;
        }



        // Future Hope
        if (flaggedByConditions && domain === 'Future Hope') {
            flags.future_hope_check = true;
        }

        // Adult Trust
        // Removed: 'Adult Trust' is not a domain. It's covered under 'Adult Support'.

        // Self-Regulation
        // Mapped to: Strengths -> Self-Regulation (S3/Q25) OR Mood -> Emotional Regulation (Q13)
        if (
            flaggedByConditions &&
            ((domain === 'Strengths' && subdomain === 'Self-Regulation') ||
                (domain === 'Mood' && subdomain === 'Emotional Regulation'))
        ) {
            flags.self_regulation_check = true;
        }

        // Self-Worth
        // Mapped to: Strengths -> Self-Concept (Q1)
        if (flaggedByConditions && domain === 'Strengths' && subdomain === 'Self-Concept') {
            flags.self_worth_check = true;
            flags.strengths_check = true; // Also triggers general strengths check
        }

        // School Engagement / Student Voice
        // Mapped to: School Environment
        if (flaggedByConditions && domain === 'School Environment') {
            flags.school_engagement_check = true;

            // Student Voice specific checks:
            // Help Seeking (Q17) often relates to voice
            if (subdomain === 'Help Seeking') {
                flags.student_voice_followup = true;
            }
        }

        // Student Voice can also be flagged by Social -> Identity (Q11) "comfortable being myself"
        if (flaggedByConditions && domain === 'Social' && subdomain === 'Identity') {
            flags.student_voice_followup = true;
        }

        // Belonging
        // Mapped to Social -> Social Inclusion (Q6)
        if (flaggedByConditions && domain === 'Social' && subdomain === 'Social Inclusion') {
            flags.belonging_check = true;
        }

        // Neurodevelopmental concerns: Academic domain flags (attention, learning difficulties)
        // Note: G6P1 major doesn't have specific neurodevelopmental subdomains,
        // so we map any flagged Academic domain to neurodevelopmental_concerns
        // This follows Option C approach: map to general academic/attention domains
        if (flaggedByConditions && domain === 'Academic') {
            flags.neurodevelopmental_concerns = true;
            flags.neurodevelopmental_recheck = true;
        }

        // Strengths - checking for low self-concept/strengths
        if (flaggedByConditions && domain === 'Strengths') {
            flags.strengths_check = true;
        }

        // Family - family relationships (separate from Adult Support)
        if (flaggedByConditions && domain === 'Family') {
            flags.general_stress_check = true; // Family stress contributes to general stress
        }

        // Digital - screen time, digital wellbeing
        if (flaggedByConditions && domain === 'Digital') {
            flags.general_stress_check = true; // Digital issues can indicate stress/regulation issues
        }

        // School Environment - school belonging, climate, safety
        // Logic handled above in specific School Engagement block

        // Physical - physical health, hygiene
        if (flaggedByConditions && domain === 'Physical') {
            flags.general_stress_check = true; // Physical health issues may indicate general stress/neglect
        }

    });

    // Set baseline flag if no scenarios are triggered
    flags.no_flags_baseline = !hasAnyFlags(flags);

    return flags;
};
