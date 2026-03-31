/**
 * Grade 8 Phase 1 Flag Deriver
 * 
 * Derives flags for Grade 8, Phase 1 Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions, getNumericValueForQuestionAnswer } from '../../flagEngine';
import type { MiniFlagsG8P1 } from '../types';

/**
 * Derives Mini flags for Grade 8 Phase 1 based on Major assessment responses.
 * 
 * Uses domain-driven pattern to detect transition difficulties, social vulnerabilities,
 * neurodevelopmental concerns, and technology-related risks (peer susceptibility,
 * tech abuse, attention issues, social media risk).
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG8P1 = (questions: any[], responsesArray: any[]): MiniFlagsG8P1 => {
    const flags: MiniFlagsG8P1 = {
        academic_recheck: false,
        social_recheck: false,
        mood_recheck: false,
        bullying_recheck: false,
        no_flags_baseline: false,
        peer_susceptibility: false,
        tech_abuse: false,
        attention_issues: false,
        social_media_risk: false,
        neurodevelopmental: false,
        strengths_check: false,
        support_check: false,
        identity_check: false,
        family_check: false,
        // New Missing Flags (Granular)
        girls_health_issue: false,
        body_image_issue: false,
        auditory_processing_issue: false,
        learning_disability_issue: false,
        memory_processing_issue: false,
        sleep_issue: false,
        physical_health_issue: false,
        substance_detail_issue: false,
        // Fixes for Mini 1.2 Unreachable Scenarios
        general_peer_family: false,
        academic_transition_followup: false,
        social_isolation_followup: false,
        mood_followup: false,
        bullying_followup: false,
        adult_support_followup: false,
        peer_pressure_check: false,
        family_understanding_check: false,
        general_stress_check: false,
    };

    // Create response map for O(1) lookups
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

        // General Rechecks
        if (
            domain === 'Academic' &&
            (subdomain === 'Difficulty Transition' || subdomain === 'Academic Confidence') &&
            (flagged || (numeric != null && numeric >= 4))
        ) {
            flags.academic_recheck = true;
            // Map to attention_issues if academic confidence is low
            if (subdomain === 'Difficulty Transition') {
                flags.attention_issues = true;
            }
        }

        if (
            domain === 'Social' &&
            (subdomain === 'Inclusion' || subdomain === 'Peer Connection') &&
            (flagged || (numeric != null && numeric >= 4))
        ) {
            flags.social_recheck = true;
            // Map to Peer Susceptibility if social issues present
            flags.peer_susceptibility = true;
        }

        if (
            domain === 'Emotional' &&
            subdomain === 'Depression Screening' &&
            flagged
        ) {
            flags.mood_recheck = true;
        }

        if (domain === 'Bullying' && flagged) {
            flags.bullying_recheck = true;
            // Map Cyberbullying to Social Media Risk
            if (subdomain === 'Cyberbullying') {
                flags.social_media_risk = true;
                flags.tech_abuse = true;
            }
        }

        // Neurodevelopmental: Granular & Aggregate
        if (domain === 'Auditory Processing' && flagged) {
            flags.auditory_processing_issue = true;
            flags.neurodevelopmental = true;
        }
        if (domain === 'Learning Disability' && flagged) {
            flags.learning_disability_issue = true;
            flags.neurodevelopmental = true;
        }
        if ((domain === 'Memory Processing' || domain === 'Working Memory') && flagged) {
            flags.memory_processing_issue = true;
            flags.neurodevelopmental = true;
        }
        if (domain === 'Physical Disability' && flagged) {
            flags.neurodevelopmental = true;
        }

        // Girls Health
        if (domain === 'Girls Health' && flagged) {
            flags.girls_health_issue = true;
        }

        // Body Image
        if (domain === 'Body Image' && flagged) {
            flags.body_image_issue = true;
            flags.strengths_check = true; // Body image issues affect self-concept
            flags.mood_recheck = true; // Body image issues often coexist with mood issues
        }

        // Tech/Lifestyle & Sleep
        if ((domain === 'Tech/Lifestyle' || domain === 'Health') && flagged) {
            // Assuming Health domain here refers to sleep issues like Q24 "struggle to fall asleep"
            // and Tech/Lifestyle refers to Q18 "stayed up late gaming"
            flags.sleep_issue = true;

            if (domain === 'Tech/Lifestyle') {
                flags.tech_abuse = true;
            }
        }

        // Strengths - self-concept
        if (domain === 'Strengths' && flagged) {
            flags.strengths_check = true;
        }

        // Identity - inconsistent self
        if (domain === 'Identity' && flagged) {
            flags.identity_check = true;
        }

        // Family - understanding
        if (domain === 'Family' && flagged) {
            flags.family_check = true;
        }

        // Support - adult access
        if (domain === 'Support' && flagged) {
            flags.support_check = true;
        }

        // Direct map for attention issues if specifically flagged in that domain
        if (domain === 'Academic' && subdomain === 'Attention' && flagged) {
            flags.attention_issues = true;
        }

        // --- Missing Domains Added ---
        if (domain === 'School Safety' && flagged) {
            flags.bullying_recheck = true; // Unsafe at school -> Bullying check
        }

        if ((domain === 'Trauma' || domain === 'Trauma Exposure') && flagged) {
            flags.mood_recheck = true; // Trauma significantly impacts mood
        }

        if (domain === 'Online Safety' && flagged) {
            flags.social_media_risk = true; // Poor online safety knowledge -> Social Media Risk
        }

        if (domain === 'Physical Health' && flagged) {
            flags.physical_health_issue = true;
        }

        if (domain === 'Substance Detail' && flagged) {
            flags.substance_detail_issue = true;
        }
    });

    // Map parent flags to specific followup scenarios for Mini 1.2
    if (flags.academic_recheck) flags.academic_transition_followup = true;
    if (flags.social_recheck) flags.social_isolation_followup = true;
    if (flags.mood_recheck) flags.mood_followup = true;
    if (flags.bullying_recheck) flags.bullying_followup = true;
    if (flags.support_check) flags.adult_support_followup = true;
    if (flags.peer_susceptibility) flags.peer_pressure_check = true;
    if (flags.family_check) flags.family_understanding_check = true;

    // General Stress Check - Trigger if any key risk block is flagged
    if (flags.academic_recheck || flags.social_recheck || flags.mood_recheck || flags.bullying_recheck || flags.family_check) {
        flags.general_stress_check = true;
    }

    // Use hasAnyFlags helper instead of manual enumeration
    flags.no_flags_baseline = !hasAnyFlags(flags);

    // If baseline (no risks), enable general_peer_family scenario
    if (flags.no_flags_baseline) {
        flags.general_peer_family = true;
        flags.strengths_check = true; // Everybody gets strengths check in Mini 1.2 if baseline
        flags.general_stress_check = true; // Baseline also gets general stress check
    }

    return flags;
};
