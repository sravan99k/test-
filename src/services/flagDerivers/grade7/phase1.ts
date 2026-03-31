/**
 * Grade 7 Phase 1 Flag Deriver
 * 
 * Derives flags for Grade 7, Phase 1 Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 * 
 * Note: This deriver uses a mix of domain-based and question-ID-based logic
 * for maximum specificity in detecting adolescent concerns.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions, getNumericValueForQuestionAnswer } from '../../flagEngine';
import type { MiniFlagsG7P1 } from '../types';

/**
 * Derives Mini flags for Grade 7 Phase 1 based on Major assessment responses.
 * 
 * Comprehensively checks for body image concerns, peer pressure, digital anxiety,
 * academic confidence, mood issues, bullying, and various targeted follow-ups.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG7P1 = (questions: any[], responsesArray: any[]): MiniFlagsG7P1 => {
    const flags: MiniFlagsG7P1 = {
        // Existing
        body_image: false,
        peer_pressure: false,
        digital_anxiety: false,
        disengaged: false,
        academic_confidence_recheck: false,
        belonging_recheck: false,
        mood_recheck: false,
        bullying_recheck: false,

        // New
        bullying_followup: false,
        general_stress_check: false,
        mood_check: false,
        somatic_check: false,
        strengths_check: false,
        support_check: false,
        adhd_screen_followup: false,
        academic_skills_followup: false,
        anger_coping_followup: false,
        cyberbullying_followup: false,
        emotional_literacy_followup: false,
        girls_health_followup: false,
        ld_screen_followup: false,
        memory_strategies_followup: false,
        romantic_followup: false,
        self_followup: false,
        self_harm_followup: false,
        social_media_risk_followup: false,
        social_media_safety_followup: false,
        substance_detail_followup: false,
        tech_followup: false,
        general_social_check: false,
        social_inclusion_followup: false,
        peer_connection_followup: false,
        digital_stress_followup: false,
        mood_loneliness_followup: false,
        academic_confidence_check: false,
        adult_support_check: false,
        family_check: false,

        no_flags_baseline: false,
    };

    const responseMap = createResponseMap(responsesArray);



    // 1. Domain-based flags (comprehensive loop)
    questions.forEach((q: any) => {
        const answer = getAnswerFromMap(q, questions, responseMap);
        if (answer == null) return;

        const domain = q.domain as string | undefined;
        const subdomain = q.subdomain as string | undefined;
        const section = q.section as string | undefined;

        // Determine if question should be flagged (either by conditions or by numeric default)
        const numericValue = getNumericValueForQuestionAnswer(q, answer);
        const flaggedByConditions = isQuestionFlaggedByConditions(q, answer);

        // Default flagging for critical domains where flagConditions might be missing in JSON
        // Using >= 3 as a general threshold for "Moderate/Somewhat/neutral" or worse
        const flagged = flaggedByConditions || (numericValue != null && numericValue >= 3);

        // General Domain Triggers
        if (flagged) {
            if (domain === 'ADHD Screen') flags.adhd_screen_followup = true;
            if (domain === 'Academic Skills') flags.academic_skills_followup = true;
            if (domain === 'Anger Coping') flags.anger_coping_followup = true;
            if (domain === 'Cyberbullying') {
                flags.cyberbullying_followup = true;
                // Cyberbullying often relates to digital anxiety
                flags.digital_anxiety = true;
            }
            if (domain === 'Emotional Literacy') flags.emotional_literacy_followup = true;
            if (domain === 'Girls Health') flags.girls_health_followup = true;
            if (domain === 'LD Screen') flags.ld_screen_followup = true;
            if (domain === 'Memory Strategies') flags.memory_strategies_followup = true;
            if (domain === 'Romantic') flags.romantic_followup = true;

            if (domain === 'Self') {
                flags.self_followup = true;
                // Body Image Scenario Trigger
                if (section === 'Body Image & Puberty') {
                    flags.body_image = true;
                }
            }

            // Fixed typo from 'Stengths'
            if (domain === 'Strengths') flags.strengths_check = true;

            // Critical Safety Map
            // G7P1 JSON uses "Safety" for Self-Harm Ideation Q33, "Self-harm" for others
            if (domain === 'Safety') {
                if (subdomain === 'Self-Harm Ideation' || subdomain === 'Self-Harm') {
                    flags.self_harm_followup = true;
                }
            }

            if (domain === 'Health') {
                if (subdomain === 'Menstrual Health') flags.girls_health_followup = true;
                else flags.somatic_check = true;
            }

            if (domain === 'Substance') flags.substance_detail_followup = true;

            if (domain === 'Self-harm' || domain === 'Self-Harm') flags.self_harm_followup = true;
            if (domain === 'Social Media Risk') flags.social_media_risk_followup = true;
            if (domain === 'Social Media Safety') flags.social_media_safety_followup = true;
            if (domain === 'Substance Detail') flags.substance_detail_followup = true;
            if (domain === 'Tech') flags.tech_followup = true;

            if (domain === 'Bullying') {
                flags.bullying_followup = true;
                flags.bullying_recheck = true;
            }



            if (domain === 'Mood') {
                flags.mood_check = true;
                flags.mood_recheck = true;
                flags.mood_loneliness_followup = true; // Mood domain triggers loneliness check
                flags.general_stress_check = true; // Mood issues often correlate with general stress
            }

            if (domain === 'Somatic' || domain === 'Physical') flags.somatic_check = true;

            if (domain === 'Support' || domain === 'Adult Support') {
                flags.support_check = true;
                flags.adult_support_check = true;
            }
            if (domain === 'Family') flags.family_check = true;

            // Missing top-level domains mapping
            if (domain === 'Academic') {
                // Check specific subdomains for confidence
                if (subdomain === 'Academic Confidence' || subdomain === 'Organization' || subdomain === 'Academic Load') {
                    flags.academic_confidence_check = true;
                    flags.academic_confidence_recheck = true;
                }
            }

            if (domain === 'Emotional') {
                flags.mood_check = true;
                flags.mood_recheck = true;
                // Emotional domain questions (like loneliness) trigger mood/loneliness followup
                flags.mood_loneliness_followup = true;
                flags.general_stress_check = true;
            }

            if (domain === 'Social') {
                flags.general_social_check = true;

                if (subdomain === 'Inclusion') {
                    flags.social_inclusion_followup = true;
                    flags.belonging_recheck = true;
                }

                if (subdomain === 'Peer Connection' || subdomain === 'Peer Pressure') {
                    flags.peer_connection_followup = true;
                    flags.peer_pressure = true;
                }

                // Digital Stress check (often under Social domain, section 'Digital Stress')
                if (section === 'Digital Stress') {
                    flags.digital_stress_followup = true;
                    flags.digital_anxiety = true;
                }
            }
        }
    });



    // Disengaged logic
    if (flags.academic_confidence_recheck || flags.belonging_recheck || flags.mood_recheck) {
        flags.disengaged = true;
    }

    // Baseline check
    if (Object.values(flags).every(v => v === false)) {
        flags.no_flags_baseline = true;
    }

    return flags;
};
