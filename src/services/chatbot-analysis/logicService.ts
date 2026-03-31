
export interface AssessmentResponse {
    questionId: string;
    answer: any;
    score: number;
}

export const evaluateRule = (rule: string, responses: AssessmentResponse[]): boolean => {
    if (!rule) return false;

    // Simple parser for conditions like "ID >= 4" or "ID == 'Option'"
    // We can expand this to handle AND/OR if needed

    const tokens = rule.split(' ');

    // Example: ["G6_P1_M1_Q3", ">=", "4"]
    if (tokens.length === 3) {
        const [id, op, val] = tokens;
        const resp = responses.find(r => r.questionId === id);
        if (!resp) return false;

        const actualVal = resp.score !== undefined ? resp.score : resp.answer;
        const targetVal = isNaN(Number(val)) ? val.replace(/'/g, '') : Number(val);

        switch (op) {
            case '>=': return actualVal >= targetVal;
            case '<=': return actualVal <= targetVal;
            case '==': return actualVal === targetVal;
            case '>': return actualVal > targetVal;
            case '<': return actualVal < targetVal;
            default: return false;
        }
    }

    // Handle complex OR logic simple split
    if (rule.includes('||')) {
        return rule.split('||').some(part => evaluateRule(part.trim(), responses));
    }

    if (rule.includes('&&')) {
        return rule.split('&&').every(part => evaluateRule(part.trim(), responses));
    }

    return false;
};

export const getPhaseEncouragement = (phase: number) => {
    const phases: Record<number, { title: string, focus: string }> = {
        1: { title: "Sowing Season", focus: "Finding your roots and settling in." },
        2: { title: "Growing Rays", focus: "Balancing your energy and shining your light." },
        3: { title: "Winter Whisper", focus: "Gathering warmth and caring for your spirit." },
        4: { title: "The Harvest", focus: "Reflecting on your beautiful journey." }
    };
    return phases[phase] || phases[1];
};

export const mapScoreToBloomState = (score: number): { state: string, description: string, color: string, icon: string } => {
    // Note: We use the inverse logic since higher score = higher risk in the current DB
    // 0-30 Risk = Flourishing
    // 31-60 Risk = Steady
    // 61+ Risk = Needs Care
    if (score <= 30) {
        return {
            state: "Brilliant Bloom",
            description: "You're showing incredible resilience and positivity. Keep nurturing your inner garden!",
            color: "#10b981", // Emerald
            icon: "sun"
        };
    } else if (score <= 60) {
        return {
            state: "Steady Growth",
            description: "You're navigating things well. A few clouds here and there, but you're growing stronger every day.",
            color: "#3b82f6", // Blue
            icon: "cloud-sun"
        };
    } else {
        return {
            state: "Needs Gentle Care",
            description: "It looks like things are a bit heavy right now. Just like a plant after a storm, you might need a little extra support and sunshine.",
            color: "#f59e0b", // Amber
            icon: "cloud-rain"
        };
    }
};

export const calculateScoresByDomain = (questions: any[], responses: AssessmentResponse[]) => {
    const scores: Record<string, { total: number, max: number, subdomains: Record<string, { total: number, max: number }> }> = {};

    responses.forEach(resp => {
        const q = questions.find(q => q.id === resp.questionId);
        if (!q) return;

        const mainDomain = q.domain || 'General';
        const subDomain = q.subdomain || 'General';
        const qMax = 4; // Standardized to 0-4 scale

        // Initialize Main Domain
        if (!scores[mainDomain]) {
            scores[mainDomain] = { total: 0, max: 0, subdomains: {} };
        }

        // Initialize Sub Domain
        if (!scores[mainDomain].subdomains[subDomain]) {
            scores[mainDomain].subdomains[subDomain] = { total: 0, max: 0 };
        }

        const score = resp.score;
        scores[mainDomain].total += score;
        scores[mainDomain].max += qMax;
        scores[mainDomain].subdomains[subDomain].total += score;
        scores[mainDomain].subdomains[subDomain].max += qMax;

        // Overall tracking
        if (!scores['overall']) {
            scores['overall'] = { total: 0, max: 0, subdomains: {} };
        }
        scores['overall'].total += score;
        scores['overall'].max += qMax;
    });

    const result: any = {};
    Object.entries(scores).forEach(([domain, data]) => {
        result[domain] = {
            score: data.max > 0 ? Math.round((data.total / data.max) * 100) : 0,
            subdomains: {}
        };

        Object.entries(data.subdomains).forEach(([sub, subData]) => {
            result[domain].subdomains[sub] = subData.max > 0
                ? Math.round((subData.total / subData.max) * 100)
                : 0;
        });
    });

    // For backward compatibility with simpler components, we also return flat overall
    result.overallScore = result.overall?.score || 0;

    return result;
};
