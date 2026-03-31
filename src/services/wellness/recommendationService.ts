
export interface RecommendationTool {
    name: string;
    count: string;   // "3x daily", "Once a day"
    action: string;  // "Practice", "Listen", "Log"
    link: string;
}

export interface RecommendationProtocol {
    step: number;
    label: string;
}

export interface Recommendation {
    id: string;
    type: 'resource' | 'cognitive' | 'wellness' | 'safety' | 'support';
    title: string;
    description: string;
    link: string;
    tools?: RecommendationTool[];
    protocols?: RecommendationProtocol[];
    rationale?: string;
    domain?: string;
    subdomain?: string;
}

export interface DomainScores {
    [domain: string]: {
        score: number;
        subdomains: { [subdomain: string]: number };
    };
}

export const getRecommendations = (scores: DomainScores): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const thresholds = {
        critical: 75,
        high: 60,
        moderate: 40
    };

    const addRec = (rec: Recommendation) => {
        if (!recommendations.find(r => r.id === rec.id)) {
            recommendations.push(rec);
        }
    };

    // Flatten logic for subdomain checks
    const allSubdomains: Record<string, number> = {};
    Object.values(scores).forEach(d => {
        if (d.subdomains) {
            Object.entries(d.subdomains).forEach(([name, score]) => {
                allSubdomains[name] = Math.max(allSubdomains[name] || 0, score);
            });
        }
    });

    // --- 🚨 SAFETY (Critical Priority) ---
    const safetyScore = scores['Safety']?.score || 0;
    const bullyingScore = scores['Bullying']?.score || allSubdomains['Bullying'] || 0;

    if (safetyScore >= thresholds.moderate || bullyingScore >= thresholds.moderate) {
        addRec({
            id: 'buddysafe-emergency', type: 'safety', domain: 'Safety',
            title: 'BuddySafe Protocol',
            description: 'Your safety plan for handling difficult situations.',
            link: '/buddysafe',
            rationale: 'Physical and emotional safety is the absolute foundation for learning.',
            protocols: [
                { step: 1, label: 'Identify a safe adult' },
                { step: 2, label: 'Access reporting tools' },
                { step: 3, label: 'Review safety helplines' }
            ],
            tools: [
                { name: 'SOS Shield', count: 'Immediate', action: 'Report', link: '/buddysafe#report' },
                { name: 'Safe Network', count: 'Daily check-in', action: 'Verify', link: '/buddysafe#network' }
            ]
        });
    }

    // --- ACADEMIC / STRESS MANAGEMENT (Prescriptive) ---
    if (allSubdomains['Board Pressure'] >= thresholds.moderate || allSubdomains['Exam Stress'] >= thresholds.moderate) {
        addRec({
            id: 'stress-res', type: 'resource', domain: 'Academic', subdomain: 'Exam Stress',
            title: 'Stress Management Protocol',
            description: 'Techniques to regulate your nervous system during exams.',
            link: '/resources/stress-management',
            rationale: 'High stress blocks the prefrontal cortex, making it harder to recall what you studied.',
            protocols: [
                { step: 1, label: 'Deep breathing' },
                { step: 2, label: 'Muscle relaxation' },
                { step: 3, label: 'Focus reset' }
            ],
            tools: [
                { name: 'Box Breathing', count: '3x daily', action: 'Practice', link: '/cognitive-tasks#breathing' },
                { name: '50/10 Timer', count: 'Every study session', action: 'Use', link: '/cognitive-tasks#focus' },
                { name: 'Audio Relaxation', count: 'Before sleep', action: 'Listen', link: '/resources/audio-relaxation' }
            ]
        });
    }

    if (allSubdomains['Career Anxiety'] >= thresholds.moderate || allSubdomains['Academic Confidence'] >= thresholds.moderate) {
        addRec({
            id: 'growth-res', type: 'resource', domain: 'Academic', subdomain: 'Confidence',
            title: 'Confidence Booster',
            description: 'Building the mental stamina for career and stream selection.',
            link: '/resources/growth-mindset-motivation',
            rationale: 'Self-efficacy is the strongest predictor of long-term career satisfaction.',
            protocols: [
                { step: 1, label: 'Identity work' },
                { step: 2, label: 'Goal alignment' }
            ],
            tools: [
                { name: 'Mindset Quiz', count: 'Weekly', action: 'Test', link: '/cognitive-tasks#mindset' },
                { name: 'Strength Journal', count: 'Once a day', action: 'Log', link: '/journal' }
            ]
        });
    }

    // --- EMOTIONAL REGULATION ---
    if (allSubdomains['Anxiety'] >= thresholds.moderate || allSubdomains['Emotional Overwhelm'] >= thresholds.moderate) {
        addRec({
            id: 'anxiety-compass', type: 'cognitive', domain: 'Emotional', subdomain: 'Anxiety',
            title: 'Anxiety Compass',
            description: 'Tools to navigate through overwhelming emotions.',
            link: '/cognitive-tasks#breathing',
            rationale: 'Developing "Emotional Granularity" helps in reducing the intensity of anxiety.',
            tools: [
                { name: 'Calm Bubble', count: 'When anxious', action: 'Watch', link: '/cognitive-tasks#breathing' },
                { name: 'Anchor Point', count: '2x daily', action: 'Fixate', link: '/resources/grounding' }
            ]
        });
    }

    if (allSubdomains['Mood'] >= thresholds.moderate || allSubdomains['Depression'] >= thresholds.moderate) {
        addRec({
            id: 'mood-mission', type: 'wellness', domain: 'Emotional', subdomain: 'Mood',
            title: 'Mood Elevation Mission',
            description: 'Recognizing patterns and building positive momentum.',
            link: '/wellness/mood',
            rationale: 'Consistent tracking allows you to see that "clouds" always eventually pass.',
            tools: [
                { name: 'Color Mood Log', count: 'Morning & Evening', action: 'Log', link: '/wellness/mood' },
                { name: 'Gratitude Sparkle', count: 'Before bed', action: 'Write', link: '/journal' }
            ]
        });
    }

    // --- SOCIAL & PEERS ---
    if (allSubdomains['Peer Connection'] >= thresholds.moderate || allSubdomains['Belonging'] >= thresholds.moderate) {
        addRec({
            id: 'social-pulse', type: 'resource', domain: 'Social', subdomain: 'Belonging',
            title: 'Connection Pulse',
            description: 'Methods to strengthen your social circle safely.',
            link: '/resources/peer-support-sharing',
            rationale: 'Strong peer networks provide the "Buffer" needed to handle academic pressure.',
            tools: [
                { name: 'Empathy Roleplay', count: '3x a week', action: 'Try', link: '/cognitive-tasks#empathy' },
                { name: 'Kindness Note', count: '1x daily', action: 'Send', link: '/resources/social-skills' }
            ]
        });
    }

    // --- LIFESTYLE / SLEEP ---
    if (allSubdomains['Sleep Quality'] >= thresholds.moderate || allSubdomains['Energy Levels'] >= thresholds.moderate) {
        addRec({
            id: 'sleep-hygiene', type: 'resource', domain: 'Lifestyle', subdomain: 'Sleep',
            title: 'Sleep Hygiene Mission',
            description: 'Optimizing your recovery cycles for academic peak performance.',
            link: '/resources/sleep-relaxation',
            rationale: 'Sleep is not "down time"; it is when your brain process and stores everything you learned today.',
            tools: [
                { name: 'Digital Lock', count: '60 min before bed', action: 'Activate', link: '/resources/digital-wellness' },
                { name: 'Sleep Audio', count: 'Nightly', action: 'Listen', link: '/resources/audio' }
            ]
        });
    }

    // --- FINAL AGGREGATION & EXTENSIBILITY ---
    // Sort logic
    const priorityMap = { 'safety': 0, 'support': 1, 'cognitive': 2, 'resource': 3, 'wellness': 4 };
    const sortedRecs = recommendations.sort((a, b) => priorityMap[a.type] - priorityMap[b.type]);

    // Fallback
    if (sortedRecs.length === 0) {
        addRec({
            id: 'growth-def', type: 'resource', title: 'Daily Growth Protocol',
            description: 'Maintenance tools for your mental health.', link: '/resources/growth-mindset-motivation',
            tools: [
                { name: 'Mood Pulse', count: '2x daily', action: 'Log', link: '/wellness/mood' },
                { name: 'Mindful Minute', count: '3x daily', action: 'Practice', link: '/cognitive-tasks' }
            ]
        });
    }

    return sortedRecs.slice(0, 3);
};
