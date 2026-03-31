
import { createResponseMap, getAnswerFromMap } from '../../assessmentUtils';
import { getNumericValueForQuestionAnswer } from '../../flagEngine';
import { MiniFlagsG6P4 } from '../types';

/**
 * Derives flags for Grade 6 Phase 4 (Exit Interview)
 * Uses domain-driven aggregation (Growth, Resilience, Future, Social, Emotional, Self)
 */
export const deriveMiniFlagsForG6P4 = (
    questions: any[],
    responsesArray: any[]
): MiniFlagsG6P4 => {
    const flags: MiniFlagsG6P4 = {
        growth_stagnation: false,
        resilience_gap: false,
        future_anxiety: false,
        social_stagnation: false,
        emotional_regulation_gap: false,
        self_esteem_drop: false,
        no_flags_baseline: false,
    };

    let hasAnyFlag = false;

    const responseMap = createResponseMap(responsesArray);

    // Helper to check domain scores
    const checkDomainLowScore = (domain: string, threshold: number = 3): boolean => {
        const domainQuestions = questions.filter((q: any) => q.domain === domain);
        if (domainQuestions.length === 0) return false;

        const totalScore = domainQuestions.reduce((sum: number, q: any) => {
            const answer = getAnswerFromMap(q, questions, responseMap);
            return sum + (getNumericValueForQuestionAnswer(q, answer || '') || 0);
        }, 0);
        const avgScore = totalScore / domainQuestions.length;

        return avgScore < threshold;
    };

    // 1. Growth Stagnation (Domain: Growth)
    // "I feel more confident now..." (M4.1)
    if (checkDomainLowScore('Growth')) {
        flags.growth_stagnation = true;
        hasAnyFlag = true;
    }

    // 2. Resilience Gap (Domain: Resilience)
    // "I know who to talk to..." (M4.2)
    if (checkDomainLowScore('Resilience')) {
        flags.resilience_gap = true;
        hasAnyFlag = true;
    }

    // 3. Future Anxiety (Domain: Future)
    // "I am excited to go to Grade 7" (M4.3)
    if (checkDomainLowScore('Future')) {
        flags.future_anxiety = true;
        hasAnyFlag = true;
    }

    // 4. Social Stagnation (Domain: Social)
    // "I have better friends now..." (M4.5)
    if (checkDomainLowScore('Social')) {
        flags.social_stagnation = true;
        hasAnyFlag = true;
    }

    // 5. Emotional Regulation Gap (Domain: Emotional)
    // "I learned how to control my anger..." (M4.6)
    if (checkDomainLowScore('Emotional')) {
        flags.emotional_regulation_gap = true;
        hasAnyFlag = true;
    }

    // 6. Self-Esteem Drop (Domain: Self + Strengths)
    // "I like myself more now..." (M4.7)
    if (checkDomainLowScore('Self') || checkDomainLowScore('Strengths')) {
        flags.self_esteem_drop = true;
        hasAnyFlag = true;
    }

    // 7. Academic Stagnation -> Mapped to Growth Stagnation
    if (checkDomainLowScore('Academic')) {
        flags.growth_stagnation = true;
        hasAnyFlag = true;
    }

    // 8. Hope -> Mapped to Future Anxiety
    if (checkDomainLowScore('Hope')) {
        flags.future_anxiety = true;
        hasAnyFlag = true;
    }

    // 9. Family & Support -> Mapped to Resilience Gap (Support System)
    if (checkDomainLowScore('Family') || checkDomainLowScore('Support')) {
        flags.resilience_gap = true;
        hasAnyFlag = true;
    }

    // 10. Reflection -> Mapped to Growth Stagnation
    if (checkDomainLowScore('Reflection')) {
        flags.growth_stagnation = true;
        hasAnyFlag = true;
    }

    if (!hasAnyFlag) {
        flags.no_flags_baseline = true;
    }

    return flags;
};
