/**
 * Grade 9 Phase 3 Flag Deriver
 * 
 * Derives flags for Grade 9, Phase 3 (Final) Major assessment to determine
 * which Mini assessment scenarios should be triggered.
 */

import { createResponseMap, getAnswerFromMap, hasAnyFlags } from '../../assessmentUtils';
import { isQuestionFlaggedByConditions, getNumericValueForQuestionAnswer } from '../../flagEngine';
import type { MiniFlagsG9P3 } from '../types';

/**
 * Derives Mini flags for Grade 9 Phase 3 based on Major assessment responses.
 * 
 * Comprehensive end-of-year assessment covering identity/stream decisions, board anxiety,
 * emotional readiness for Grade 10, support access, burnout, digital wellbeing, and safety.
 * Maps legacy flags to scenario-specific flags for better Mini alignment.
 * 
 * @param questions - Array of Major assessment questions
 * @param responsesArray - Array of student responses
 * @returns Flag set indicating which Mini assessment scenarios to trigger
 */
export const deriveMiniFlagsForG9P3 = (questions: any[], responsesArray: any[]): MiniFlagsG9P3 => {
    const flags: MiniFlagsG9P3 = {
        // Legacy flags
        identity_confusion_recheck: false,
        stream_anxiety_recheck: false,
        home_safety_recheck: false,
        self_harm_recheck: false,
        stream_confidence_recheck: false,
        board_anxiety_recheck: false,
        emotional_readiness_recheck: false,
        support_access_recheck: false,

        // Scenario-matching flags
        academic_check: false,
        bullying_followup: false,
        digital_wellbeing_check: false,
        emotional_check: false,
        family_check: false,
        general_stress_check: false,
        sleep_check: false,
        somatic_check: false,
        strengths_check: false,
        support_check: false,
        burnout_followup: false,

        safety_followup: false,
        transition_check: false,

        no_flags_baseline: false,
    };

    const responseMap = createResponseMap(responsesArray);

    const allDomains = new Set<string>();
    const flaggedDomains = new Set<string>();

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

        if (domain) {
            allDomains.add(domain);
            if (flagged) {
                flaggedDomains.add(domain);
            }
        }

        // ===== SUBDOMAIN-SPECIFIC CHECKS (Legacy + Scenario matching) =====

        // Identity confusion from low self-worth -> maps to emotional_check scenario
        if (domain === 'Emotional' && subdomain === 'Self-Worth' && flagged) {
            flags.identity_confusion_recheck = true;
            flags.emotional_readiness_recheck = true;
            flags.emotional_check = true;
        }

        // Stream anxiety / confidence from lack of planning for finals -> maps to academic_check scenario
        if (domain === 'Academic' && subdomain === 'Planning' && flagged) {
            flags.stream_anxiety_recheck = true;
            flags.stream_confidence_recheck = true;
            flags.academic_check = true;
        }

        // Home safety / support from poor family listening -> maps to family_check scenario
        if (domain === 'Family' && subdomain === 'Listening/Support' && flagged) {
            flags.home_safety_recheck = true;
            flags.support_access_recheck = true;
            flags.family_check = true;
            flags.safety_followup = true;
        }

        // Low support / isolation from digital isolation patterns -> maps to digital_wellbeing_check & support_check scenarios
        if (domain === 'Digital Well-being' && subdomain === 'Isolation' && flagged) {
            flags.support_access_recheck = true;
            flags.digital_wellbeing_check = true;
            flags.support_check = true;
        }

        // Board anxiety from hopelessness -> maps to emotional_check scenario
        if (domain === 'Emotional' && subdomain === 'Hopelessness Screening' && flagged) {
            flags.board_anxiety_recheck = true;
            flags.emotional_readiness_recheck = true;
            flags.emotional_check = true;
        }

        // Self-harm safety
        if (domain === 'Safety' && subdomain === 'Self-Harm' && flagged) {
            flags.self_harm_recheck = true;
            flags.safety_followup = true;
        }

        // ===== GENERAL DOMAIN CHECKS (For questions without subdomains) =====

        // Bullying - general bullying questions
        if (domain === 'Bullying' && flagged) {
            flags.bullying_followup = true;
        }

        // Emotional - general happiness/mood without specific subdomain
        if (domain === 'Emotional' && !subdomain && flagged) {
            flags.emotional_check = true;
        }

        // Sleep - sleep quality
        if (domain === 'Sleep' && flagged) {
            flags.sleep_check = true;
        }

        // Somatic - physical symptoms
        if (domain === 'Somatic' && flagged) {
            flags.board_anxiety_recheck = true;
            flags.somatic_check = true;
            flags.general_stress_check = true;
        }

        // Academic - general academic without subdomain
        if (domain === 'Academic' && !subdomain && flagged) {
            flags.academic_check = true;
        }

        // Burnout - burnout/exhaustion
        if (domain === 'Burnout' && flagged) {
            flags.burnout_followup = true;
            flags.general_stress_check = true;
        }

        // Strengths - self-concept about strengths
        if (domain === 'Strengths' && flagged) {
            flags.strengths_check = true;
        }

        // --- Missing Domains Added ---

        // Career / Stream Anxiety
        if (domain === 'Career' && flagged) {
            flags.stream_anxiety_recheck = true;
            flags.transition_check = true; // Transition to next grade/stream
        }

        // Health - Appetite/Physical
        if (domain === 'Health' && flagged) {
            flags.somatic_check = true;
        }

        // Identity - Self-knowledge/confusion
        if (domain === 'Identity' && flagged) {
            flags.identity_confusion_recheck = true;
        }

        // Motivation - Academic motivation
        if (domain === 'Motivation' && flagged) {
            flags.academic_check = true; // Low motivation affects academic performance
        }

        // Social - Withdrawal/Isolation
        if (domain === 'Social' && flagged) {
            flags.support_check = true; // Withdrawal indicates need for support
            flags.emotional_check = true; // Social withdrawal is often emotional
        }

        // Substance - Study aids/Risk
        if (domain === 'Substance' && flagged) {
            flags.safety_followup = true; // Substance use is a safety concern
            flags.somatic_check = true; // Physical impact of substances
        }
    });

    flags.no_flags_baseline = !hasAnyFlags(flags);

    console.log('[G9P3 FlagDeriver] Domains present in major:', Array.from(allDomains));
    console.log('[G9P3 FlagDeriver] Domains with any flagged responses:', Array.from(flaggedDomains));
    console.log('[G9P3 FlagDeriver] Derived flags:', flags);

    return flags;
};
