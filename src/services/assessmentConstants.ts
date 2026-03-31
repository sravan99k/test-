
// --- Data Constants ---
export const GRADES = ['6', '7', '8', '9', '10'];

export const ASSESSMENT_JOURNEY_DATA: Record<number, any> = {
    6: {
        name: "Grade 6: The Transition",
        description: "Focus on middle school adjustment and foundational wellbeing.",
        phases: [
            {
                name: "Phase 1: Transition", period: "June - August", color: "blue",
                assessments: [
                    { id: "g6-p1-baseline", name: "Transition Baseline", type: "Major", details: { description: "Initial adjustment check and baseline mental health screening.", when: "Week 1-2 of Term 1.", domains: ["Adjustment", "Peer Connection", "Anxiety"] } },
                    { id: "g6-p1-adjustment", name: "Adjustment Check", type: "Mini", details: { description: "Brief follow-up on early school settling.", when: "3 weeks after baseline.", domains: ["School Environment", "Mood"] } },
                    { id: "g6-p1-settling", name: "Settling In Check", type: "Mini", details: { description: "Deeper look at social integration and routine.", when: "Mid-Term 1.", domains: ["Social Belonging", "Academic Routine"] } }
                ]
            },
            {
                name: "Phase 2: Performance", period: "Sept - Nov", color: "emerald",
                assessments: [
                    { id: "g6-p2-preexam", name: "Pre-Exam Stress", type: "Major", details: { description: "Monitoring academic pressure before half-yearly tests.", when: "2 weeks before exams.", domains: ["Test Anxiety", "Coping Skills"] } },
                    { id: "g6-p2-postexam", name: "Post-Exam Recovery", type: "Mini", details: { description: "Emotional state and resilience after high pressure.", when: "Immediately post-exams.", domains: ["Resilience", "Self-Esteem"] } },
                    { id: "g6-p2-midyear", name: "Mid-Year Review", type: "Mini", details: { description: "Overall engagement at the academic halfway mark.", when: "End of Term 2.", domains: ["Motivation", "Engagement"] } }
                ]
            },
            {
                name: "Phase 3: Social Risk", period: "Jan - Feb", color: "purple",
                assessments: [
                    { id: "g6-p3-burnout", name: "Burnout & Bullying", type: "Major", details: { description: "Deeper probe into social dynamics and fatigue.", when: "Return from winter break.", domains: ["Social Risk", "Bullying Awareness", "Fatigue"] } },
                    { id: "g6-p3-midwinter", name: "Mid-Winter Pulse", type: "Mini", details: { description: "Brief connectivity and mood check.", when: "Late January.", domains: ["Social Support", "Regulation"] } },
                    { id: "g6-p3-final", name: "Final Prep Check", type: "Mini", details: { description: "Readiness for the year-end transition.", when: "Late February.", domains: ["Transition Anxiety", "Focus"] } }
                ]
            },
            {
                name: "Phase 4: Reflection", period: "March", color: "amber",
                assessments: [
                    { id: "g6-p4-reflection", name: "Exit Interview", type: "Major", details: { description: "Comprehensive growth measurement and summer needs.", when: "Last 2 weeks of year.", domains: ["Growth", "Well-being", "Support"] } }
                ]
            }
        ]
    },
    7: {
        name: "Grade 7: Identity",
        description: "Navigating puberty, identity, and complex peer groups.",
        phases: [
            {
                name: "Phase 1: Identity", period: "June - August", color: "blue",
                assessments: [
                    { id: "g7-p1-identity", name: "Identity Baseline", type: "Major", details: { description: "Tracks shifts in self-perception and peer identity.", when: "Term 1 start.", domains: ["Self-Identity", "Validation Needs"] } },
                    { id: "g7-p1-social", name: "Social Dynamics", type: "Mini", details: { description: "Digital anxiety and body image check.", when: "Early August.", domains: ["Body Image", "Digital Wellness"] } },
                    { id: "g7-p1-circle", name: "Social Circle Check", type: "Mini", details: { description: "In-depth social hierarchy analysis.", when: "Late August.", domains: ["Inclusion", "Belonging"] } }
                ]
            },
            {
                name: "Phase 2: Academic", period: "Sept - Nov", color: "emerald",
                assessments: [
                    { id: "g7-p2-preexam", name: "Pre-Exam Pressure", type: "Major", details: { description: "Monitors stress as curriculum complexity increases.", when: "Term 2 middle.", domains: ["Processing Speed", "Stress Response"] } },
                    { id: "g7-p2-result", name: "Result Handling", type: "Mini", details: { description: "Impact of academic feedback on self-worth.", when: "Post-results.", domains: ["Self-Efficacy", "Resilience"] } },
                    { id: "g7-p2-energy", name: "Energy Check", type: "Mini", details: { description: "Mid-year fatigue and motivation pulse.", when: "Late November.", domains: ["Vitality", "Mood"] } }
                ]
            },
            {
                name: "Phase 3: Peers", period: "Jan - Feb", color: "purple",
                assessments: [
                    { id: "g7-p3-peer", name: "Relationship Pulse", type: "Major", details: { description: "Deeper exploration of peer influence and risk.", when: "Term 3 start.", domains: ["Peer Pressure", "Risk Awareness"] } },
                    { id: "g7-p3-exam", name: "Exam Mode Check", type: "Mini", details: { description: "Prep-time anxiety and sleep hygiene.", when: "Early February.", domains: ["Sleep", "Coping"] } },
                    { id: "g7-p3-final", name: "Year-End Readiness", type: "Mini", details: { description: "Transition readiness for Grade 8.", when: "Late February.", domains: ["Confidence", "Future Anxiety"] } }
                ]
            },
            {
                name: "Phase 4: Review", period: "March", color: "amber",
                assessments: [
                    { id: "g7-p4-exit", name: "Exit Interview", type: "Major", details: { description: "Summarizes social and personal growth.", when: "Year end.", domains: ["Growth Mindset", "Persistence"] } }
                ]
            }
        ]
    },
    8: {
        name: "Grade 8: High School Prep",
        description: "Focus on social standing and early academic streams.",
        phases: [
            {
                name: "Phase 1: Transition", period: "June - August", color: "blue",
                assessments: [
                    { id: "g8-p1-transition", name: "Independence Baseline", type: "Major", details: { description: "Measures autonomy and social confidence.", when: "Year Start.", domains: ["Independence", "Resolution"] } },
                    { id: "g8-p1-risk", name: "Risk Screening", type: "Mini", details: { description: "Peer susceptibility and tech use check.", when: "Late July.", domains: ["Tech Use", "Impulsivity"] } },
                    { id: "g8-p1-peer", name: "Social Hierarchy", type: "Mini", details: { description: "Brief peer dynamics follow-up.", when: "Late August.", domains: ["Status", "Friendship"] } }
                ]
            },
            {
                name: "Phase 2: Academic", period: "Sept - Nov", color: "emerald",
                assessments: [
                    { id: "g8-p2-preexam", name: "Academic Competence", type: "Major", details: { description: "Monitoring perceived mastery and test stress.", when: "Mid-year.", domains: ["Self-Worth", "Mastery"] } },
                    { id: "g8-p2-recovery", name: "Recovery Check", type: "Mini", details: { description: "Post-exam burnout monitoring.", when: "Term 2 end.", domains: ["Burnout", "Recovery"] } },
                    { id: "g8-p2-energy", name: "Energy & Mood", type: "Mini", details: { description: "Mid-year mood pulse.", when: "Late November.", domains: ["Energy", "Balance"] } }
                ]
            },
            {
                name: "Phase 3: Relationships", period: "Jan - Feb", color: "purple",
                assessments: [
                    { id: "g8-p3-relationships", name: "Future Readiness", type: "Major", details: { description: "Transition anxiety regarding Grade 9.", when: "Term 3.", domains: ["Future Planning", "Anxiety"] } },
                    { id: "g8-p3-prefinals", name: "Pre-Finals Risk", type: "Mini", details: { description: "Safety and stress check before finals.", when: "Early Feb.", domains: ["Safety", "Coping"] } },
                    { id: "g8-p3-mindset", name: "Grade 9 Mindset", type: "Mini", details: { description: "Readiness for high school rigor.", when: "Late Feb.", domains: ["Readiness", "Commitment"] } }
                ]
            },
            {
                name: "Phase 4: Exit", period: "March", color: "amber",
                assessments: [
                    { id: "g8-p4-exit", name: "Exit Interview", type: "Major", details: { description: "Final year reflection and goal setting.", when: "Year End.", domains: ["Achievement", "Goals"] } }
                ]
            }
        ]
    },
    9: {
        name: "Grade 9: High School Reality",
        description: "Intensive academics and early stream selection monitoring.",
        phases: [
            {
                name: "Phase 1: Reality Check", period: "June - August", color: "blue",
                assessments: [
                    { id: "g9-p1-baseline", name: "High School Baseline", type: "Major", details: { description: "Rigor readiness and academic shock check.", when: "Week 2.", domains: ["Deep Learning", "Efficiency"] } },
                    { id: "g9-p1-adjustment", name: "Pace Adjustment", type: "Mini", details: { description: "Early burnout and adjustment check.", when: "Late July.", domains: ["Pace", "Load"] } },
                    { id: "g9-p1-burnout", name: "Burnout Monitor", type: "Mini", details: { description: "Brief focus on vitality and time use.", when: "Late August.", domains: ["Vitality", "Time Use"] } }
                ]
            },
            {
                name: "Phase 2: Endurance", period: "Sept - Nov", color: "emerald",
                assessments: [
                    { id: "g9-p2-midterm", name: "Mid-Term Momentum", type: "Major", details: { description: "Long-term stress and endurance monitor.", when: "Mid-year.", domains: ["Endurance", "Purpose"] } },
                    { id: "g9-p2-recovery", name: "Self-Harm Screen", type: "Mini", details: { description: "Critical safety follow-up after midterm stress.", when: "Post-results.", domains: ["Safety", "Support"] } },
                    { id: "g9-p2-career", name: "Early Career Pulse", type: "Mini", details: { description: "Interest and stream curiosity pulse.", when: "Late Nov.", domains: ["Interests", "Clarity"] } }
                ]
            },
            {
                name: "Phase 3: Decision", period: "Jan - Feb", color: "purple",
                assessments: [
                    { id: "g9-p3-decision", name: "Stream Selection", type: "Major", details: { description: "In-depth guide for future stream choices.", when: "Term 3 start.", domains: ["Decisiveness", "Aptitude"] } },
                    { id: "g9-p3-readiness", name: "Career Readiness", type: "Mini", details: { description: "Brief stream confidence check.", when: "Mid Feb.", domains: ["Confidence", "Commitment"] } },
                    { id: "g9-p3-final", name: "Year-End Prep", type: "Mini", details: { description: "Final exam anxiety management.", when: "Late Feb.", domains: ["Anxiety", "Control"] } }
                ]
            },
            {
                name: "Phase 4: Reflection", period: "March", color: "amber",
                assessments: [
                    { id: "g9-p4-exit", name: "Exit Interview", type: "Major", details: { description: "Reflect on year one of high school.", when: "Year End.", domains: ["Achievement", "Balance"] } }
                ]
            }
        ]
    },
    10: {
        name: "Grade 10: The Board Year",
        description: "High-stakes environment with focus on grit and career mapping.",
        phases: [
            {
                name: "Phase 1: Foundation", period: "June - August", color: "blue",
                assessments: [
                    { id: "g10-p1-foundation", name: "Board Baseline", type: "Major", details: { description: "Resilience and goal-targeting set.", when: "Week 1.", domains: ["Resilience", "Goals"] } },
                    { id: "g10-p1-progress", name: "Pressure Check", type: "Mini", details: { description: "Early board pressure and workload check.", when: "Late July.", domains: ["Pressure", "Support"] } },
                    { id: "g10-p1-health", name: "Health & sleep", type: "Mini", details: { description: "Brief sleep and physical burnout pulse.", when: "Late August.", domains: ["Sleep", "Grit"] } }
                ]
            },
            {
                name: "Phase 2: Momentum", period: "Sept - Nov", color: "emerald",
                assessments: [
                    { id: "g10-p2-momentum", name: "Stamina Monitor", type: "Major", details: { description: "Monitoring grit as exams approach.", when: "Mid-year.", domains: ["Stamina", "Endurance"] } },
                    { id: "g10-p2-prep", name: "Mock Prep Pulse", type: "Mini", details: { description: "Brief anxiety check before pre-boards.", when: "Late Oct.", domains: ["Confidence", "Coping"] } },
                    { id: "g10-p2-career", name: "Career Mapping", type: "Mini", details: { description: "Post-board path clarity check.", when: "Late Nov.", domains: ["Clarity", "Pathways"] } }
                ]
            },
            {
                name: "Phase 3: Focus", period: "Jan - Feb", color: "purple",
                assessments: [
                    { id: "g10-p3-focus", name: "Peak Stress Check", type: "Major", details: { description: "Critical health check during peak prep.", when: "Term 3.", domains: ["Clarity", "Stability"] } },
                    { id: "g10-p3-grit", name: "Winter Persistence", type: "Mini", details: { description: "Focus on staying motivated during revision.", when: "Mid Feb.", domains: ["Focus", "Grit"] } },
                    { id: "g10-p3-sprint", name: "Final Sprint", type: "Mini", details: { description: "Last pulse before final board exams.", when: "Late Feb.", domains: ["Calm", "Readiness"] } }
                ]
            },
            {
                name: "Phase 4: Finale", period: "March", color: "amber",
                assessments: [
                    { id: "g10-p4-finale", name: "Exit Interview", type: "Major", details: { description: "Final look at well-being before specialization.", when: "Final.", domains: ["Satisfaction", "Readiness"] } }
                ]
            }
        ]
    }
};

/**
 * Returns the assessment ID for the Major assessment of a given grade and phase.
 */
export const getMajorAssessmentId = (grade: number, phase: number): string | null => {
    const gradeData = ASSESSMENT_JOURNEY_DATA[grade];
    if (!gradeData) return null;

    // Phases are 0-indexed in the array, but phase is passed as 1-based usually.
    // However, looking at the data, the 'phases' array seems to map to Phase 1, 2, 3, 4 sequentially.
    // So phase 1 -> index 0
    const phaseIndex = phase - 1;
    const phaseData = gradeData.phases[phaseIndex];
    if (!phaseData) return null;

    const major = phaseData.assessments.find((a: any) => a.type === 'Major');
    return major ? major.id : null;
};
