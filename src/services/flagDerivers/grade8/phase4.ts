
import { createResponseMap, getAnswerFromMap } from '../../assessmentUtils';
import { getNumericValueForQuestionAnswer } from '../../flagEngine';
import { MiniFlagsG8P4 } from '../types';

/**
 * Derives flags for Grade 8 Phase 4 (Exit Interview)
 * Uses domain-driven aggregation (Academic, Self, Social, Study Habits, Emotional, Family, Health, Tech, Resilience)
 */
export const deriveMiniFlagsForG8P4 = (
    questions: any[],
    responsesArray: any[]
): MiniFlagsG8P4 => {
    const flags: MiniFlagsG8P4 = {
        high_school_anxiety: false,
        low_self_confidence: false,
        negative_peer_group: false,
        poor_study_skills: false,
        emotional_dysregulation: false,
        family_conflict: false,
        tech_imbalance: false,
        poor_resilience: false,
        no_flags_baseline: false,
    };

    const responseMap = createResponseMap(responsesArray);

    let hasAnyFlag = false;

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


    // 1. High School Anxiety (Domain: Academic / Future / Hope)
    if (checkDomainLowScore('Academic') || checkDomainLowScore('Future') || checkDomainLowScore('Hope')) {
        flags.high_school_anxiety = true;
        hasAnyFlag = true;
    }

    // 2. Low Self-Confidence (Domain: Strengths / Growth)
    if (checkDomainLowScore('Strengths') || checkDomainLowScore('Growth')) {
        flags.low_self_confidence = true;
        hasAnyFlag = true;
    }

    // 3. Negative Peer Group (Domain: Social / Bullying)
    if (checkDomainLowScore('Social') || checkDomainLowScore('Bullying')) {
        flags.negative_peer_group = true;
        hasAnyFlag = true;
    }

    // 4. Poor Study Skills (Mapped to Academic Satisfaction for now as no Study Habits domain)
    if (checkDomainLowScore('Academic')) {
        flags.poor_study_skills = true;
        hasAnyFlag = true;
    }

    // 5. Emotional Dysregulation (Domain: Coping)
    if (checkDomainLowScore('Coping')) {
        flags.emotional_dysregulation = true;
        hasAnyFlag = true;
    }

    // 6. Family Conflict (No Family domain in G8 P4, but mapped to lack of Gratitude/Reflection if critical? 
    // actually, let's leave it false as there is no data to support it in this specific assessment)
    // flags.family_conflict = false; 

    // 7. Tech Imbalance (Domain: Tech)
    if (checkDomainLowScore('Tech')) {
        flags.tech_imbalance = true;
        hasAnyFlag = true;
    }

    // 8. Poor Resilience (Domain: Resilience / General / Reflection)
    if (checkDomainLowScore('Resilience') || checkDomainLowScore('General') || checkDomainLowScore('Reflection')) {
        flags.poor_resilience = true;
        hasAnyFlag = true;
    }

    // Support (Teacher Support) -> Mapped to High School Anxiety
    if (checkDomainLowScore('Support')) { // Teacher support
        flags.high_school_anxiety = true;
        hasAnyFlag = true;
    }

    if (!hasAnyFlag) {
        flags.no_flags_baseline = true;
    }

    return flags;
};
