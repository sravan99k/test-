
import { AssessmentQuestion, createResponseMap, getAnswerFromMap } from '../../assessmentUtils';
import { getNumericValueForQuestionAnswer } from '../../flagEngine';
import { MiniFlagsG10P4 } from '../types';

/**
 * Derives flags for Grade 10 Phase 4 (Post-Exam Recovery)
 * Uses domain-driven aggregation for detailed recovery analysis
 */
export const deriveMiniFlagsForG10P4 = (
    questions: any[],
    responsesArray: any[]
): MiniFlagsG10P4 => {
    const flags: MiniFlagsG10P4 = {
        post_exam_emptiness: false,
        identity_loss: false,
        result_anxiety: false,
        future_optimism_deficit: false,
        life_imbalance: false,
        social_withdrawal: false,
        exam_defined_identity: false,
        fixed_mindset: false,
        no_flags_baseline: false,
    };

    const responseMap = createResponseMap(responsesArray);
    let hasAnyFlag = false;

    // Helper to check domain scores using exact domain names from JSON
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

    // Helper for High Score checks (e.g. Identity Loss)
    const checkDomainHighScore = (domain: string, threshold: number = 3.5): boolean => {
        const domainQuestions = questions.filter((q: any) => q.domain === domain);
        if (domainQuestions.length === 0) return false;

        const totalScore = domainQuestions.reduce((sum: number, q: any) => {
            const answer = getAnswerFromMap(q, questions, responseMap);
            return sum + (getNumericValueForQuestionAnswer(q, answer || '') || 0);
        }, 0);
        const avgScore = totalScore / domainQuestions.length;

        return avgScore >= threshold;
    };

    // Helper to check SUBDOMAIN scores (Low Score)
    const checkSubdomainLowScore = (subdomain: string, threshold: number = 3): boolean => {
        const subQuestions = questions.filter((q: any) => q.subdomain === subdomain);
        if (subQuestions.length === 0) return false;

        const totalScore = subQuestions.reduce((sum: number, q: any) => {
            const answer = getAnswerFromMap(q, questions, responseMap);
            return sum + (getNumericValueForQuestionAnswer(q, answer || '') || 0);
        }, 0);
        const avgScore = totalScore / subQuestions.length;

        return avgScore < threshold;
    };

    // Helper to check SUBDOMAIN scores (High Score)
    const checkSubdomainHighScore = (subdomain: string, threshold: number = 3.5): boolean => {
        const subQuestions = questions.filter((q: any) => q.subdomain === subdomain);
        if (subQuestions.length === 0) return false;

        const totalScore = subQuestions.reduce((sum: number, q: any) => {
            const answer = getAnswerFromMap(q, questions, responseMap);
            return sum + (getNumericValueForQuestionAnswer(q, answer || '') || 0);
        }, 0);
        const avgScore = totalScore / subQuestions.length;

        return avgScore >= threshold;
    };

    // 1. Post-Exam Emptiness (Domain: Identity / Subdomain: Post-Exam Emptiness)
    if (checkSubdomainHighScore('Post-Exam Emptiness')) {
        flags.post_exam_emptiness = true;
        hasAnyFlag = true;
    }

    // 2. Identity Loss (Domain: Identity / Subdomain: Identity Loss, Purpose Void)
    // Also include Strengths (Self-Concept) Low Score
    if (checkSubdomainHighScore('Identity Loss') || checkSubdomainHighScore('Purpose Void') || checkSubdomainLowScore('Self-Concept')) {
        flags.identity_loss = true;
        hasAnyFlag = true;
    }

    // 3. Result Anxiety (Domain: Academic / Subdomain: Board Stress, Confidence)
    // Board Stress High OR Confidence Low
    if (checkSubdomainHighScore('Board Stress') || checkSubdomainLowScore('Confidence')) {
        flags.result_anxiety = true;
        hasAnyFlag = true;
    }

    // 4. Future Optimism Deficit (Domain: Resilience / Subdomain: Career Diversity, Alternative Success)
    if (checkSubdomainLowScore('Career Diversity') || checkSubdomainLowScore('Alternative Success')) {
        flags.future_optimism_deficit = true;
        hasAnyFlag = true;
    }

    // 5. Life Imbalance (Domain: Identity / Subdomain: Disconnection)
    // Also Somatic High Score
    if (checkSubdomainHighScore('Disconnection') || checkDomainHighScore('Somatic')) {
        flags.life_imbalance = true;
        hasAnyFlag = true;
    }

    // 6. Social Withdrawal (Domain: Family, Support) - Low support
    if (checkDomainLowScore('Family') || checkDomainLowScore('Support')) {
        flags.social_withdrawal = true;
        hasAnyFlag = true;
    }

    // 7. Exam-Defined Identity (Domain: Resilience / Subdomain: Exam Definition)
    // "One exam does not define my life" -> Low Score means IT DOES define them.
    if (checkSubdomainLowScore('Exam Definition')) {
        flags.exam_defined_identity = true;
        hasAnyFlag = true;
    }

    // 8. Fixed Mindset (Domain: Resilience / Subdomain: Growth Mindset)
    if (checkSubdomainLowScore('Growth Mindset')) {
        flags.fixed_mindset = true;
        hasAnyFlag = true;
    }

    // Safety Check
    if (checkDomainHighScore('Safety') || checkSubdomainHighScore('Self-Harm')) {
        flags.identity_loss = true; // Safety issues often link to critical identity/worth crisis in this phase
        flags.life_imbalance = true;
        hasAnyFlag = true;
    }

    if (!hasAnyFlag) {
        flags.no_flags_baseline = true;
    }

    return flags;
};
