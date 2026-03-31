import { GradePhaseConfig } from "../types";

export const grade10Configs: Record<string, GradePhaseConfig> = {
    // Grade 10 Phase 1
    "g10-p1": {
        flagDeriverKey: "deriveMiniFlagsForG10P1",
        minis: [
            {
                assessmentId: "g10-p1-progress",
                fileKey: "mini-1-1",
                fromAssessmentId: "g10-p1-foundation",
                when: (flags: any) => !flags.no_flags_baseline,
                projectFlags: (flags: any) => ({
                    board_shock_recheck: flags.board_shock_recheck,
                    career_worry_recheck: flags.career_worry_recheck,
                    time_balance_recheck: flags.time_balance_recheck,
                    sleep_recheck: flags.sleep_recheck,
                    mood_recheck: flags.mood_recheck,
                    // New Missing Flags
                    strengths_check: flags.strengths_check,
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    support_check: flags.support_check,
                    social_isolation_check: flags.social_isolation_check,
                    health_neglect_check: flags.health_neglect_check,
                    mid_term_anxiety_check: flags.mid_term_anxiety_check,
                    mood_check: flags.mood_check,
                    general_stress_check: flags.general_stress_check,
                    family_check: flags.family_check,
                    family_support_check: flags.family_support_check,
                    digital_wellbeing_check: flags.digital_wellbeing_check,
                    sleep_check: flags.sleep_check,
                    time_management_recheck: flags.time_management_recheck,
                    time_management_followup: flags.time_management_followup,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
                // Chain to Mini 1.1 for all flagged students to receive general check-in
                nextMiniId: "g10-p1-health",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    board_shock_recheck: flags.board_shock_recheck,
                    career_worry_recheck: flags.career_worry_recheck,
                    time_balance_recheck: flags.time_balance_recheck,
                    // New Missing Flags
                    strengths_check: flags.strengths_check,
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    support_check: flags.support_check,
                    social_isolation_check: flags.social_isolation_check,
                    health_neglect_check: flags.health_neglect_check,
                    mid_term_anxiety_check: flags.mid_term_anxiety_check,
                    mood_check: flags.mood_check,
                    general_stress_check: flags.general_stress_check,
                    family_check: flags.family_check,
                    family_support_check: flags.family_support_check,
                    digital_wellbeing_check: flags.digital_wellbeing_check,
                    sleep_check: flags.sleep_check,
                    time_management_recheck: flags.time_management_recheck,
                    time_management_followup: flags.time_management_followup,
                    sleep_recheck: flags.sleep_recheck,
                    mood_recheck: flags.mood_recheck,

                    no_flags_baseline: flags.no_flags_baseline,
                }),
            },
            {
                assessmentId: "g10-p1-health",
                fileKey: "mini-1-2",
                fromAssessmentId: "g10-p1-foundation",
                when: (flags: any) => flags.no_flags_baseline,
                projectFlags: (flags: any) => ({
                    // For baseline student (or chained flow)
                    general_stress_check: flags.general_stress_check,
                    family_check: flags.family_check,
                    sleep_check: flags.sleep_check,
                    mood_check: flags.mood_check,
                    strengths_check: flags.strengths_check,
                    no_flags_baseline: flags.no_flags_baseline,
                }),
            },
        ],
    },

    // Grade 10 Phase 2
    "g10-p2": {
        flagDeriverKey: "deriveMiniFlagsForG10P2",
        minis: [
            {
                // Primary recovery mini for students with flags
                assessmentId: "g10-p2-recovery",
                fileKey: "mini-2-1",
                fromAssessmentId: "g10-p2-peak",
                when: (flags: any) =>
                    Boolean(
                        flags.academic_confidence_recheck ||
                        flags.time_balance_recheck ||
                        flags.sleep_recheck ||
                        flags.family_pressure_recheck ||
                        flags.self_harm_followup ||
                        // Acute flags
                        flags.burnout_check ||
                        flags.self_harm_crisis_recheck ||
                        flags.emotional_breakdown_recheck ||
                        flags.exam_stress_recheck
                    ),
                projectFlags: (flags: any) => ({
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    time_balance_recheck: flags.time_balance_recheck,
                    sleep_recheck: flags.sleep_recheck,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    self_harm_followup: flags.self_harm_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // New Flags
                    burnout_check: flags.burnout_check,
                    social_withdrawal_check: flags.social_withdrawal_check,
                    health_neglect_check: flags.health_neglect_check,
                    exam_stress_recheck: flags.exam_stress_recheck,
                    self_harm_crisis_recheck: flags.self_harm_crisis_recheck,
                    emotional_breakdown_recheck: flags.emotional_breakdown_recheck,
                    exam_anxiety_check: flags.exam_anxiety_check,
                    general_stress_check: flags.general_stress_check,
                    social_check: flags.social_check,
                    somatic_check: flags.somatic_check,
                    strengths_check: flags.strengths_check,
                    support_check: flags.support_check,
                    pre_board_panic_check: flags.pre_board_panic_check,
                    motivation_loss_check: flags.motivation_loss_check,
                    emotional_check: flags.emotional_check,
                }),
                nextMiniId: "g10-p2-preboard",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    time_balance_recheck: flags.time_balance_recheck,
                    sleep_recheck: flags.sleep_recheck,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    self_harm_followup: flags.self_harm_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // New Flags
                    burnout_check: flags.burnout_check,
                    social_withdrawal_check: flags.social_withdrawal_check,
                    health_neglect_check: flags.health_neglect_check,
                    exam_stress_recheck: flags.exam_stress_recheck,
                    self_harm_crisis_recheck: flags.self_harm_crisis_recheck,
                    emotional_breakdown_recheck: flags.emotional_breakdown_recheck,
                    exam_anxiety_check: flags.exam_anxiety_check,
                    general_stress_check: flags.general_stress_check,
                    social_check: flags.social_check,
                    somatic_check: flags.somatic_check,
                    strengths_check: flags.strengths_check,
                    support_check: flags.support_check,
                    pre_board_panic_check: flags.pre_board_panic_check,
                    motivation_loss_check: flags.motivation_loss_check,
                    emotional_check: flags.emotional_check,
                }),
            },
            {
                // General pre-board check for students without acute flags
                assessmentId: "g10-p2-preboard",
                fileKey: "mini-2-2",
                fromAssessmentId: "g10-p2-peak",
                when: (flags: any) =>
                    !Boolean(
                        flags.academic_confidence_recheck ||
                        flags.time_balance_recheck ||
                        flags.sleep_recheck ||
                        flags.family_pressure_recheck ||
                        flags.self_harm_followup ||
                        // Acute flags
                        flags.burnout_check ||
                        flags.self_harm_crisis_recheck ||
                        flags.emotional_breakdown_recheck ||
                        flags.exam_stress_recheck
                    ),
                projectFlags: (flags: any) => ({
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    time_balance_recheck: flags.time_balance_recheck,
                    sleep_recheck: flags.sleep_recheck,
                    family_pressure_recheck: flags.family_pressure_recheck,
                    self_harm_followup: flags.self_harm_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // New Flags
                    burnout_check: flags.burnout_check,
                    social_withdrawal_check: flags.social_withdrawal_check,
                    health_neglect_check: flags.health_neglect_check,
                    exam_stress_recheck: flags.exam_stress_recheck,
                    self_harm_crisis_recheck: flags.self_harm_crisis_recheck,
                    emotional_breakdown_recheck: flags.emotional_breakdown_recheck,
                    exam_anxiety_check: flags.exam_anxiety_check,
                    general_stress_check: flags.general_stress_check,
                    social_check: flags.social_check,
                    somatic_check: flags.somatic_check,
                    strengths_check: flags.strengths_check,
                    support_check: flags.support_check,
                    pre_board_panic_check: flags.pre_board_panic_check,
                    motivation_loss_check: flags.motivation_loss_check,
                    emotional_check: flags.emotional_check,
                }),
            },
        ],
    },

    // Grade 10 Phase 3
    "g10-p3": {
        flagDeriverKey: "deriveMiniFlagsForG10P3",
        minis: [
            {
                assessmentId: "g10-p3-final",
                fileKey: "mini-3-1",
                fromAssessmentId: "g10-p3-crisis",
                when: (flags: any) =>
                    Boolean(
                        flags.physical_health_recheck ||
                        flags.academic_confidence_recheck ||
                        flags.coping_skills_recheck ||
                        flags.family_support_recheck ||
                        flags.self_harm_recheck ||
                        // Acute flags
                        flags.post_exam_crash_check ||
                        flags.last_minute_panic_check
                    ),
                projectFlags: (flags: any) => ({
                    physical_health_recheck: flags.physical_health_recheck,
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    coping_skills_recheck: flags.coping_skills_recheck,
                    family_support_recheck: flags.family_support_recheck,
                    self_harm_recheck: flags.self_harm_recheck,
                    support_access_recheck: flags.support_access_recheck,
                    safety_followup: flags.safety_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // New Flags
                    hall_ticket_check: flags.hall_ticket_check,
                    last_minute_panic_check: flags.last_minute_panic_check,
                    exam_day_logistics: flags.exam_day_logistics,
                    post_exam_crash_check: flags.post_exam_crash_check,
                }),
                // After high-risk Mini 3.1, always schedule Mini 3.2 cover mindset
                nextMiniId: "g10-p3-mindset",
                nextMiniCondition: () => true,
                nextMiniProjectFlags: (flags: any) => ({
                    physical_health_recheck: flags.physical_health_recheck,
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    coping_skills_recheck: flags.coping_skills_recheck,
                    family_support_recheck: flags.family_support_recheck,
                    self_harm_recheck: flags.self_harm_recheck,
                    support_access_recheck: flags.support_access_recheck,
                    safety_followup: flags.safety_followup,
                    no_flags_baseline: flags.no_flags_baseline,
                    // New Flags - Passed forward
                    hall_ticket_check: flags.hall_ticket_check,
                    last_minute_panic_check: flags.last_minute_panic_check,
                    exam_day_logistics: flags.exam_day_logistics,
                    post_exam_crash_check: flags.post_exam_crash_check,
                }),
            },
            {
                assessmentId: "g10-p3-mindset",
                fileKey: "mini-3-2",
                fromAssessmentId: "g10-p3-crisis",
                when: (flags: any) =>
                    !Boolean(
                        flags.physical_health_recheck ||
                        flags.academic_confidence_recheck ||
                        flags.coping_skills_recheck ||
                        flags.family_support_recheck ||
                        flags.self_harm_recheck ||
                        // Acute flags
                        flags.post_exam_crash_check ||
                        flags.last_minute_panic_check
                    ),
                projectFlags: (flags: any) => ({
                    physical_health_recheck: flags.physical_health_recheck,
                    academic_confidence_recheck: flags.academic_confidence_recheck,
                    coping_skills_recheck: flags.coping_skills_recheck,
                    family_support_recheck: flags.family_support_recheck,
                    self_harm_recheck: flags.self_harm_recheck,
                    support_access_recheck: flags.support_access_recheck,
                    no_flags_baseline: flags.no_flags_baseline,
                    // New Flags
                    hall_ticket_check: flags.hall_ticket_check,
                    last_minute_panic_check: flags.last_minute_panic_check,
                    exam_day_logistics: flags.exam_day_logistics,
                    post_exam_crash_check: flags.post_exam_crash_check,
                }),
            },
        ],
    },

    // Grade 10 Phase 4 (Post-Exam Recovery)
    "g10-p4": {
        flagDeriverKey: "deriveMiniFlagsForG10P4",
        minis: [], // Major-only assessment (Post-Exam Recovery)
    },
};
