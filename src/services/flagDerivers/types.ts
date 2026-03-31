/**
 * Type Definitions for Flag Derivation
 * 
 * This module contains all interface definitions for flag sets returned
 * by flag deriver functions across all grades (6-10) and phases (1-3).
 * 
 * @module flagTypes
 */


// ==========================================
// Grade 6 Phase 4 (Exit Interview) Flags
// ==========================================
export interface MiniFlagsG6P4 {
    growth_stagnation: boolean;      // Score < 3 on growth questions
    resilience_gap: boolean;         // Low resilience/support scores
    future_anxiety: boolean;         // Anxiety about Grade 7 transition
    social_stagnation: boolean;      // Social skills/friendship issues
    emotional_regulation_gap: boolean; // Poor emotional control
    self_esteem_drop: boolean;       // Reduced self-worth
    no_flags_baseline: boolean;
}

// ==========================================
// Grade 7 Phase 4 (Exit Interview) Flags
// ==========================================
export interface MiniFlagsG7P4 {
    maturity_lag: boolean;           // "I feel more grown up" - Low
    social_deficit: boolean;         // Social skills issues
    self_esteem_issues: boolean;     // "I like who I am" - Low
    transition_anxiety: boolean;     // Grade 8 readiness concerns
    resilience_deficit: boolean;     // Handling difficult situations - Low
    family_discord: boolean;         // Family relationship issues
    digital_wellness_issues: boolean; // Tech balance issues
    no_flags_baseline: boolean;
}

// ==========================================
// Grade 8 Phase 4 (Transition) Flags
// ==========================================
export interface MiniFlagsG8P4 {
    high_school_anxiety: boolean;    // Not ready for Grade 9
    low_self_confidence: boolean;    // Personal growth stagnation
    negative_peer_group: boolean;    // Social circle issues
    poor_study_skills: boolean;      // Not ready for academic load
    emotional_dysregulation: boolean;// Managing stress/emotions issues
    family_conflict: boolean;        // Family relationship issues
    tech_imbalance: boolean;         // Screen time issues
    poor_resilience: boolean;        // Bouncing back from failure issues
    no_flags_baseline: boolean;
}

// ==========================================
// Grade 9 Phase 4 (Exit Interview) Flags
// ==========================================
export interface MiniFlagsG9P4 {
    board_exam_anxiety: boolean;     // "Prepared for Grade 10" - Low
    stream_regret: boolean;          // "Happy with stream choice" - Low
    executive_dysfunction: boolean;  // Time management issues
    emotional_vulnerability: boolean;// "Mentally strong" - Low
    academic_identity_confusion: boolean; // "Discovered strengths" - Low
    social_isolation: boolean;       // Peer relationship issues
    poor_self_care: boolean;         // Physical health neglect
    future_anxiety: boolean;         // Motivation/excitement - Low
    no_flags_baseline: boolean;
}

// ==========================================
// Grade 10 Phase 4 (Post-Exam Recovery) Flags
// ==========================================
export interface MiniFlagsG10P4 {
    post_exam_emptiness: boolean;    // "Feel empty now" - High
    identity_loss: boolean;          // "Don't know who I am" - High
    result_anxiety: boolean;         // "Managing anxiety" - Low
    future_optimism_deficit: boolean;// "Excited about future" - Low
    life_imbalance: boolean;         // Reconnecting with hobbies - Low
    social_withdrawal: boolean;      // Family/Social recovery issues
    exam_defined_identity: boolean;  // "One exam defines me" - High (Reverse)
    fixed_mindset: boolean;          // "Can grow from result" - Low
    no_flags_baseline: boolean;
}

/**
 * Grade 6, Phase 1 - Initial Assessment Flags
 */
export interface MiniFlagsG6P1 {
    academic_anxiety: boolean;
    social_isolation: boolean;
    neurodevelopmental_concerns: boolean;
    trauma_exposure: boolean;
    trauma_recheck: boolean;
    neurodevelopmental_recheck: boolean;
    // Recheck flags for Mini 1.2
    academic_anxiety_recheck: boolean;
    social_isolation_recheck: boolean;
    mood_concerns_recheck: boolean;
    bullying_recheck: boolean;
    // Follow-up scenario flags
    bullying_followup: boolean;
    general_stress_check: boolean;
    mood_check: boolean;
    strengths_check: boolean;
    adult_support_followup: boolean;
    student_voice_followup: boolean;
    future_hope_check: boolean;
    adult_trust_check: boolean;
    self_regulation_check: boolean;
    self_worth_check: boolean;
    school_engagement_check: boolean;
    belonging_check: boolean;
    no_flags_baseline: boolean;
}

/**
 * Grade 6, Phase 2 - Mid-Year Assessment Flags
 */
export interface MiniFlagsG6P2 {
    exam_stress: boolean;
    self_harm: boolean;
    family_support: boolean;
    sleep_issues: boolean;
    bullying: boolean;
    no_flags_mid_year: boolean;
    // Aliases for Mini 2.1 / 2.2 Rechecks
    exam_stress_recheck: boolean;
    exam_stress_final_check: boolean;
    sleep_recheck: boolean;
    sleep_final_check: boolean;
    family_support_recheck: boolean;
    family_support_final: boolean;
    self_harm_recheck: boolean;
    self_harm_crisis_check: boolean;
    bullying_check: boolean;
    // Missing flags added for Mini 2.1 / 2.2 Rechecks
    academic_support_check: boolean;
    social_check: boolean;
    strengths_check: boolean;
    academic_check: boolean;
    // Alias flags for Mini 2.2 scenario IDs
    bullying_followup: boolean;
    exam_stress_check: boolean;
    sleep_check: boolean;
}

/**
 * Grade 6, Phase 3 - Final Assessment Flags
 */
export interface MiniFlagsG6P3 {
    bullying_follow_up: boolean;
    home_safety_follow_up: boolean;
    self_harm_crisis_check: boolean;
    motivation_burnout_check: boolean;
    energy_check: boolean;
    family_check: boolean;
    general_stress_check: boolean;
    motivation_check: boolean;
    social_check: boolean;
    strengths_check: boolean;
    safety_followup: boolean;
    no_flags_baseline: boolean;
    // Missing flags added for Mini 3.2 Final Check
    academic_concerns: boolean;
    emotional_concerns: boolean;
    support_access: boolean;
    // Alias flags matching Mini 3.2 scenario IDs
    academic_concerns_final: boolean;
    emotional_concerns_final: boolean;
    support_access_final: boolean;
    bullying_followup: boolean;
}

/**
 * Grade 7, Phase 1 - Initial Assessment Flags
 */
export interface MiniFlagsG7P1 {
    // Existing scenarios
    body_image: boolean;
    peer_pressure: boolean;
    digital_anxiety: boolean;
    disengaged: boolean;
    academic_confidence_recheck: boolean;
    belonging_recheck: boolean;
    mood_recheck: boolean;
    bullying_recheck: boolean;
    // New Scenario Flags (Mini 1.1 & 1.2)
    bullying_followup: boolean;
    general_stress_check: boolean;
    mood_check: boolean;
    somatic_check: boolean;
    strengths_check: boolean;
    support_check: boolean;
    adhd_screen_followup: boolean;
    academic_skills_followup: boolean;
    anger_coping_followup: boolean;
    cyberbullying_followup: boolean;
    emotional_literacy_followup: boolean;
    girls_health_followup: boolean;
    ld_screen_followup: boolean;
    memory_strategies_followup: boolean;
    romantic_followup: boolean;
    self_followup: boolean;
    self_harm_followup: boolean;
    social_media_risk_followup: boolean;
    social_media_safety_followup: boolean;
    substance_detail_followup: boolean;
    tech_followup: boolean;
    general_social_check: boolean;
    social_inclusion_followup: boolean;
    peer_connection_followup: boolean;
    digital_stress_followup: boolean;
    mood_loneliness_followup: boolean;
    academic_confidence_check: boolean;
    adult_support_check: boolean;
    family_check: boolean;
    no_flags_baseline: boolean;
}

/**
 * Grade 7, Phase 2 - Mid-Year Assessment Flags
 */
export interface MiniFlagsG7P2 {
    exam_stress_recheck: boolean;
    sleep_check: boolean;
    family_pressure_recheck: boolean;
    self_harm_followup: boolean;
    bullying_recheck: boolean;
    emotional_overwhelm_recheck: boolean;
    academic_support_check: boolean;
    general_stress_check: boolean;
    social_check: boolean;
    strengths_check: boolean;
    no_flags_mid_year: boolean;
    // Alias flags for Mini 2.1 / 2.2 scenario IDs
    exam_stress_check: boolean;
    exam_stress_persistent: boolean;
    self_harm_monitoring: boolean;
    bullying_persistent: boolean;
    bullying_followup: boolean;
    emotional_overwhelm_persistent: boolean;
    family_pressure_persistent: boolean;
    family_pressure_check: boolean;
}

/**
 * Grade 7, Phase 3 - Final Assessment Flags
 */
export interface MiniFlagsG7P3 {
    energy_fatigue_check: boolean;
    motivation_check: boolean;
    coping_check: boolean;
    digital_wellbeing_check: boolean;
    family_support_check: boolean;
    bullying_check: boolean;
    self_harm_check: boolean;
    academic_check: boolean;
    social_check: boolean;
    strengths_check: boolean;
    student_voice_check: boolean;
    home_safety_check: boolean;
    no_flags_baseline: boolean;
    // Added for "Always" triggers in Mini 3.1 and 3.2
    exam_prep_check: boolean;
    general_readiness_check: boolean;
    // Alias for Mini 3.2 scenario ID
    general_readiness: boolean;
}

/**
 * Grade 7, Phase 4 - Exit Interview Flags (Major-only, no minis)
 */
export interface MiniFlagsG7P4 {
    maturity_lag: boolean;
    social_deficit: boolean;
    self_esteem_issues: boolean;
    transition_anxiety: boolean;
    resilience_deficit: boolean;
    family_discord: boolean;
    digital_wellness_issues: boolean;
    no_flags_baseline: boolean;
}

/**
 * Grade 8, Phase 1 - Initial Assessment Flags
 */
export interface MiniFlagsG8P1 {
    // Generic rechecks
    academic_recheck: boolean;
    social_recheck: boolean;
    mood_recheck: boolean;
    bullying_recheck: boolean;
    no_flags_baseline: boolean;
    // Specific G8P1 Scenarios
    peer_susceptibility: boolean;
    tech_abuse: boolean;
    attention_issues: boolean;
    social_media_risk: boolean;
    neurodevelopmental: boolean;
    // New Missing Flags
    strengths_check: boolean;
    support_check: boolean;
    identity_check: boolean;
    family_check: boolean;
    // New Missing Flags (Granular)
    girls_health_issue: boolean;
    body_image_issue: boolean;
    auditory_processing_issue: boolean;
    learning_disability_issue: boolean;
    memory_processing_issue: boolean;
    sleep_issue: boolean;
    physical_health_issue: boolean;
    substance_detail_issue: boolean;
    // Fixes for Mini 1.2 Unreachable Scenarios
    general_peer_family: boolean;
    academic_transition_followup: boolean;
    social_isolation_followup: boolean;
    mood_followup: boolean;
    bullying_followup: boolean;
    adult_support_followup: boolean;
    peer_pressure_check: boolean;
    family_understanding_check: boolean;
    general_stress_check: boolean;
}

/**
 * Grade 8, Phase 2 - Mid-Year Assessment Flags
 */
export interface MiniFlagsG8P2 {
    exam_stress_recheck: boolean;
    sleep_recheck: boolean;
    family_pressure_recheck: boolean;
    self_harm_followup: boolean;
    no_flags_baseline: boolean;
    // Missing Scenarios from Gap Report
    career_clarity_check: boolean;
    strengths_check: boolean;
    social_check: boolean;
    general_stress_check: boolean;
    academic_check: boolean;
}

/**
 * Grade 8, Phase 3 - Final Assessment Flags
 */
export interface MiniFlagsG8P3 {
    energy_motivation_recheck: boolean;
    academic_engagement_recheck: boolean;
    peer_connection_recheck: boolean;
    home_safety_recheck: boolean;
    self_harm_recheck: boolean;
    academic_concerns_recheck: boolean;
    grade9_anxiety_recheck: boolean;
    emotional_concerns_recheck: boolean;
    support_access_recheck: boolean;
    safety_followup: boolean;
    no_flags_baseline: boolean;
    // Missing Scenarios from Gap Report
    bullying_followup: boolean;
    emotional_check: boolean;
    general_stress_check: boolean;
    strengths_check: boolean;
    student_voice_check: boolean;
    energy_check: boolean;
    motivation_check: boolean;
    social_check: boolean;
}

/**
 * Grade 9, Phase 1 - Initial Assessment Flags
 */
export interface MiniFlagsG9P1 {
    academic_shock_recheck: boolean;
    career_anxiety_recheck: boolean;
    sleep_recheck: boolean;
    mood_recheck: boolean;
    strengths_check: boolean;
    academic_confidence_recheck: boolean;
    social_check: boolean;
    digital_wellbeing_check: boolean;
    family_pressure_recheck: boolean;
    support_check: boolean;
    // Missing flags added to match Mini Assessment scenarios
    burnout_check: boolean;
    general_stress_check: boolean;
    family_check: boolean; // Alias for family_pressure_recheck
    sleep_check: boolean; // Alias for sleep_recheck
    mood_check: boolean;
    study_habit_check: boolean;
    no_flags_baseline: boolean;
}

/**
 * Grade 9, Phase 2 - Mid-Year Assessment Flags
 */
export interface MiniFlagsG9P2 {
    exam_stress_recheck: boolean;
    sleep_recheck: boolean;
    mood_recheck: boolean;
    family_pressure_recheck: boolean;
    self_harm_followup: boolean;
    strengths_check: boolean;
    social_comparison_check: boolean;
    somatic_check: boolean;
    // Missing flags added for Mini 2.1 / 2.2 compatibility
    general_stress_check: boolean;
    emotional_check: boolean;
    social_check: boolean;
    exam_anxiety_check: boolean;
    // Aliases for Mini 2.1 Scenarios
    self_harm_crisis: boolean;
    exam_anxiety_followup: boolean;
    sleep_study_balance: boolean;
    self_worth_recovery: boolean;
    somatic_symptoms_followup: boolean;
    family_pressure_followup: boolean;
    panic_overwhelm_recovery: boolean;
    post_exam_recovery: boolean;
    no_flags_baseline: boolean;
}

/**
 * Grade 9, Phase 3 - Final Assessment Flags
 */
export interface MiniFlagsG9P3 {
    // Legacy flags (for backward compatibility with data-driven logic)
    identity_confusion_recheck: boolean;
    stream_anxiety_recheck: boolean;
    home_safety_recheck: boolean;
    self_harm_recheck: boolean;
    stream_confidence_recheck: boolean;
    board_anxiety_recheck: boolean;
    emotional_readiness_recheck: boolean;
    support_access_recheck: boolean;
    // Scenario IDs that match mini-3-1.json
    academic_check: boolean;
    bullying_followup: boolean;
    digital_wellbeing_check: boolean;
    emotional_check: boolean;
    family_check: boolean;
    general_stress_check: boolean;
    sleep_check: boolean;
    somatic_check: boolean;
    strengths_check: boolean;
    support_check: boolean;
    burnout_followup: boolean;
    safety_followup: boolean;
    transition_check: boolean;
    no_flags_baseline: boolean;
}

/**
 * Grade 10, Phase 1 - Initial Assessment Flags
 */
export interface MiniFlagsG10P1 {
    board_shock_recheck: boolean;
    career_worry_recheck: boolean;
    time_balance_recheck: boolean;
    sleep_recheck: boolean;
    mood_recheck: boolean;
    no_flags_baseline: boolean;
    strengths_check: boolean;
    academic_confidence_recheck: boolean;
    family_pressure_recheck: boolean;
    support_check: boolean;
    // NEW - Added for recently implemented scenarios
    social_isolation_check: boolean;
    health_neglect_check: boolean;
    mid_term_anxiety_check: boolean;
    // Missing flags / Aliases for Mini 1.1 & 1.2
    mood_check: boolean;
    general_stress_check: boolean;
    family_check: boolean;
    family_support_check: boolean;
    digital_wellbeing_check: boolean;
    sleep_check: boolean;
    time_management_recheck: boolean;
    time_management_followup: boolean;
}

/**
 * Grade 10, Phase 2 - Mid-Year Assessment Flags
 */
export interface MiniFlagsG10P2 {
    academic_confidence_recheck: boolean;
    time_balance_recheck: boolean;
    sleep_recheck: boolean;
    family_pressure_recheck: boolean;
    self_harm_followup: boolean;
    // Missing Flags for Mini 2.1 & 2.2
    burnout_check: boolean;
    social_withdrawal_check: boolean;
    health_neglect_check: boolean;
    exam_stress_recheck: boolean;
    self_harm_crisis_recheck: boolean;
    emotional_breakdown_recheck: boolean;
    exam_anxiety_check: boolean;
    general_stress_check: boolean;
    social_check: boolean;
    somatic_check: boolean;
    strengths_check: boolean;
    support_check: boolean;
    pre_board_panic_check: boolean;
    motivation_loss_check: boolean;
    emotional_check: boolean;
    no_flags_baseline: boolean;
}

/**
 * Grade 10, Phase 3 - Final Assessment Flags
 */
export interface MiniFlagsG10P3 {
    physical_health_recheck: boolean;
    academic_confidence_recheck: boolean;
    exam_anxiety_recheck: boolean;
    coping_skills_recheck: boolean;
    family_support_recheck: boolean;
    self_harm_recheck: boolean;
    support_access_recheck: boolean;
    safety_followup: boolean;
    // Missing Flags for Mini 3.1 & 3.2
    hall_ticket_check: boolean;
    last_minute_panic_check: boolean;
    exam_day_logistics: boolean;
    post_exam_crash_check: boolean;
    no_flags_baseline: boolean;
}
