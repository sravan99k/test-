import { GradePhaseConfig } from "../types";

export const grade8Configs: Record<string, GradePhaseConfig> = {
    // Grade 8 Phase 1
    "g8-p1": {
        flagDeriverKey: "deriveMiniFlagsForG8P1",
        minis: [
            {
                assessmentId: "g8-p1-risk",
                fileKey: "mini-1-1",
                fromAssessmentId: "g8-p1-transition",
                when: (flags: any) => !flags.no_flags_baseline,
                projectFlags: (flags: any) => ({
                    // Generic rechecks
                    academic_recheck: flags.academic_recheck,
                    social_recheck: flags.social_recheck,
                    mood_recheck: flags.mood_recheck,
                    bullying_recheck: flags.bullying_recheck,

                    // Specific G8P1 Scenarios
                    peer_susceptibility: flags.peer_susceptibility,
                    tech_abuse: flags.tech_abuse,
                    attention_issues: flags.attention_issues,
                    social_media_risk: flags.social_media_risk,
                    neurodevelopmental: flags.neurodevelopmental,
                    // New Missing Flags
                    strengths_check: flags.strengths_check,
                    support_check: flags.support_check,
                    identity_check: flags.identity_check,
                    family_check: flags.family_check,
                    // Fixes for Mini 1.2 Unreachable Scenarios
                    general_peer_family: flags.general_peer_family,
                    academic_transition_followup: flags.academic_transition_followup,
                    social_isolation_followup: flags.social_isolation_followup,
                    mood_followup: flags.mood_followup,
                    bullying_followup: flags.bullying_followup,
                    adult_support_followup: flags.adult_support_followup,
                    peer_pressure_check: flags.peer_pressure_check,
                    family_understanding_check: flags.family_understanding_check,
                    general_stress_check: flags.general_stress_check,

                    // Granular Mappings for Mini 1.1 Scenarios
                    girls_health_followup: flags.girls_health_issue,
                    body_image_followup: flags.body_image_issue,
                    auditory_processing_followup: flags.auditory_processing_issue,
                    learning_disability_followup: flags.learning_disability_issue,
                    memory_processing_followup: flags.memory_processing_issue,
                    digital_addiction: flags.sleep_issue || flags.tech_abuse, // Mapped to digital_addiction scenario
                    identity_followup: flags.identity_check, // Mapped to identity_followup scenario

                    no_flags_baseline: flags.no_flags_baseline,
                }),
                // Chain to Mini 1.2 for all flagged students to receive general check-in
                nextMiniId: "g8-p1-peer",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    academic_recheck: flags.academic_recheck,
                    social_recheck: flags.social_recheck,
                    mood_recheck: flags.mood_recheck,
                    bullying_recheck: flags.bullying_recheck,
                    no_flags_baseline: flags.no_flags_baseline,
                    // Fixes for Mini 1.2 Unreachable Scenarios
                    general_peer_family: flags.general_peer_family,
                    academic_transition_followup: flags.academic_transition_followup,
                    social_isolation_followup: flags.social_isolation_followup,
                    mood_followup: flags.mood_followup,
                    bullying_followup: flags.bullying_followup,
                    adult_support_followup: flags.adult_support_followup,
                    peer_pressure_check: flags.peer_pressure_check,
                    family_understanding_check: flags.family_understanding_check,
                    general_stress_check: flags.general_stress_check,

                    // Granular Mappings for Mini 1.2 Scenarios
                    girls_health_followup: flags.girls_health_issue,
                    body_image_followup: flags.body_image_issue,
                    auditory_processing_followup: flags.auditory_processing_issue,
                    learning_disability_followup: flags.learning_disability_issue,
                    memory_processing_followup: flags.memory_processing_issue,
                    digital_addiction: flags.sleep_issue || flags.tech_abuse, // Mapped to digital_addiction scenario
                    identity_followup: flags.identity_check, // Mapped to identity_followup scenario


                }),
            },
            {
                assessmentId: "g8-p1-peer",
                fileKey: "mini-1-2",
                fromAssessmentId: "g8-p1-transition",
                when: (flags: any) => flags.no_flags_baseline,
                projectFlags: (flags: any) => ({
                    // For baseline students, ensure these are projected
                    general_peer_family: flags.general_peer_family,
                    strengths_check: flags.strengths_check,
                    general_stress_check: flags.general_stress_check,
                    no_flags_baseline: flags.no_flags_baseline,
                }),
            },
        ],
    },

    // Grade 8 Phase 2
    "g8-p2": {
        flagDeriverKey: "deriveMiniFlagsForG8P2",
        minis: [
            {
                // Risk recheck mini when any exam/sleep/family/self-harm risk is present
                assessmentId: "g8-p2-recovery",
                fileKey: "mini-2-1",
                fromAssessmentId: "g8-p2-preexam",
                when: (flags: any) =>
                    Boolean(
                        flags.exam_stress_recheck ||
                        flags.sleep_recheck ||
                        flags.family_pressure_recheck ||
                        flags.self_harm_followup
                    ),
                projectFlags: (flags: any) => ({
                    exam_stress_recheck: flags.exam_stress_recheck,
                    sleep_recheck: flags.sleep_recheck,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    self_harm_followup: flags.self_harm_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // New checks
                    career_clarity_check: flags.career_clarity_check,
                    strengths_check: flags.strengths_check,
                    social_check: flags.social_check,
                    general_stress_check: flags.general_stress_check,
                    academic_check: flags.academic_check,
                }),
                // For flagged students, follow with Mini 2.2 as a broader check-in
                nextMiniId: "g8-p2-energy",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    exam_stress_recheck: flags.exam_stress_recheck,
                    sleep_recheck: flags.sleep_recheck,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    self_harm_followup: flags.self_harm_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // New checks
                    career_clarity_check: flags.career_clarity_check,
                    strengths_check: flags.strengths_check,
                    social_check: flags.social_check,
                    general_stress_check: flags.general_stress_check,
                    academic_check: flags.academic_check,
                }),
            },
            {
                // Mid-year / baseline check mini when no acute risk flags from M2
                assessmentId: "g8-p2-energy",
                fileKey: "mini-2-2",
                fromAssessmentId: "g8-p2-preexam",
                when: (flags: any) =>
                    !Boolean(
                        flags.exam_stress_recheck ||
                        flags.sleep_recheck ||
                        flags.family_pressure_recheck ||
                        flags.self_harm_followup
                    ),
                projectFlags: (flags: any) => ({
                    exam_stress_recheck: flags.exam_stress_recheck,
                    sleep_recheck: flags.sleep_recheck,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    self_harm_followup: flags.self_harm_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // New checks
                    career_clarity_check: flags.career_clarity_check,
                    strengths_check: flags.strengths_check,
                    social_check: flags.social_check,
                    general_stress_check: flags.general_stress_check,
                    academic_check: flags.academic_check,
                }),
            },
        ],
    },

    // Grade 8 Phase 3
    "g8-p3": {
        flagDeriverKey: "deriveMiniFlagsForG8P3",
        minis: [
            {
                // Pre-finals risk and safety check when any P3 risk is present
                assessmentId: "g8-p3-prefinals",
                fileKey: "mini-3-1",
                fromAssessmentId: "g8-p3-relationships",
                // Mini 3.1: pre-finals risk/safety check for any student with *any* P3 risk flags
                // Use no_flags_baseline inverted so all non-baseline students get 3.1
                when: (flags: any) => !flags.no_flags_baseline,
                projectFlags: (flags: any) => ({
                    energy_motivation_recheck: flags.energy_motivation_recheck,
                    academic_engagement_recheck: flags.academic_engagement_recheck,
                    peer_connection_recheck: flags.peer_connection_recheck,
                    home_safety_recheck: flags.home_safety_recheck,
                    self_harm_recheck: flags.self_harm_recheck,
                    academic_concerns_recheck: flags.academic_concerns_recheck,
                    grade9_anxiety_recheck: flags.grade9_anxiety_recheck,
                    emotional_concerns_recheck: flags.emotional_concerns_recheck,
                    support_access_recheck: flags.support_access_recheck,
                    safety_followup: flags.safety_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // Missing Scenarios
                    bullying_followup: flags.bullying_followup,
                    emotional_check: flags.emotional_check,
                    general_stress_check: flags.general_stress_check,
                    strengths_check: flags.strengths_check,

                    energy_check: flags.energy_check,
                    motivation_check: flags.motivation_check,
                    social_check: flags.social_check,
                }),
                // For flagged students, follow with Mini 3.2 cover transition readiness.
                nextMiniId: "g8-p3-mindset",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    energy_motivation_recheck: flags.energy_motivation_recheck,
                    academic_engagement_recheck: flags.academic_engagement_recheck,
                    peer_connection_recheck: flags.peer_connection_recheck,
                    home_safety_recheck: flags.home_safety_recheck,
                    self_harm_recheck: flags.self_harm_recheck,
                    academic_concerns_recheck: flags.academic_concerns_recheck,
                    grade9_anxiety_recheck: flags.grade9_anxiety_recheck,
                    emotional_concerns_recheck: flags.emotional_concerns_recheck,
                    support_access_recheck: flags.support_access_recheck,
                    safety_followup: flags.safety_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // Missing Scenarios
                    bullying_followup: flags.bullying_followup,
                    emotional_check: flags.emotional_check,
                    general_stress_check: flags.general_stress_check,
                    strengths_check: flags.strengths_check,

                    energy_check: flags.energy_check,
                    motivation_check: flags.motivation_check,
                    social_check: flags.social_check,
                }),
            },
            {
                // Final prep and Grade 9 readiness check for students without acute P3 risks
                assessmentId: "g8-p3-mindset",
                fileKey: "mini-3-2",
                fromAssessmentId: "g8-p3-relationships",
                // Mini 3.2: final prep/readiness for pure baseline students only
                when: (flags: any) => flags.no_flags_baseline,
                projectFlags: (flags: any) => ({
                    energy_motivation_recheck: flags.energy_motivation_recheck,
                    academic_engagement_recheck: flags.academic_engagement_recheck,
                    peer_connection_recheck: flags.peer_connection_recheck,
                    home_safety_recheck: flags.home_safety_recheck,
                    self_harm_recheck: flags.self_harm_recheck,
                    academic_concerns_recheck: flags.academic_concerns_recheck,
                    grade9_anxiety_recheck: flags.grade9_anxiety_recheck,
                    emotional_concerns_recheck: flags.emotional_concerns_recheck,
                    support_access_recheck: flags.support_access_recheck,
                    no_flags_baseline: flags.no_flags_baseline,
                    // Missing Scenarios
                    bullying_followup: flags.bullying_followup,
                    emotional_check: flags.emotional_check,
                    general_stress_check: flags.general_stress_check,
                    strengths_check: flags.strengths_check,
                    student_voice_check: flags.student_voice_check,
                    energy_check: flags.energy_check,
                    motivation_check: flags.motivation_check,
                    social_check: flags.social_check,
                }),
            },
        ],
    },

    // Grade 8 Phase 4 (Exit Interview)
    "g8-p4": {
        flagDeriverKey: "deriveMiniFlagsForG8P4",
        minis: [], // Major-only assessment (Exit Interview)
    },
};
