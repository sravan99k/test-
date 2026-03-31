import { GradePhaseConfig } from "../types";

export const grade6Configs: Record<string, GradePhaseConfig> = {
    // Grade 6 Phase 1
    "g6-p1": {
        flagDeriverKey: "deriveMiniFlagsForG6P1",
        minis: [
            {
                // Mini 1.1: Primary follow-up scenarios
                assessmentId: "g6-p1-adjustment",
                fileKey: "mini-1-1",
                fromAssessmentId: "g6-p1-baseline",
                when: (flags: any) =>
                    Boolean(
                        flags.academic_anxiety ||
                        flags.social_isolation ||
                        flags.trauma_exposure ||
                        flags.neurodevelopmental_concerns ||
                        flags.bullying_followup ||
                        flags.mood_check ||
                        flags.general_stress_check ||
                        flags.strengths_check ||
                        flags.adult_support_followup ||
                        flags.student_voice_followup ||
                        flags.future_hope_check ||
                        flags.adult_trust_check ||
                        flags.self_regulation_check ||
                        flags.self_worth_check ||
                        flags.school_engagement_check ||
                        flags.belonging_check
                    ),
                projectFlags: (flags: any) => ({
                    // Primary flags
                    academic_anxiety: flags.academic_anxiety,
                    social_isolation: flags.social_isolation,
                    neurodevelopmental_concerns: flags.neurodevelopmental_concerns,
                    neurodevelopmental_recheck: flags.neurodevelopmental_recheck,
                    trauma_exposure: flags.trauma_exposure,
                    trauma_recheck: flags.trauma_recheck,

                    // Recheck flags
                    academic_anxiety_recheck: flags.academic_anxiety_recheck,
                    social_isolation_recheck: flags.social_isolation_recheck,
                    mood_concerns_recheck: flags.mood_concerns_recheck,
                    bullying_recheck: flags.bullying_recheck,

                    // Follow-up scenario flags
                    bullying_followup: flags.bullying_followup,
                    mood_check: flags.mood_check,
                    general_stress_check: flags.general_stress_check,
                    strengths_check: flags.strengths_check,
                    adult_support_followup: flags.adult_support_followup,
                    student_voice_followup: flags.student_voice_followup,
                    future_hope_check: flags.future_hope_check,
                    adult_trust_check: flags.adult_trust_check,
                    self_regulation_check: flags.self_regulation_check,
                    self_worth_check: flags.self_worth_check,
                    school_engagement_check: flags.school_engagement_check,
                    belonging_check: flags.belonging_check,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
                nextMiniId: "g6-p1-settling",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    // Primary flags
                    academic_anxiety: flags.academic_anxiety,
                    social_isolation: flags.social_isolation,
                    neurodevelopmental_concerns: flags.neurodevelopmental_concerns,
                    neurodevelopmental_recheck: flags.neurodevelopmental_recheck,
                    trauma_exposure: flags.trauma_exposure,
                    trauma_recheck: flags.trauma_recheck,

                    // Recheck flags
                    academic_anxiety_recheck: flags.academic_anxiety_recheck,
                    social_isolation_recheck: flags.social_isolation_recheck,
                    mood_concerns_recheck: flags.mood_concerns_recheck,
                    bullying_recheck: flags.bullying_recheck,

                    // Follow-up scenario flags
                    bullying_followup: flags.bullying_followup,
                    mood_check: flags.mood_check,
                    general_stress_check: flags.general_stress_check,
                    strengths_check: flags.strengths_check,
                    adult_support_followup: flags.adult_support_followup,
                    student_voice_followup: flags.student_voice_followup,
                    future_hope_check: flags.future_hope_check,
                    adult_trust_check: flags.adult_trust_check,
                    self_regulation_check: flags.self_regulation_check,
                    self_worth_check: flags.self_worth_check,
                    school_engagement_check: flags.school_engagement_check,
                    belonging_check: flags.belonging_check,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
            },
            {
                // Mini 1.2: Recheck scenarios or baseline
                assessmentId: "g6-p1-settling",
                fileKey: "mini-1-2",
                fromAssessmentId: "g6-p1-baseline",
                when: (flags: any) =>
                    Boolean(flags.no_flags_baseline),
                projectFlags: (flags: any) => ({
                    // Primary flags
                    academic_anxiety: flags.academic_anxiety,
                    social_isolation: flags.social_isolation,
                    neurodevelopmental_concerns: flags.neurodevelopmental_concerns,
                    neurodevelopmental_recheck: flags.neurodevelopmental_recheck,
                    trauma_exposure: flags.trauma_exposure,
                    trauma_recheck: flags.trauma_recheck,

                    // Recheck flags  
                    academic_anxiety_recheck: flags.academic_anxiety_recheck,
                    social_isolation_recheck: flags.social_isolation_recheck,
                    mood_concerns_recheck: flags.mood_concerns_recheck,
                    bullying_recheck: flags.bullying_recheck,

                    // Follow-up scenario flags
                    bullying_followup: flags.bullying_followup,
                    mood_check: flags.mood_check,
                    general_stress_check: flags.general_stress_check,
                    strengths_check: flags.strengths_check,
                    adult_support_followup: flags.adult_support_followup,
                    student_voice_followup: flags.student_voice_followup,
                    future_hope_check: flags.future_hope_check,
                    adult_trust_check: flags.adult_trust_check,
                    self_regulation_check: flags.self_regulation_check,
                    self_worth_check: flags.self_worth_check,
                    school_engagement_check: flags.school_engagement_check,
                    belonging_check: flags.belonging_check,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
            },
        ],
    },

    // Grade 6 Phase 2
    "g6-p2": {
        flagDeriverKey: "deriveMiniFlagsForG6P2",
        minis: [
            {
                // Mini 2.1: Post-exam stress/crisis followup
                assessmentId: "g6-p2-postexam",
                fileKey: "mini-2-1",
                fromAssessmentId: "g6-p2-preexam",
                when: (flags: any) =>
                    Boolean(
                        flags.exam_stress ||
                        flags.self_harm ||
                        flags.family_support ||
                        flags.sleep_issues ||
                        flags.bullying
                    ),
                projectFlags: (flags: any) => ({
                    exam_stress: flags.exam_stress,
                    self_harm: flags.self_harm,
                    family_support: flags.family_support,
                    sleep_issues: flags.sleep_issues,
                    bullying: flags.bullying,
                    no_flags_mid_year: flags.no_flags_mid_year,
                    exam_stress_recheck: flags.exam_stress_recheck,
                    exam_stress_final_check: flags.exam_stress_final_check,
                    sleep_recheck: flags.sleep_recheck,
                    sleep_final_check: flags.sleep_final_check,
                    family_support_recheck: flags.family_support_recheck,
                    family_support_final: flags.family_support_final,
                    self_harm_recheck: flags.self_harm_recheck,
                    self_harm_crisis_check: flags.self_harm_crisis_check,
                    bullying_check: flags.bullying_check,
                    // Mini 2.1 / 2.2 scenario flags
                    academic_support_check: flags.academic_support_check,
                    social_check: flags.social_check,
                    strengths_check: flags.strengths_check,
                    academic_check: flags.academic_check,
                    bullying_followup: flags.bullying_followup,
                    exam_stress_check: flags.exam_stress_check,
                    sleep_check: flags.sleep_check,
                }),
                nextMiniId: "g6-p2-midyear",
                nextMiniCondition: () => true, // Always follow with Mini 2.2
                nextMiniProjectFlags: (flags: any) => ({
                    exam_stress: flags.exam_stress,
                    self_harm: flags.self_harm,
                    family_support: flags.family_support,
                    sleep_issues: flags.sleep_issues,
                    bullying: flags.bullying,
                    no_flags_mid_year: flags.no_flags_mid_year,
                    exam_stress_recheck: flags.exam_stress_recheck,
                    exam_stress_final_check: flags.exam_stress_final_check,
                    sleep_recheck: flags.sleep_recheck,
                    sleep_final_check: flags.sleep_final_check,
                    family_support_recheck: flags.family_support_recheck,
                    family_support_final: flags.family_support_final,
                    self_harm_recheck: flags.self_harm_recheck,
                    self_harm_crisis_check: flags.self_harm_crisis_check,
                    bullying_check: flags.bullying_check,
                    // Mini 2.2 scenario flags
                    academic_support_check: flags.academic_support_check,
                    social_check: flags.social_check,
                    strengths_check: flags.strengths_check,
                    academic_check: flags.academic_check,
                    bullying_followup: flags.bullying_followup,
                    exam_stress_check: flags.exam_stress_check,
                    sleep_check: flags.sleep_check,
                }),
            },
            {
                // Mini 2.2: Mid-year check-in (for those without Mini 2.1 triggers)
                assessmentId: "g6-p2-midyear",
                fileKey: "mini-2-2",
                fromAssessmentId: "g6-p2-preexam",
                when: (flags: any) =>
                    Boolean(
                        flags.no_flags_mid_year &&
                        !flags.exam_stress &&
                        !flags.self_harm &&
                        !flags.family_support &&
                        !flags.sleep_issues &&
                        !flags.bullying
                    ),
                projectFlags: (flags: any) => ({
                    exam_stress: flags.exam_stress,
                    self_harm: flags.self_harm,
                    family_support: flags.family_support,
                    sleep_issues: flags.sleep_issues,
                    bullying: flags.bullying,
                    no_flags_mid_year: flags.no_flags_mid_year,
                    exam_stress_recheck: flags.exam_stress_recheck,
                    exam_stress_final_check: flags.exam_stress_final_check,
                    sleep_recheck: flags.sleep_recheck,
                    sleep_final_check: flags.sleep_final_check,
                    family_support_recheck: flags.family_support_recheck,
                    family_support_final: flags.family_support_final,
                    self_harm_recheck: flags.self_harm_recheck,
                    self_harm_crisis_check: flags.self_harm_crisis_check,
                    bullying_check: flags.bullying_check,
                    // Mini 2.2 scenario flags
                    academic_support_check: flags.academic_support_check,
                    social_check: flags.social_check,
                    strengths_check: flags.strengths_check,
                    academic_check: flags.academic_check,
                    bullying_followup: flags.bullying_followup,
                    exam_stress_check: flags.exam_stress_check,
                    sleep_check: flags.sleep_check,
                }),
            },
        ],
    },

    // Grade 6 Phase 3
    "g6-p3": {
        flagDeriverKey: "deriveMiniFlagsForG6P3",
        minis: [
            {
                assessmentId: "g6-p3-midwinter",
                fileKey: "mini-3-1",
                fromAssessmentId: "g6-p3-burnout",
                when: (flags: any) =>
                    Boolean(
                        !flags.no_flags_baseline ||
                        flags.bullying_follow_up ||
                        flags.home_safety_follow_up ||
                        flags.self_harm_crisis_check ||
                        flags.motivation_burnout_check ||
                        flags.energy_check ||
                        flags.family_check ||
                        flags.general_stress_check ||
                        flags.motivation_check ||
                        flags.social_check ||
                        flags.strengths_check
                    ),
                projectFlags: (flags: any) => ({
                    bullying_follow_up: flags.bullying_follow_up,
                    home_safety_follow_up: flags.home_safety_follow_up,
                    self_harm_crisis_check: flags.self_harm_crisis_check,
                    motivation_burnout_check: flags.motivation_burnout_check,
                    energy_check: flags.energy_check,
                    family_check: flags.family_check,
                    general_stress_check: flags.general_stress_check,
                    motivation_check: flags.motivation_check,
                    social_check: flags.social_check,
                    strengths_check: flags.strengths_check,
                    safety_followup: flags.safety_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // Mini 3.2 alias flags
                    academic_concerns_final: flags.academic_concerns_final,
                    emotional_concerns_final: flags.emotional_concerns_final,
                    support_access_final: flags.support_access_final,
                    bullying_followup: flags.bullying_followup,
                }),

                nextMiniId: "g6-p3-final",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    bullying_follow_up: flags.bullying_follow_up,
                    home_safety_follow_up: flags.home_safety_follow_up,
                    self_harm_crisis_check: flags.self_harm_crisis_check,
                    motivation_burnout_check: flags.motivation_burnout_check,
                    energy_check: flags.energy_check,
                    family_check: flags.family_check,
                    general_stress_check: flags.general_stress_check,
                    motivation_check: flags.motivation_check,
                    social_check: flags.social_check,
                    strengths_check: flags.strengths_check,
                    safety_followup: flags.safety_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // Mini 3.2 alias flags
                    academic_concerns_final: flags.academic_concerns_final,
                    emotional_concerns_final: flags.emotional_concerns_final,
                    support_access_final: flags.support_access_final,
                    bullying_followup: flags.bullying_followup,
                }),
            },
            {
                assessmentId: "g6-p3-final",
                fileKey: "mini-3-2",
                fromAssessmentId: "g6-p3-burnout",
                when: (flags: any) => flags.no_flags_baseline,
            },
        ],
    },

    // Grade 6 Phase 4 (Exit Interview)
    "g6-p4": {
        flagDeriverKey: "deriveMiniFlagsForG6P4",
        minis: [], // Major-only assessment (Exit Interview)
    },
};
