import { GradePhaseConfig } from "../types";

export const grade9Configs: Record<string, GradePhaseConfig> = {
    // Grade 9 Phase 1
    "g9-p1": {
        flagDeriverKey: "deriveMiniFlagsForG9P1",
        minis: [
            {
                assessmentId: "g9-p1-adjustment",
                fileKey: "mini-1-1",
                fromAssessmentId: "g9-p1-baseline",
                when: (flags: any) => !flags.no_flags_baseline,
                projectFlags: (flags: any) => ({
                    academic_shock_recheck: flags.academic_shock_recheck,
                    career_anxiety_recheck: flags.career_anxiety_recheck,
                    sleep_recheck: flags.sleep_recheck,
                    mood_recheck: flags.mood_recheck,
                    // New Missing Flags
                    strengths_check: flags.strengths_check,
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    social_check: flags.social_check,
                    digital_wellbeing_check: flags.digital_wellbeing_check,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    support_check: flags.support_check,
                    // Fixes for Mini 1.2 name mismatches & missing flags
                    burnout_check: flags.burnout_check,
                    general_stress_check: flags.general_stress_check,
                    family_check: flags.family_check,
                    sleep_check: flags.sleep_check,
                    mood_check: flags.mood_check,
                    study_habit_check: flags.study_habit_check,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
                // Chain to Mini 1.1 for all flagged students to receive general check-in
                nextMiniId: "g9-p1-burnout",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    academic_shock_recheck: flags.academic_shock_recheck,
                    career_anxiety_recheck: flags.career_anxiety_recheck,
                    // New Missing Flags
                    strengths_check: flags.strengths_check,
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    social_check: flags.social_check,
                    digital_wellbeing_check: flags.digital_wellbeing_check,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    support_check: flags.support_check,
                    // Fixes for Mini 1.2 name mismatches & missing flags
                    burnout_check: flags.burnout_check,
                    general_stress_check: flags.general_stress_check,
                    family_check: flags.family_check,
                    sleep_check: flags.sleep_check,
                    mood_check: flags.mood_check,
                    study_habit_check: flags.study_habit_check,
                    mood_recheck: flags.mood_recheck,
                    sleep_recheck: flags.sleep_recheck,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
            },
            {
                assessmentId: "g9-p1-burnout",
                fileKey: "mini-1-2",
                fromAssessmentId: "g9-p1-baseline",
                when: (flags: any) => flags.no_flags_baseline,
                projectFlags: (flags: any) => ({
                    // For baseline student
                    general_stress_check: flags.general_stress_check,
                    family_check: flags.family_check,
                    sleep_check: flags.sleep_check,
                    mood_check: flags.mood_check,
                    burnout_check: flags.burnout_check,
                    strengths_check: flags.strengths_check,
                    no_flags_baseline: flags.no_flags_baseline,
                }),
            },
        ],
    },

    // Grade 9 Phase 2
    "g9-p2": {
        flagDeriverKey: "deriveMiniFlagsForG9P2",
        minis: [
            {
                // Post-result emotional recovery check
                assessmentId: "g9-p2-recovery",
                fileKey: "mini-2-1",
                fromAssessmentId: "g9-p2-midterm",
                when: (flags: any) => !flags.no_flags_baseline,
                projectFlags: (flags: any) => ({
                    exam_stress_recheck: flags.exam_stress_recheck,
                    sleep_recheck: flags.sleep_recheck,
                    mood_recheck: flags.mood_recheck,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    self_harm_followup: flags.self_harm_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // Missing Scenarios
                    post_exam_recovery: flags.post_exam_recovery,
                    self_harm_crisis: flags.self_harm_crisis,
                    exam_anxiety_followup: flags.exam_anxiety_followup,
                    sleep_study_balance: flags.sleep_study_balance,
                    self_worth_recovery: flags.self_worth_recovery,
                    somatic_symptoms_followup: flags.somatic_symptoms_followup,
                    family_pressure_followup: flags.family_pressure_followup,
                    panic_overwhelm_recovery: flags.panic_overwhelm_recovery,
                    // General checks
                    strengths_check: flags.strengths_check,
                    social_comparison_check: flags.social_comparison_check,
                    somatic_check: flags.somatic_check,
                    general_stress_check: flags.general_stress_check,
                    emotional_check: flags.emotional_check,
                    social_check: flags.social_check,
                    exam_anxiety_check: flags.exam_anxiety_check,
                }),
                nextMiniId: "g9-p2-career",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    exam_stress_recheck: flags.exam_stress_recheck,
                    sleep_recheck: flags.sleep_recheck,
                    mood_recheck: flags.mood_recheck,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    self_harm_followup: flags.self_harm_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // Missing Scenarios
                    post_exam_recovery: flags.post_exam_recovery,
                    self_harm_crisis: flags.self_harm_crisis,
                    exam_anxiety_followup: flags.exam_anxiety_followup,
                    sleep_study_balance: flags.sleep_study_balance,
                    self_worth_recovery: flags.self_worth_recovery,
                    somatic_symptoms_followup: flags.somatic_symptoms_followup,
                    family_pressure_followup: flags.family_pressure_followup,
                    panic_overwhelm_recovery: flags.panic_overwhelm_recovery,
                    // General checks
                    strengths_check: flags.strengths_check,
                    social_comparison_check: flags.social_comparison_check,
                    somatic_check: flags.somatic_check,
                    general_stress_check: flags.general_stress_check,
                    emotional_check: flags.emotional_check,
                    social_check: flags.social_check,
                    exam_anxiety_check: flags.exam_anxiety_check,
                }),
            },
            {
                // Mid-year career clarity/general check
                assessmentId: "g9-p2-career",
                fileKey: "mini-2-2",
                fromAssessmentId: "g9-p2-midterm",
                when: (flags: any) => flags.no_flags_baseline,
                projectFlags: (flags: any) => ({
                    exam_stress_recheck: flags.exam_stress_recheck,
                    sleep_recheck: flags.sleep_recheck,
                    mood_recheck: flags.mood_recheck,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    self_harm_followup: flags.self_harm_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // General checks needed for Mini 2.2
                    strengths_check: flags.strengths_check,
                    social_comparison_check: flags.social_comparison_check,
                    somatic_check: flags.somatic_check,
                    general_stress_check: flags.general_stress_check,
                    emotional_check: flags.emotional_check,
                    social_check: flags.social_check,
                    exam_anxiety_check: flags.exam_anxiety_check,
                }),
            },
        ],
    },

    // Grade 9 Phase 3
    "g9-p3": {
        flagDeriverKey: "deriveMiniFlagsForG9P3",
        minis: [
            {
                assessmentId: "g9-p3-readiness",
                fileKey: "mini-3-1",
                fromAssessmentId: "g9-p3-decision",
                // Mini 3.1: targeted readiness check for any student with *any* risk flags
                // Use no_flags_baseline inverted so all non-baseline students get 3.1
                when: (flags: any) => !flags.no_flags_baseline,
                projectFlags: (flags: any) => ({
                    // Legacy flags
                    identity_confusion_recheck: flags.identity_confusion_recheck,
                    stream_anxiety_recheck: flags.stream_anxiety_recheck,
                    home_safety_recheck: flags.home_safety_recheck,
                    self_harm_recheck: flags.self_harm_recheck,
                    stream_confidence_recheck: flags.stream_confidence_recheck,
                    board_anxiety_recheck: flags.board_anxiety_recheck,
                    emotional_readiness_recheck: flags.emotional_readiness_recheck,
                    support_access_recheck: flags.support_access_recheck,

                    // Scenario-matching flags
                    academic_check: flags.academic_check,
                    bullying_followup: flags.bullying_followup,
                    digital_wellbeing_check: flags.digital_wellbeing_check,
                    emotional_check: flags.emotional_check,
                    family_check: flags.family_check,
                    general_stress_check: flags.general_stress_check,
                    sleep_check: flags.sleep_check,
                    somatic_check: flags.somatic_check,
                    strengths_check: flags.strengths_check,
                    support_check: flags.support_check,
                    burnout_followup: flags.burnout_followup,
                    transition_check: flags.transition_check,

                    safety_followup: flags.safety_followup,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
                // After targeted Readiness mini, always follow with board prep check
                nextMiniId: "g9-p3-board",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    // Legacy flags
                    stream_confidence_recheck: flags.stream_confidence_recheck,
                    board_anxiety_recheck: flags.board_anxiety_recheck,
                    emotional_readiness_recheck: flags.emotional_readiness_recheck,
                    support_access_recheck: flags.support_access_recheck,
                    identity_confusion_recheck: flags.identity_confusion_recheck,
                    stream_anxiety_recheck: flags.stream_anxiety_recheck,
                    home_safety_recheck: flags.home_safety_recheck,
                    self_harm_recheck: flags.self_harm_recheck,

                    // Scenario-matching flags  
                    academic_check: flags.academic_check,
                    bullying_followup: flags.bullying_followup,
                    digital_wellbeing_check: flags.digital_wellbeing_check,
                    emotional_check: flags.emotional_check,
                    family_check: flags.family_check,
                    general_stress_check: flags.general_stress_check,
                    sleep_check: flags.sleep_check,
                    somatic_check: flags.somatic_check,
                    strengths_check: flags.strengths_check,
                    support_check: flags.support_check,
                    burnout_followup: flags.burnout_followup,
                    transition_check: flags.transition_check,

                    safety_followup: flags.safety_followup,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
            },
            {
                assessmentId: "g9-p3-board",
                fileKey: "mini-3-2",
                fromAssessmentId: "g9-p3-decision",
                // Mini 3.2: board prep/general check for pure baseline students only
                when: (flags: any) => flags.no_flags_baseline,
                projectFlags: (flags: any) => ({
                    // Legacy flags
                    stream_confidence_recheck: flags.stream_confidence_recheck,
                    board_anxiety_recheck: flags.board_anxiety_recheck,
                    emotional_readiness_recheck: flags.emotional_readiness_recheck,
                    support_access_recheck: flags.support_access_recheck,
                    identity_confusion_recheck: flags.identity_confusion_recheck,
                    stream_anxiety_recheck: flags.stream_anxiety_recheck,
                    home_safety_recheck: flags.home_safety_recheck,
                    self_harm_recheck: flags.self_harm_recheck,

                    // Scenario-matching flags
                    academic_check: flags.academic_check,
                    bullying_followup: flags.bullying_followup,
                    digital_wellbeing_check: flags.digital_wellbeing_check,
                    emotional_check: flags.emotional_check,
                    family_check: flags.family_check,
                    general_stress_check: flags.general_stress_check,
                    sleep_check: flags.sleep_check,
                    somatic_check: flags.somatic_check,
                    strengths_check: flags.strengths_check,
                    support_check: flags.support_check,
                    burnout_followup: flags.burnout_followup,
                    transition_check: flags.transition_check,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
            },
        ],
    },

    // Grade 9 Phase 4 (Exit Interview)
    "g9-p4": {
        flagDeriverKey: "deriveMiniFlagsForG9P4",
        minis: [], // Major-only assessment (Exit Interview)
    },
};
