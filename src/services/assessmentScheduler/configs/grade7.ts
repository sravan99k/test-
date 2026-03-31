import { GradePhaseConfig } from "../types";

export const grade7Configs: Record<string, GradePhaseConfig> = {
    // Grade 7 Phase 1
    "g7-p1": {
        flagDeriverKey: "deriveMiniFlagsForG7P1",
        minis: [
            {
                assessmentId: "g7-p1-social",
                fileKey: "mini-1-1",
                fromAssessmentId: "g7-p1-identity",
                // Mini 1.1: Body image, peer pressure, digital anxiety, etc.
                when: (flags: any) =>
                    Boolean(
                        flags.body_image ||
                        flags.peer_pressure ||
                        flags.digital_anxiety ||
                        flags.disengaged ||
                        flags.bullying_followup ||
                        flags.general_stress_check ||
                        flags.mood_check ||
                        flags.somatic_check ||
                        flags.strengths_check ||
                        flags.support_check ||
                        flags.adhd_screen_followup ||
                        flags.academic_skills_followup ||
                        flags.anger_coping_followup ||
                        flags.girls_health_followup ||
                        flags.ld_screen_followup ||
                        flags.memory_strategies_followup ||
                        flags.romantic_followup ||
                        flags.self_followup ||
                        flags.self_harm_followup ||
                        flags.substance_detail_followup ||
                        flags.tech_followup
                    ),
                projectFlags: (flags: any) => ({
                    // Existing scenarios (mini 1.1)
                    body_image: flags.body_image,
                    peer_pressure: flags.peer_pressure,
                    digital_anxiety: flags.digital_anxiety,
                    disengaged: flags.disengaged,

                    // Recheck flags
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    belonging_recheck: flags.belonging_recheck,
                    mood_recheck: flags.mood_recheck,
                    bullying_recheck: flags.bullying_recheck,

                    // New Scenario Flags (Mini 1.1 & 1.2)
                    bullying_followup: flags.bullying_followup,
                    general_stress_check: flags.general_stress_check,
                    mood_check: flags.mood_check,
                    somatic_check: flags.somatic_check,
                    strengths_check: flags.strengths_check,
                    support_check: flags.support_check,
                    adhd_screen_followup: flags.adhd_screen_followup,
                    academic_skills_followup: flags.academic_skills_followup,
                    anger_coping_followup: flags.anger_coping_followup,
                    cyberbullying_followup: flags.cyberbullying_followup,
                    emotional_literacy_followup: flags.emotional_literacy_followup,
                    girls_health_followup: flags.girls_health_followup,
                    ld_screen_followup: flags.ld_screen_followup,
                    memory_strategies_followup: flags.memory_strategies_followup,
                    romantic_followup: flags.romantic_followup,
                    self_followup: flags.self_followup,
                    self_harm_followup: flags.self_harm_followup,
                    social_media_risk_followup: flags.social_media_risk_followup,
                    social_media_safety_followup: flags.social_media_safety_followup,
                    substance_detail_followup: flags.substance_detail_followup,
                    tech_followup: flags.tech_followup,
                    general_social_check: flags.general_social_check,
                    social_inclusion_followup: flags.social_inclusion_followup,
                    peer_connection_followup: flags.peer_connection_followup,
                    digital_stress_followup: flags.digital_stress_followup,
                    mood_loneliness_followup: flags.mood_loneliness_followup,
                    academic_confidence_check: flags.academic_confidence_check,
                    adult_support_check: flags.adult_support_check,
                    family_check: flags.family_check,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
                nextMiniId: "g7-p1-circle",
                nextMiniCondition: (flags: any) =>
                    Boolean(
                        flags.academic_confidence_recheck ||
                        flags.belonging_recheck ||
                        flags.mood_recheck ||
                        flags.bullying_recheck ||
                        flags.no_flags_baseline ||
                        flags.social_inclusion_followup ||
                        flags.peer_connection_followup ||
                        flags.cyberbullying_followup ||
                        flags.digital_stress_followup ||
                        flags.mood_loneliness_followup ||
                        flags.academic_confidence_check ||
                        flags.adult_support_check ||
                        flags.family_check ||
                        flags.emotional_literacy_followup ||
                        flags.social_media_risk_followup ||
                        flags.social_media_safety_followup
                    ),
                nextMiniProjectFlags: (flags: any) => ({
                    // Existing scenarios
                    body_image: flags.body_image,
                    peer_pressure: flags.peer_pressure,
                    digital_anxiety: flags.digital_anxiety,
                    disengaged: flags.disengaged,
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    belonging_recheck: flags.belonging_recheck,
                    mood_recheck: flags.mood_recheck,
                    bullying_recheck: flags.bullying_recheck,

                    // New Scenario Flags
                    bullying_followup: flags.bullying_followup,
                    general_stress_check: flags.general_stress_check,
                    mood_check: flags.mood_check,
                    somatic_check: flags.somatic_check,
                    strengths_check: flags.strengths_check,
                    support_check: flags.support_check,
                    adhd_screen_followup: flags.adhd_screen_followup,
                    academic_skills_followup: flags.academic_skills_followup,
                    anger_coping_followup: flags.anger_coping_followup,
                    cyberbullying_followup: flags.cyberbullying_followup,
                    emotional_literacy_followup: flags.emotional_literacy_followup,
                    girls_health_followup: flags.girls_health_followup,
                    ld_screen_followup: flags.ld_screen_followup,
                    memory_strategies_followup: flags.memory_strategies_followup,
                    romantic_followup: flags.romantic_followup,
                    self_followup: flags.self_followup,
                    self_harm_followup: flags.self_harm_followup,
                    social_media_risk_followup: flags.social_media_risk_followup,
                    social_media_safety_followup: flags.social_media_safety_followup,
                    substance_detail_followup: flags.substance_detail_followup,
                    tech_followup: flags.tech_followup,
                    general_social_check: flags.general_social_check,
                    social_inclusion_followup: flags.social_inclusion_followup,
                    peer_connection_followup: flags.peer_connection_followup,
                    digital_stress_followup: flags.digital_stress_followup,
                    mood_loneliness_followup: flags.mood_loneliness_followup,
                    academic_confidence_check: flags.academic_confidence_check,
                    adult_support_check: flags.adult_support_check,
                    family_check: flags.family_check,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
            },
            {
                // Mini 1.2: Social circle, academic confidence, family, etc.
                assessmentId: "g7-p1-circle",
                fileKey: "mini-1-2",
                fromAssessmentId: "g7-p1-identity",
                when: (flags: any) =>
                    Boolean(!flags.body_image /* simplified negation of M1.1 if needed, but handled by flow */ &&
                        (flags.academic_confidence_recheck ||
                            flags.belonging_recheck ||
                            flags.mood_recheck ||
                            flags.bullying_recheck ||
                            flags.no_flags_baseline ||
                            flags.social_inclusion_followup ||
                            flags.peer_connection_followup ||
                            flags.cyberbullying_followup ||
                            flags.digital_stress_followup ||
                            flags.mood_loneliness_followup ||
                            flags.academic_confidence_check ||
                            flags.adult_support_check ||
                            flags.family_check ||
                            flags.emotional_literacy_followup ||
                            flags.social_media_risk_followup ||
                            flags.social_media_safety_followup)
                    ),
                projectFlags: (flags: any) => ({
                    // Existing scenarios
                    body_image: flags.body_image,
                    peer_pressure: flags.peer_pressure,
                    digital_anxiety: flags.digital_anxiety,
                    disengaged: flags.disengaged,
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    belonging_recheck: flags.belonging_recheck,
                    mood_recheck: flags.mood_recheck,
                    bullying_recheck: flags.bullying_recheck,

                    // New Scenario Flags
                    bullying_followup: flags.bullying_followup,
                    general_stress_check: flags.general_stress_check,
                    mood_check: flags.mood_check,
                    somatic_check: flags.somatic_check,
                    strengths_check: flags.strengths_check,
                    support_check: flags.support_check,
                    adhd_screen_followup: flags.adhd_screen_followup,
                    academic_skills_followup: flags.academic_skills_followup,
                    anger_coping_followup: flags.anger_coping_followup,
                    cyberbullying_followup: flags.cyberbullying_followup,
                    emotional_literacy_followup: flags.emotional_literacy_followup,
                    girls_health_followup: flags.girls_health_followup,
                    ld_screen_followup: flags.ld_screen_followup,
                    memory_strategies_followup: flags.memory_strategies_followup,
                    romantic_followup: flags.romantic_followup,
                    self_followup: flags.self_followup,
                    self_harm_followup: flags.self_harm_followup,
                    social_media_risk_followup: flags.social_media_risk_followup,
                    social_media_safety_followup: flags.social_media_safety_followup,
                    substance_detail_followup: flags.substance_detail_followup,
                    tech_followup: flags.tech_followup,
                    general_social_check: flags.general_social_check,
                    social_inclusion_followup: flags.social_inclusion_followup,
                    peer_connection_followup: flags.peer_connection_followup,
                    digital_stress_followup: flags.digital_stress_followup,
                    mood_loneliness_followup: flags.mood_loneliness_followup,
                    academic_confidence_check: flags.academic_confidence_check,
                    adult_support_check: flags.adult_support_check,
                    family_check: flags.family_check,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
            },
        ],
    },

    // Grade 7 Phase 2
    "g7-p2": {
        flagDeriverKey: "deriveMiniFlagsForG7P2",
        minis: [
            {
                assessmentId: "g7-p2-result",
                fileKey: "mini-2-1",
                fromAssessmentId: "g7-p2-preexam",
                when: (flags: any) =>
                    Boolean(
                        flags.exam_stress_recheck ||
                        flags.sleep_check ||
                        flags.family_pressure_recheck ||
                        flags.self_harm_followup ||
                        flags.bullying_recheck ||
                        flags.emotional_overwhelm_recheck ||
                        flags.academic_support_check ||
                        flags.general_stress_check ||
                        flags.social_check ||
                        flags.strengths_check
                    ),
                projectFlags: (flags: any) => ({
                    exam_stress_recheck: flags.exam_stress_recheck,
                    sleep_check: flags.sleep_check,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    self_harm_followup: flags.self_harm_followup,
                    bullying_recheck: flags.bullying_recheck,
                    emotional_overwhelm_recheck: flags.emotional_overwhelm_recheck,
                    academic_support_check: flags.academic_support_check,
                    general_stress_check: flags.general_stress_check,
                    social_check: flags.social_check,
                    strengths_check: flags.strengths_check,
                    no_flags_mid_year: flags.no_flags_mid_year,
                    // Alias flags for Mini 2.1 / 2.2 scenario IDs
                    exam_stress_check: flags.exam_stress_check,
                    exam_stress_persistent: flags.exam_stress_persistent,
                    self_harm_monitoring: flags.self_harm_monitoring,
                    bullying_persistent: flags.bullying_persistent,
                    bullying_followup: flags.bullying_followup,
                    emotional_overwhelm_persistent: flags.emotional_overwhelm_persistent,
                    family_pressure_persistent: flags.family_pressure_persistent,
                    family_pressure_check: flags.family_pressure_check,
                }),
                nextMiniId: "g7-p2-energy",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    exam_stress_recheck: flags.exam_stress_recheck,
                    exam_stress_check: flags.exam_stress_check,
                    sleep_check: flags.sleep_check,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    family_pressure_check: flags.family_pressure_check,
                    self_harm_followup: flags.self_harm_followup,
                    bullying_recheck: flags.bullying_recheck,
                    bullying_followup: flags.bullying_followup,
                    emotional_overwhelm_recheck: flags.emotional_overwhelm_recheck,
                    academic_support_check: flags.academic_support_check,
                    general_stress_check: flags.general_stress_check,
                    social_check: flags.social_check,
                    strengths_check: flags.strengths_check,
                    no_flags_mid_year: flags.no_flags_mid_year,
                    // Persistent scenario flags for Mini 2.2
                    exam_stress_persistent: flags.exam_stress_persistent,
                    self_harm_monitoring: flags.self_harm_monitoring,
                    bullying_persistent: flags.bullying_persistent,
                    emotional_overwhelm_persistent: flags.emotional_overwhelm_persistent,
                    family_pressure_persistent: flags.family_pressure_persistent,
                }),
            },
            {
                assessmentId: "g7-p2-energy",
                fileKey: "mini-2-2",
                fromAssessmentId: "g7-p2-preexam",
                when: (flags: any) =>
                    !Boolean(
                        flags.exam_stress_check ||
                        flags.sleep_check ||
                        flags.family_pressure_check ||
                        flags.self_harm_followup ||
                        flags.bullying_followup ||
                        flags.emotional_overwhelm_recheck ||
                        flags.academic_support_check ||
                        flags.general_stress_check ||
                        flags.social_check ||
                        flags.strengths_check
                    ),
                projectFlags: (flags: any) => ({
                    exam_stress_recheck: flags.exam_stress_recheck,
                    exam_stress_check: flags.exam_stress_check,
                    sleep_check: flags.sleep_check,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    family_pressure_check: flags.family_pressure_check,
                    self_harm_followup: flags.self_harm_followup,
                    bullying_recheck: flags.bullying_recheck,
                    bullying_followup: flags.bullying_followup,
                    emotional_overwhelm_recheck: flags.emotional_overwhelm_recheck,
                    academic_support_check: flags.academic_support_check,
                    general_stress_check: flags.general_stress_check,
                    social_check: flags.social_check,
                    strengths_check: flags.strengths_check,
                    no_flags_mid_year: flags.no_flags_mid_year,
                    // Persistent scenario flags for Mini 2.2
                    exam_stress_persistent: flags.exam_stress_persistent,
                    self_harm_monitoring: flags.self_harm_monitoring,
                    bullying_persistent: flags.bullying_persistent,
                    emotional_overwhelm_persistent: flags.emotional_overwhelm_persistent,
                    family_pressure_persistent: flags.family_pressure_persistent,
                }),
            },
        ],
    },

    // Grade 7 Phase 3
    "g7-p3": {
        flagDeriverKey: "deriveMiniFlagsForG7P3",
        minis: [
            {
                assessmentId: "g7-p3-exam",
                fileKey: "mini-3-1",
                fromAssessmentId: "g7-p3-peer",
                when: (flags: any) =>
                    Boolean(
                        flags.energy_fatigue_check ||
                        flags.motivation_check ||
                        flags.coping_check ||
                        flags.digital_wellbeing_check ||
                        flags.family_support_check ||
                        flags.bullying_check ||
                        flags.self_harm_check ||
                        flags.academic_check ||
                        flags.social_check ||
                        flags.strengths_check ||
                        flags.student_voice_check ||
                        flags.home_safety_check ||
                        flags.exam_prep_check
                    ),
                projectFlags: (flags: any) => ({
                    energy_fatigue_check: flags.energy_fatigue_check,
                    motivation_check: flags.motivation_check,
                    coping_check: flags.coping_check,
                    digital_wellbeing_check: flags.digital_wellbeing_check,
                    family_support_check: flags.family_support_check,
                    bullying_check: flags.bullying_check,
                    self_harm_check: flags.self_harm_check,
                    academic_check: flags.academic_check,
                    social_check: flags.social_check,
                    strengths_check: flags.strengths_check,
                    student_voice_check: flags.student_voice_check,
                    home_safety_check: flags.home_safety_check,
                    no_flags_baseline: flags.no_flags_baseline,
                    exam_prep_check: flags.exam_prep_check,
                    // Mini 3.2 alias flags
                    general_readiness: flags.general_readiness,
                    general_readiness_check: flags.general_readiness_check,
                }),
                nextMiniId: "g7-p3-final",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    energy_fatigue_check: flags.energy_fatigue_check,
                    motivation_check: flags.motivation_check,
                    coping_check: flags.coping_check,
                    digital_wellbeing_check: flags.digital_wellbeing_check,
                    family_support_check: flags.family_support_check,
                    bullying_check: flags.bullying_check,
                    self_harm_check: flags.self_harm_check,
                    academic_check: flags.academic_check,
                    social_check: flags.social_check,
                    strengths_check: flags.strengths_check,
                    student_voice_check: flags.student_voice_check,
                    home_safety_check: flags.home_safety_check,
                    no_flags_baseline: flags.no_flags_baseline,
                    // Mini 3.2 alias flags
                    general_readiness: flags.general_readiness,
                    general_readiness_check: flags.general_readiness_check,
                }),
            },
            {
                assessmentId: "g7-p3-final",
                fileKey: "mini-3-2",
                fromAssessmentId: "g7-p3-peer",
                when: (flags: any) =>
                    !Boolean(
                        flags.energy_fatigue_check ||
                        flags.motivation_check ||
                        flags.coping_check ||
                        flags.digital_wellbeing_check ||
                        flags.family_support_check ||
                        flags.bullying_check ||
                        flags.self_harm_check ||
                        flags.academic_check ||
                        flags.social_check ||
                        flags.student_voice_check ||
                        flags.home_safety_check ||
                        flags.general_readiness_check
                    ),
                projectFlags: (flags: any) => ({
                    // General Readiness (Always)
                    general_readiness_check: flags.general_readiness_check,

                    // Mapped Flags to Mini 3.2 Scenarios
                    energy_fatigue_followup: flags.energy_fatigue_check,
                    coping_struggle_followup: flags.coping_check,
                    bullying_recheck: flags.bullying_check,
                    self_harm_followup: flags.self_harm_check,
                    home_safety_followup: flags.home_safety_check,

                    // Direct Pass-through (if schema matches or for safety)
                    motivation_check: flags.motivation_check,
                    digital_wellbeing_check: flags.digital_wellbeing_check,
                    family_support_check: flags.family_support_check,
                    academic_check: flags.academic_check,
                    social_check: flags.social_check,
                    strengths_check: flags.strengths_check,
                    student_voice_check: flags.student_voice_check,
                }),
            },
        ],
    },

    // Grade 7 Phase 4 (Exit Interview)
    "g7-p4": {
        flagDeriverKey: "deriveMiniFlagsForG7P4",
        minis: [], // Major-only assessment (Exit Interview)
    },
};
