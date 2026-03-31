import { createResponseMap, getAnswerFromMap } from '../../assessmentUtils';
import { getNumericValueForQuestionAnswer } from '../../flagEngine';
import { MiniFlagsG9P4 } from '../types';

/**
 * Derives flags for Grade 9 Phase 4 (Exit Interview)
 * Uses domain-driven aggregation (Board Readiness, Stream Satisfaction, Time Management, Resilience, Identity, Family, Peer, Self-Care, Future)
 */
export const deriveMiniFlagsForG9P4 = (
    questions: any[],
    responsesArray: any[]
): MiniFlagsG9P4 => {
    const flags: MiniFlagsG9P4 = {
        board_exam_anxiety: false,
        stream_regret: false,
        executive_dysfunction: false,
        emotional_vulnerability: false,
        academic_identity_confusion: false,
        social_isolation: false,
        poor_self_care: false,
        future_anxiety: false,
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


    // 1. Board Exam Anxiety (Domain: Academic / General / Support)
    if (checkDomainLowScore('Academic') || checkDomainLowScore('General') || checkDomainLowScore('Support')) {
        flags.board_exam_anxiety = true;
        hasAnyFlag = true;
    }

    // 2. Stream Regret (No Stream Satisfaction domain in this short assessment)
    // Mapping General Experience (if low) -> potentially Stream Regret or Future Anxiety
    // Keeping false as we cannot infer this safely without the domain.

    // 3. Executive Dysfunction (No Time Management domain)
    // flags.executive_dysfunction = false;

    // 4. Emotional Vulnerability (Domain: Strengths / Bullying)
    if (checkDomainLowScore('Strengths') || checkDomainLowScore('Bullying')) {
        flags.emotional_vulnerability = true;
        hasAnyFlag = true;
    }

    // 5. Academic Identity Confusion (No Academic Identity domain)
    if (checkDomainLowScore('Strengths') && checkDomainLowScore('Academic')) {
        // Proxy: Low strengths + Low Academic might indicate identity confusion
        flags.academic_identity_confusion = true;
        hasAnyFlag = true;
    }

    // 6. Social Isolation (Domain: Social)
    if (checkDomainLowScore('Social')) {
        flags.social_isolation = true;
        hasAnyFlag = true;
    }

    // 7. Poor Self-Care (No Self-Care domain)
    // flags.poor_self_care = false;

    // 8. Future Anxiety (Domain: Hope)
    if (checkDomainLowScore('Hope')) {
        flags.future_anxiety = true;
        hasAnyFlag = true;
    }

    if (!hasAnyFlag) {
        flags.no_flags_baseline = true;
    }

    return flags;
};
