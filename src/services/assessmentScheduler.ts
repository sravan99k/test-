import { scheduleMiniForUser } from "@/services/miniAssessmentService";
import { loadEnabledAssessments } from "@/services/assessmentManagementService";

type FlagDeriver = (questions: any[], responses: any[]) => any;

type MiniConfig = {
  assessmentId: string;
  fileKey: string;
  fromAssessmentId: string;
  when: (flags: any) => boolean;
  projectFlags?: (flags: any) => Record<string, boolean> | undefined;
  nextMiniId?: string;
  nextMiniCondition?: (flags: any) => boolean;
  nextMiniProjectFlags?: (flags: any) => Record<string, boolean> | undefined;
};

type GradePhaseConfig = {
  flagDeriverKey: string;
  minis: MiniConfig[];
};

// Central config describing mini scheduling rules per grade & phase.
// This currently encodes existing Grade 6 & 7 logic, but the engine
// is fully generic and can be extended to other grades by adding entries.
const FLOW_CONFIG: Record<string, GradePhaseConfig> = {
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
          academic_anxiety: Boolean(flags.academic_anxiety),
          social_isolation: Boolean(flags.social_isolation),
          neurodevelopmental_concerns: Boolean(flags.neurodevelopmental_concerns),
          trauma_exposure: Boolean(flags.trauma_exposure),

          // Recheck flags
          academic_anxiety_recheck: Boolean(flags.academic_anxiety_recheck),
          social_isolation_recheck: Boolean(flags.social_isolation_recheck),
          mood_concerns_recheck: Boolean(flags.mood_concerns_recheck),
          bullying_recheck: Boolean(flags.bullying_recheck),

          // Follow-up scenario flags
          bullying_followup: Boolean(flags.bullying_followup),
          mood_check: Boolean(flags.mood_check),
          general_stress_check: Boolean(flags.general_stress_check),
          strengths_check: Boolean(flags.strengths_check),
          adult_support_followup: Boolean(flags.adult_support_followup),
          student_voice_followup: Boolean(flags.student_voice_followup),
          future_hope_check: Boolean(flags.future_hope_check),
          adult_trust_check: Boolean(flags.adult_trust_check),
          self_regulation_check: Boolean(flags.self_regulation_check),
          self_worth_check: Boolean(flags.self_worth_check),
          school_engagement_check: Boolean(flags.school_engagement_check),
          belonging_check: Boolean(flags.belonging_check),

          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
      },
      {
        // Mini 1.2: Recheck scenarios or baseline
        assessmentId: "g6-p1-settling",
        fileKey: "mini-1-2",
        fromAssessmentId: "g6-p1-baseline",
        when: (flags: any) =>
          Boolean(
            flags.no_flags_baseline ||
            flags.academic_anxiety_recheck ||
            flags.social_isolation_recheck ||
            flags.mood_concerns_recheck ||
            flags.bullying_recheck
          ),
        projectFlags: (flags: any) => ({
          // Primary flags
          academic_anxiety: Boolean(flags.academic_anxiety),
          social_isolation: Boolean(flags.social_isolation),
          neurodevelopmental_concerns: Boolean(flags.neurodevelopmental_concerns),
          trauma_exposure: Boolean(flags.trauma_exposure),

          // Recheck flags  
          academic_anxiety_recheck: Boolean(flags.academic_anxiety_recheck),
          social_isolation_recheck: Boolean(flags.social_isolation_recheck),
          mood_concerns_recheck: Boolean(flags.mood_concerns_recheck),
          bullying_recheck: Boolean(flags.bullying_recheck),

          // Follow-up scenario flags
          bullying_followup: Boolean(flags.bullying_followup),
          mood_check: Boolean(flags.mood_check),
          general_stress_check: Boolean(flags.general_stress_check),
          strengths_check: Boolean(flags.strengths_check),
          adult_support_followup: Boolean(flags.adult_support_followup),
          student_voice_followup: Boolean(flags.student_voice_followup),
          future_hope_check: Boolean(flags.future_hope_check),
          adult_trust_check: Boolean(flags.adult_trust_check),
          self_regulation_check: Boolean(flags.self_regulation_check),
          self_worth_check: Boolean(flags.self_worth_check),
          school_engagement_check: Boolean(flags.school_engagement_check),
          belonging_check: Boolean(flags.belonging_check),

          no_flags_baseline: Boolean(flags.no_flags_baseline),
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
          exam_stress: Boolean(flags.exam_stress),
          self_harm: Boolean(flags.self_harm),
          family_support: Boolean(flags.family_support),
          sleep_issues: Boolean(flags.sleep_issues),
          bullying: Boolean(flags.bullying),
          no_flags_mid_year: Boolean(flags.no_flags_mid_year),
          exam_stress_recheck: Boolean(flags.exam_stress_recheck),
          exam_stress_final_check: Boolean(flags.exam_stress_final_check),
          sleep_recheck: Boolean(flags.sleep_recheck),
          sleep_final_check: Boolean(flags.sleep_final_check),
          family_support_recheck: Boolean(flags.family_support_recheck),
          family_support_final: Boolean(flags.family_support_final),
          self_harm_recheck: Boolean(flags.self_harm_recheck),
          self_harm_crisis_check: Boolean(flags.self_harm_crisis_check),
          bullying_check: Boolean(flags.bullying_check),
        }),
        nextMiniId: "g6-p2-midyear",
        nextMiniCondition: () => true, // Always follow with Mini 2.2
        nextMiniProjectFlags: (flags: any) => ({
          exam_stress: Boolean(flags.exam_stress),
          self_harm: Boolean(flags.self_harm),
          family_support: Boolean(flags.family_support),
          sleep_issues: Boolean(flags.sleep_issues),
          bullying: Boolean(flags.bullying),
          no_flags_mid_year: Boolean(flags.no_flags_mid_year),
          exam_stress_recheck: Boolean(flags.exam_stress_recheck),
          exam_stress_final_check: Boolean(flags.exam_stress_final_check),
          sleep_recheck: Boolean(flags.sleep_recheck),
          sleep_final_check: Boolean(flags.sleep_final_check),
          family_support_recheck: Boolean(flags.family_support_recheck),
          family_support_final: Boolean(flags.family_support_final),
          self_harm_recheck: Boolean(flags.self_harm_recheck),
          self_harm_crisis_check: Boolean(flags.self_harm_crisis_check),
          bullying_check: Boolean(flags.bullying_check),
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
          exam_stress: Boolean(flags.exam_stress),
          self_harm: Boolean(flags.self_harm),
          family_support: Boolean(flags.family_support),
          sleep_issues: Boolean(flags.sleep_issues),
          bullying: Boolean(flags.bullying),
          no_flags_mid_year: Boolean(flags.no_flags_mid_year),
          exam_stress_recheck: Boolean(flags.exam_stress_recheck),
          exam_stress_final_check: Boolean(flags.exam_stress_final_check),
          sleep_recheck: Boolean(flags.sleep_recheck),
          sleep_final_check: Boolean(flags.sleep_final_check),
          family_support_recheck: Boolean(flags.family_support_recheck),
          family_support_final: Boolean(flags.family_support_final),
          self_harm_recheck: Boolean(flags.self_harm_recheck),
          self_harm_crisis_check: Boolean(flags.self_harm_crisis_check),
          bullying_check: Boolean(flags.bullying_check),
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
          bullying_follow_up: Boolean(flags.bullying_follow_up),
          home_safety_follow_up: Boolean(flags.home_safety_follow_up),
          self_harm_crisis_check: Boolean(flags.self_harm_crisis_check),
          motivation_burnout_check: Boolean(flags.motivation_burnout_check),
          energy_check: Boolean(flags.energy_check),
          family_check: Boolean(flags.family_check),
          general_stress_check: Boolean(flags.general_stress_check),
          motivation_check: Boolean(flags.motivation_check),
          social_check: Boolean(flags.social_check),
          strengths_check: Boolean(flags.strengths_check),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),

        nextMiniId: "g6-p3-final",
        nextMiniCondition: () => true,
        nextMiniProjectFlags: (flags: any) => ({
          bullying_follow_up: Boolean(flags.bullying_follow_up),
          home_safety_follow_up: Boolean(flags.home_safety_follow_up),
          self_harm_crisis_check: Boolean(flags.self_harm_crisis_check),
          motivation_burnout_check: Boolean(flags.motivation_burnout_check),
          energy_check: Boolean(flags.energy_check),
          family_check: Boolean(flags.family_check),
          general_stress_check: Boolean(flags.general_stress_check),
          motivation_check: Boolean(flags.motivation_check),
          social_check: Boolean(flags.social_check),
          strengths_check: Boolean(flags.strengths_check),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
      },
      {
        assessmentId: "g6-p3-final",
        fileKey: "mini-3-2",
        fromAssessmentId: "g6-p3-burnout",
        when: (flags: any) => Boolean(flags.no_flags_baseline),
      },
    ],
  },

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
          body_image: Boolean(flags.body_image),
          peer_pressure: Boolean(flags.peer_pressure),
          digital_anxiety: Boolean(flags.digital_anxiety),
          disengaged: Boolean(flags.disengaged),

          // Recheck flags
          academic_confidence_recheck: Boolean(flags.academic_confidence_recheck),
          belonging_recheck: Boolean(flags.belonging_recheck),
          mood_recheck: Boolean(flags.mood_recheck),
          bullying_recheck: Boolean(flags.bullying_recheck),

          // New Scenario Flags (Mini 1.1 & 1.2)
          bullying_followup: Boolean(flags.bullying_followup),
          general_stress_check: Boolean(flags.general_stress_check),
          mood_check: Boolean(flags.mood_check),
          somatic_check: Boolean(flags.somatic_check),
          strengths_check: Boolean(flags.strengths_check),
          support_check: Boolean(flags.support_check),
          adhd_screen_followup: Boolean(flags.adhd_screen_followup),
          academic_skills_followup: Boolean(flags.academic_skills_followup),
          anger_coping_followup: Boolean(flags.anger_coping_followup),
          cyberbullying_followup: Boolean(flags.cyberbullying_followup),
          emotional_literacy_followup: Boolean(flags.emotional_literacy_followup),
          girls_health_followup: Boolean(flags.girls_health_followup),
          ld_screen_followup: Boolean(flags.ld_screen_followup),
          memory_strategies_followup: Boolean(flags.memory_strategies_followup),
          romantic_followup: Boolean(flags.romantic_followup),
          self_followup: Boolean(flags.self_followup),
          self_harm_followup: Boolean(flags.self_harm_followup),
          social_media_risk_followup: Boolean(flags.social_media_risk_followup),
          social_media_safety_followup: Boolean(flags.social_media_safety_followup),
          substance_detail_followup: Boolean(flags.substance_detail_followup),
          tech_followup: Boolean(flags.tech_followup),
          general_social_check: Boolean(flags.general_social_check),
          social_inclusion_followup: Boolean(flags.social_inclusion_followup),
          peer_connection_followup: Boolean(flags.peer_connection_followup),
          digital_stress_followup: Boolean(flags.digital_stress_followup),
          mood_loneliness_followup: Boolean(flags.mood_loneliness_followup),
          academic_confidence_check: Boolean(flags.academic_confidence_check),
          adult_support_check: Boolean(flags.adult_support_check),
          family_check: Boolean(flags.family_check),

          no_flags_baseline: Boolean(flags.no_flags_baseline),
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
          body_image: Boolean(flags.body_image),
          peer_pressure: Boolean(flags.peer_pressure),
          digital_anxiety: Boolean(flags.digital_anxiety),
          disengaged: Boolean(flags.disengaged),
          academic_confidence_recheck: Boolean(flags.academic_confidence_recheck),
          belonging_recheck: Boolean(flags.belonging_recheck),
          mood_recheck: Boolean(flags.mood_recheck),
          bullying_recheck: Boolean(flags.bullying_recheck),

          // New Scenario Flags
          bullying_followup: Boolean(flags.bullying_followup),
          general_stress_check: Boolean(flags.general_stress_check),
          mood_check: Boolean(flags.mood_check),
          somatic_check: Boolean(flags.somatic_check),
          strengths_check: Boolean(flags.strengths_check),
          support_check: Boolean(flags.support_check),
          adhd_screen_followup: Boolean(flags.adhd_screen_followup),
          academic_skills_followup: Boolean(flags.academic_skills_followup),
          anger_coping_followup: Boolean(flags.anger_coping_followup),
          cyberbullying_followup: Boolean(flags.cyberbullying_followup),
          emotional_literacy_followup: Boolean(flags.emotional_literacy_followup),
          girls_health_followup: Boolean(flags.girls_health_followup),
          ld_screen_followup: Boolean(flags.ld_screen_followup),
          memory_strategies_followup: Boolean(flags.memory_strategies_followup),
          romantic_followup: Boolean(flags.romantic_followup),
          self_followup: Boolean(flags.self_followup),
          self_harm_followup: Boolean(flags.self_harm_followup),
          social_media_risk_followup: Boolean(flags.social_media_risk_followup),
          social_media_safety_followup: Boolean(flags.social_media_safety_followup),
          substance_detail_followup: Boolean(flags.substance_detail_followup),
          tech_followup: Boolean(flags.tech_followup),
          general_social_check: Boolean(flags.general_social_check),
          social_inclusion_followup: Boolean(flags.social_inclusion_followup),
          peer_connection_followup: Boolean(flags.peer_connection_followup),
          digital_stress_followup: Boolean(flags.digital_stress_followup),
          mood_loneliness_followup: Boolean(flags.mood_loneliness_followup),
          academic_confidence_check: Boolean(flags.academic_confidence_check),
          adult_support_check: Boolean(flags.adult_support_check),
          family_check: Boolean(flags.family_check),

          no_flags_baseline: Boolean(flags.no_flags_baseline),
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
          body_image: Boolean(flags.body_image),
          peer_pressure: Boolean(flags.peer_pressure),
          digital_anxiety: Boolean(flags.digital_anxiety),
          disengaged: Boolean(flags.disengaged),
          academic_confidence_recheck: Boolean(flags.academic_confidence_recheck),
          belonging_recheck: Boolean(flags.belonging_recheck),
          mood_recheck: Boolean(flags.mood_recheck),
          bullying_recheck: Boolean(flags.bullying_recheck),

          // New Scenario Flags
          bullying_followup: Boolean(flags.bullying_followup),
          general_stress_check: Boolean(flags.general_stress_check),
          mood_check: Boolean(flags.mood_check),
          somatic_check: Boolean(flags.somatic_check),
          strengths_check: Boolean(flags.strengths_check),
          support_check: Boolean(flags.support_check),
          adhd_screen_followup: Boolean(flags.adhd_screen_followup),
          academic_skills_followup: Boolean(flags.academic_skills_followup),
          anger_coping_followup: Boolean(flags.anger_coping_followup),
          cyberbullying_followup: Boolean(flags.cyberbullying_followup),
          emotional_literacy_followup: Boolean(flags.emotional_literacy_followup),
          girls_health_followup: Boolean(flags.girls_health_followup),
          ld_screen_followup: Boolean(flags.ld_screen_followup),
          memory_strategies_followup: Boolean(flags.memory_strategies_followup),
          romantic_followup: Boolean(flags.romantic_followup),
          self_followup: Boolean(flags.self_followup),
          self_harm_followup: Boolean(flags.self_harm_followup),
          social_media_risk_followup: Boolean(flags.social_media_risk_followup),
          social_media_safety_followup: Boolean(flags.social_media_safety_followup),
          substance_detail_followup: Boolean(flags.substance_detail_followup),
          tech_followup: Boolean(flags.tech_followup),
          general_social_check: Boolean(flags.general_social_check),
          social_inclusion_followup: Boolean(flags.social_inclusion_followup),
          peer_connection_followup: Boolean(flags.peer_connection_followup),
          digital_stress_followup: Boolean(flags.digital_stress_followup),
          mood_loneliness_followup: Boolean(flags.mood_loneliness_followup),
          academic_confidence_check: Boolean(flags.academic_confidence_check),
          adult_support_check: Boolean(flags.adult_support_check),
          family_check: Boolean(flags.family_check),

          no_flags_baseline: Boolean(flags.no_flags_baseline),
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
          exam_stress_check: Boolean(flags.exam_stress_check),
          sleep_check: Boolean(flags.sleep_check),
          family_pressure_check: Boolean(flags.family_pressure_check),
          self_harm_followup: Boolean(flags.self_harm_followup),
          bullying_followup: Boolean(flags.bullying_followup),
          emotional_overwhelm_recheck: Boolean(flags.emotional_overwhelm_recheck),
          academic_support_check: Boolean(flags.academic_support_check),
          general_stress_check: Boolean(flags.general_stress_check),
          social_check: Boolean(flags.social_check),
          strengths_check: Boolean(flags.strengths_check),
          no_flags_mid_year: Boolean(flags.no_flags_mid_year),
        }),
        nextMiniId: "g7-p2-energy",
        nextMiniCondition: () => true,
        nextMiniProjectFlags: (flags: any) => ({
          exam_stress_check: Boolean(flags.exam_stress_check),
          sleep_check: Boolean(flags.sleep_check),
          family_pressure_check: Boolean(flags.family_pressure_check),
          self_harm_followup: Boolean(flags.self_harm_followup),
          bullying_followup: Boolean(flags.bullying_followup),
          emotional_overwhelm_recheck: Boolean(flags.emotional_overwhelm_recheck),
          academic_support_check: Boolean(flags.academic_support_check),
          general_stress_check: Boolean(flags.general_stress_check),
          social_check: Boolean(flags.social_check),
          strengths_check: Boolean(flags.strengths_check),
          no_flags_mid_year: Boolean(flags.no_flags_mid_year),
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
          exam_stress_check: Boolean(flags.exam_stress_check),
          sleep_check: Boolean(flags.sleep_check),
          family_pressure_check: Boolean(flags.family_pressure_check),
          self_harm_followup: Boolean(flags.self_harm_followup),
          bullying_followup: Boolean(flags.bullying_followup),
          emotional_overwhelm_recheck: Boolean(flags.emotional_overwhelm_recheck),
          academic_support_check: Boolean(flags.academic_support_check),
          general_stress_check: Boolean(flags.general_stress_check),
          social_check: Boolean(flags.social_check),
          strengths_check: Boolean(flags.strengths_check),
          no_flags_mid_year: Boolean(flags.no_flags_mid_year),
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
            flags.home_safety_check
          ),
        projectFlags: (flags: any) => ({
          energy_fatigue_check: Boolean(flags.energy_fatigue_check),
          motivation_check: Boolean(flags.motivation_check),
          coping_check: Boolean(flags.coping_check),
          digital_wellbeing_check: Boolean(flags.digital_wellbeing_check),
          family_support_check: Boolean(flags.family_support_check),
          bullying_check: Boolean(flags.bullying_check),
          self_harm_check: Boolean(flags.self_harm_check),
          academic_check: Boolean(flags.academic_check),
          social_check: Boolean(flags.social_check),
          strengths_check: Boolean(flags.strengths_check),
          student_voice_check: Boolean(flags.student_voice_check),
          home_safety_check: Boolean(flags.home_safety_check),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
        nextMiniId: "g7-p3-final",
        nextMiniCondition: () => true,
        nextMiniProjectFlags: (flags: any) => ({
          energy_fatigue_check: Boolean(flags.energy_fatigue_check),
          motivation_check: Boolean(flags.motivation_check),
          coping_check: Boolean(flags.coping_check),
          digital_wellbeing_check: Boolean(flags.digital_wellbeing_check),
          family_support_check: Boolean(flags.family_support_check),
          bullying_check: Boolean(flags.bullying_check),
          self_harm_check: Boolean(flags.self_harm_check),
          academic_check: Boolean(flags.academic_check),
          social_check: Boolean(flags.social_check),
          strengths_check: Boolean(flags.strengths_check),
          student_voice_check: Boolean(flags.student_voice_check),
          home_safety_check: Boolean(flags.home_safety_check),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
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
            flags.strengths_check ||
            flags.student_voice_check ||
            flags.home_safety_check
          ),
        projectFlags: (flags: any) => ({
          energy_fatigue_check: Boolean(flags.energy_fatigue_check),
          motivation_check: Boolean(flags.motivation_check),
          coping_check: Boolean(flags.coping_check),
          digital_wellbeing_check: Boolean(flags.digital_wellbeing_check),
          family_support_check: Boolean(flags.family_support_check),
          bullying_check: Boolean(flags.bullying_check),
          self_harm_check: Boolean(flags.self_harm_check),
          academic_check: Boolean(flags.academic_check),
          social_check: Boolean(flags.social_check),
          strengths_check: Boolean(flags.strengths_check),
          student_voice_check: Boolean(flags.student_voice_check),
          home_safety_check: Boolean(flags.home_safety_check),
        }),
      },
    ],
  },

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
          academic_recheck: Boolean(flags.academic_recheck),
          social_recheck: Boolean(flags.social_recheck),
          mood_recheck: Boolean(flags.mood_recheck),
          bullying_recheck: Boolean(flags.bullying_recheck),

          // Specific G8P1 Scenarios
          peer_susceptibility: Boolean(flags.peer_susceptibility),
          tech_abuse: Boolean(flags.tech_abuse),
          attention_issues: Boolean(flags.attention_issues),
          social_media_risk: Boolean(flags.social_media_risk),
          neurodevelopmental: Boolean(flags.neurodevelopmental),

          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
      },
      {
        assessmentId: "g8-p1-peer",
        fileKey: "mini-1-2",
        fromAssessmentId: "g8-p1-transition",
        when: (flags: any) => Boolean(flags.no_flags_baseline),
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
          exam_stress_recheck: Boolean(flags.exam_stress_recheck),
          sleep_recheck: Boolean(flags.sleep_recheck),
          family_pressure_recheck: Boolean(flags.family_pressure_recheck),
          self_harm_followup: Boolean(flags.self_harm_followup),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
        // For flagged students, follow with Mini 2.2 as a broader check-in
        nextMiniId: "g8-p2-energy",
        nextMiniCondition: () => true,
        nextMiniProjectFlags: (flags: any) => ({
          exam_stress_recheck: Boolean(flags.exam_stress_recheck),
          sleep_recheck: Boolean(flags.sleep_recheck),
          family_pressure_recheck: Boolean(flags.family_pressure_recheck),
          self_harm_followup: Boolean(flags.self_harm_followup),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
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
          exam_stress_recheck: Boolean(flags.exam_stress_recheck),
          sleep_recheck: Boolean(flags.sleep_recheck),
          family_pressure_recheck: Boolean(flags.family_pressure_recheck),
          self_harm_followup: Boolean(flags.self_harm_followup),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
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
        when: (flags: any) =>
          Boolean(
            flags.energy_motivation_recheck ||
            flags.academic_engagement_recheck ||
            flags.peer_connection_recheck ||
            flags.home_safety_recheck ||
            flags.self_harm_recheck
          ),
        projectFlags: (flags: any) => ({
          energy_motivation_recheck: Boolean(flags.energy_motivation_recheck),
          academic_engagement_recheck: Boolean(flags.academic_engagement_recheck),
          peer_connection_recheck: Boolean(flags.peer_connection_recheck),
          home_safety_recheck: Boolean(flags.home_safety_recheck),
          self_harm_recheck: Boolean(flags.self_harm_recheck),
          academic_concerns_recheck: Boolean(flags.academic_concerns_recheck),
          grade9_anxiety_recheck: Boolean(flags.grade9_anxiety_recheck),
          emotional_concerns_recheck: Boolean(flags.emotional_concerns_recheck),
          support_access_recheck: Boolean(flags.support_access_recheck),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
        // For flagged students, follow with Mini 3.2 cover transition readiness.
        nextMiniId: "g8-p3-mindset",
        nextMiniCondition: () => true,
        nextMiniProjectFlags: (flags: any) => ({
          energy_motivation_recheck: Boolean(flags.energy_motivation_recheck),
          academic_engagement_recheck: Boolean(flags.academic_engagement_recheck),
          peer_connection_recheck: Boolean(flags.peer_connection_recheck),
          home_safety_recheck: Boolean(flags.home_safety_recheck),
          self_harm_recheck: Boolean(flags.self_harm_recheck),
          academic_concerns_recheck: Boolean(flags.academic_concerns_recheck),
          grade9_anxiety_recheck: Boolean(flags.grade9_anxiety_recheck),
          emotional_concerns_recheck: Boolean(flags.emotional_concerns_recheck),
          support_access_recheck: Boolean(flags.support_access_recheck),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
      },
      {
        // Final prep and Grade 9 readiness check for students without acute P3 risks
        assessmentId: "g8-p3-mindset",
        fileKey: "mini-3-2",
        fromAssessmentId: "g8-p3-relationships",
        when: (flags: any) =>
          !Boolean(
            flags.energy_motivation_recheck ||
            flags.academic_engagement_recheck ||
            flags.peer_connection_recheck ||
            flags.home_safety_recheck ||
            flags.self_harm_recheck
          ),
        projectFlags: (flags: any) => ({
          energy_motivation_recheck: Boolean(flags.energy_motivation_recheck),
          academic_engagement_recheck: Boolean(flags.academic_engagement_recheck),
          peer_connection_recheck: Boolean(flags.peer_connection_recheck),
          home_safety_recheck: Boolean(flags.home_safety_recheck),
          self_harm_recheck: Boolean(flags.self_harm_recheck),
          academic_concerns_recheck: Boolean(flags.academic_concerns_recheck),
          grade9_anxiety_recheck: Boolean(flags.grade9_anxiety_recheck),
          emotional_concerns_recheck: Boolean(flags.emotional_concerns_recheck),
          support_access_recheck: Boolean(flags.support_access_recheck),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
      },
    ],
  },

  // Grade 9 Phase 1
  "g9-p1": {
    flagDeriverKey: "deriveMiniFlagsForG9P1",
    minis: [
      {
        assessmentId: "g9-p1-adjustment",
        fileKey: "mini-1-2",
        fromAssessmentId: "g9-p1-baseline",
        when: (flags: any) => !flags.no_flags_baseline,
        projectFlags: (flags: any) => ({
          academic_shock_recheck: Boolean(flags.academic_shock_recheck),
          career_anxiety_recheck: Boolean(flags.career_anxiety_recheck),
          sleep_recheck: Boolean(flags.sleep_recheck),
          mood_recheck: Boolean(flags.mood_recheck),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
      },
      {
        assessmentId: "g9-p1-burnout",
        fileKey: "mini-1-1",
        fromAssessmentId: "g9-p1-baseline",
        when: (flags: any) => Boolean(flags.no_flags_baseline),
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
        when: (flags: any) => !Boolean(flags.no_flags_baseline),
        projectFlags: (flags: any) => ({
          exam_stress_recheck: Boolean(flags.exam_stress_recheck),
          sleep_recheck: Boolean(flags.sleep_recheck),
          mood_recheck: Boolean(flags.mood_recheck),
          family_pressure_recheck: Boolean(flags.family_pressure_recheck),
          self_harm_followup: Boolean(flags.self_harm_followup),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
        nextMiniId: "g9-p2-career",
        nextMiniCondition: () => true,
        nextMiniProjectFlags: (flags: any) => ({
          exam_stress_recheck: Boolean(flags.exam_stress_recheck),
          sleep_recheck: Boolean(flags.sleep_recheck),
          mood_recheck: Boolean(flags.mood_recheck),
          family_pressure_recheck: Boolean(flags.family_pressure_recheck),
          self_harm_followup: Boolean(flags.self_harm_followup),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
      },
      {
        // Mid-year career clarity/general check
        assessmentId: "g9-p2-career",
        fileKey: "mini-2-2",
        fromAssessmentId: "g9-p2-midterm",
        when: (flags: any) => Boolean(flags.no_flags_baseline),
        projectFlags: (flags: any) => ({
          exam_stress_recheck: Boolean(flags.exam_stress_recheck),
          sleep_recheck: Boolean(flags.sleep_recheck),
          mood_recheck: Boolean(flags.mood_recheck),
          family_pressure_recheck: Boolean(flags.family_pressure_recheck),
          self_harm_followup: Boolean(flags.self_harm_followup),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
      },
    ],
  },

  // Grade 10 Phase 1
  "g10-p1": {
    flagDeriverKey: "deriveMiniFlagsForG10P1",
    minis: [
      {
        assessmentId: "g10-p1-progress",
        fileKey: "mini-1-2",
        fromAssessmentId: "g10-p1-foundation",
        when: (flags: any) => !flags.no_flags_baseline,
        projectFlags: (flags: any) => ({
          board_shock_recheck: Boolean(flags.board_shock_recheck),
          career_worry_recheck: Boolean(flags.career_worry_recheck),
          time_balance_recheck: Boolean(flags.time_balance_recheck),
          sleep_recheck: Boolean(flags.sleep_recheck),
          mood_recheck: Boolean(flags.mood_recheck),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
      },
      {
        assessmentId: "g10-p1-health",
        fileKey: "mini-1-1",
        fromAssessmentId: "g10-p1-foundation",
        when: (flags: any) => Boolean(flags.no_flags_baseline),
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
        when: (flags: any) =>
          Boolean(
            flags.identity_confusion_recheck ||
            flags.stream_anxiety_recheck ||
            flags.home_safety_recheck ||
            flags.self_harm_recheck
          ),
        projectFlags: (flags: any) => ({
          // Legacy flags
          identity_confusion_recheck: Boolean(flags.identity_confusion_recheck),
          stream_anxiety_recheck: Boolean(flags.stream_anxiety_recheck),
          home_safety_recheck: Boolean(flags.home_safety_recheck),
          self_harm_recheck: Boolean(flags.self_harm_recheck),
          stream_confidence_recheck: Boolean(flags.stream_confidence_recheck),
          board_anxiety_recheck: Boolean(flags.board_anxiety_recheck),
          emotional_readiness_recheck: Boolean(flags.emotional_readiness_recheck),
          support_access_recheck: Boolean(flags.support_access_recheck),

          // Scenario-matching flags
          academic_check: Boolean(flags.academic_check),
          bullying_followup: Boolean(flags.bullying_followup),
          digital_wellbeing_check: Boolean(flags.digital_wellbeing_check),
          emotional_check: Boolean(flags.emotional_check),
          family_check: Boolean(flags.family_check),
          general_stress_check: Boolean(flags.general_stress_check),
          sleep_check: Boolean(flags.sleep_check),
          somatic_check: Boolean(flags.somatic_check),
          strengths_check: Boolean(flags.strengths_check),
          support_check: Boolean(flags.support_check),
          burnout_followup: Boolean(flags.burnout_followup),

          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
        // After targeted Readiness mini, always follow with board prep check
        nextMiniId: "g9-p3-board",
        nextMiniCondition: () => true,
        nextMiniProjectFlags: (flags: any) => ({
          // Legacy flags
          stream_confidence_recheck: Boolean(flags.stream_confidence_recheck),
          board_anxiety_recheck: Boolean(flags.board_anxiety_recheck),
          emotional_readiness_recheck: Boolean(flags.emotional_readiness_recheck),
          support_access_recheck: Boolean(flags.support_access_recheck),
          identity_confusion_recheck: Boolean(flags.identity_confusion_recheck),
          stream_anxiety_recheck: Boolean(flags.stream_anxiety_recheck),
          home_safety_recheck: Boolean(flags.home_safety_recheck),
          self_harm_recheck: Boolean(flags.self_harm_recheck),

          // Scenario-matching flags  
          academic_check: Boolean(flags.academic_check),
          bullying_followup: Boolean(flags.bullying_followup),
          digital_wellbeing_check: Boolean(flags.digital_wellbeing_check),
          emotional_check: Boolean(flags.emotional_check),
          family_check: Boolean(flags.family_check),
          general_stress_check: Boolean(flags.general_stress_check),
          sleep_check: Boolean(flags.sleep_check),
          somatic_check: Boolean(flags.somatic_check),
          strengths_check: Boolean(flags.strengths_check),
          support_check: Boolean(flags.support_check),
          burnout_followup: Boolean(flags.burnout_followup),

          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
      },
      {
        assessmentId: "g9-p3-board",
        fileKey: "mini-3-2",
        fromAssessmentId: "g9-p3-decision",
        when: (flags: any) =>
          !Boolean(
            flags.identity_confusion_recheck ||
            flags.stream_anxiety_recheck ||
            flags.home_safety_recheck ||
            flags.self_harm_recheck
          ),
        projectFlags: (flags: any) => ({
          // Legacy flags
          stream_confidence_recheck: Boolean(flags.stream_confidence_recheck),
          board_anxiety_recheck: Boolean(flags.board_anxiety_recheck),
          emotional_readiness_recheck: Boolean(flags.emotional_readiness_recheck),
          support_access_recheck: Boolean(flags.support_access_recheck),
          identity_confusion_recheck: Boolean(flags.identity_confusion_recheck),
          stream_anxiety_recheck: Boolean(flags.stream_anxiety_recheck),
          home_safety_recheck: Boolean(flags.home_safety_recheck),
          self_harm_recheck: Boolean(flags.self_harm_recheck),

          // Scenario-matching flags
          academic_check: Boolean(flags.academic_check),
          bullying_followup: Boolean(flags.bullying_followup),
          digital_wellbeing_check: Boolean(flags.digital_wellbeing_check),
          emotional_check: Boolean(flags.emotional_check),
          family_check: Boolean(flags.family_check),
          general_stress_check: Boolean(flags.general_stress_check),
          sleep_check: Boolean(flags.sleep_check),
          somatic_check: Boolean(flags.somatic_check),
          strengths_check: Boolean(flags.strengths_check),
          support_check: Boolean(flags.support_check),
          burnout_followup: Boolean(flags.burnout_followup),

          no_flags_baseline: Boolean(flags.no_flags_baseline),
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
            flags.self_harm_followup
          ),
        projectFlags: (flags: any) => ({
          academic_confidence_recheck: Boolean(flags.academic_confidence_recheck),
          time_balance_recheck: Boolean(flags.time_balance_recheck),
          sleep_recheck: Boolean(flags.sleep_recheck),
          family_pressure_recheck: Boolean(flags.family_pressure_recheck),
          self_harm_followup: Boolean(flags.self_harm_followup),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
        nextMiniId: "g10-p2-preboard",
        nextMiniCondition: () => true,
        nextMiniProjectFlags: (flags: any) => ({
          academic_confidence_recheck: Boolean(flags.academic_confidence_recheck),
          time_balance_recheck: Boolean(flags.time_balance_recheck),
          sleep_recheck: Boolean(flags.sleep_recheck),
          family_pressure_recheck: Boolean(flags.family_pressure_recheck),
          self_harm_followup: Boolean(flags.self_harm_followup),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
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
            flags.self_harm_followup
          ),
        projectFlags: (flags: any) => ({
          academic_confidence_recheck: Boolean(flags.academic_confidence_recheck),
          time_balance_recheck: Boolean(flags.time_balance_recheck),
          sleep_recheck: Boolean(flags.sleep_recheck),
          family_pressure_recheck: Boolean(flags.family_pressure_recheck),
          self_harm_followup: Boolean(flags.self_harm_followup),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
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
            flags.self_harm_recheck
          ),
        projectFlags: (flags: any) => ({
          physical_health_recheck: Boolean(flags.physical_health_recheck),
          academic_confidence_recheck: Boolean(flags.academic_confidence_recheck),
          coping_skills_recheck: Boolean(flags.coping_skills_recheck),
          family_support_recheck: Boolean(flags.family_support_recheck),
          self_harm_recheck: Boolean(flags.self_harm_recheck),
          support_access_recheck: Boolean(flags.support_access_recheck),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
        // After high-risk Mini 3.1, always schedule Mini 3.2 cover mindset
        nextMiniId: "g10-p3-mindset",
        nextMiniCondition: () => true,
        nextMiniProjectFlags: (flags: any) => ({
          physical_health_recheck: Boolean(flags.physical_health_recheck),
          academic_confidence_recheck: Boolean(flags.academic_confidence_recheck),
          coping_skills_recheck: Boolean(flags.coping_skills_recheck),
          family_support_recheck: Boolean(flags.family_support_recheck),
          self_harm_recheck: Boolean(flags.self_harm_recheck),
          support_access_recheck: Boolean(flags.support_access_recheck),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
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
            flags.self_harm_recheck
          ),
        projectFlags: (flags: any) => ({
          physical_health_recheck: Boolean(flags.physical_health_recheck),
          academic_confidence_recheck: Boolean(flags.academic_confidence_recheck),
          coping_skills_recheck: Boolean(flags.coping_skills_recheck),
          family_support_recheck: Boolean(flags.family_support_recheck),
          self_harm_recheck: Boolean(flags.self_harm_recheck),
          support_access_recheck: Boolean(flags.support_access_recheck),
          no_flags_baseline: Boolean(flags.no_flags_baseline),
        }),
      },
    ],
  },
};

// Generic scheduler that uses FLOW_CONFIG and flag derivation functions.
// To support a new grade/phase, add a config entry and a flag-deriver;
// the engine logic below does not need to change.
export async function scheduleNextMiniAssessment(
  userId: string,
  grade: number,
  phase: number,
  majorQuestions: any[],
  responsesArray: any[],
  flagDerivationFunctions: Record<string, Function>
): Promise<void> {
  try {
    const flowKey = `g${grade}-p${phase}`;
    const config = FLOW_CONFIG[flowKey];

    if (!config) {
      console.warn("[assessmentScheduler] No FLOW_CONFIG defined for", { grade, phase });
      return;
    }

    const deriveFlags = flagDerivationFunctions[config.flagDeriverKey] as FlagDeriver | undefined;
    if (typeof deriveFlags !== "function") {
      console.warn("[assessmentScheduler] No flag deriver found for", {
        grade,
        phase,
        flagDeriverKey: config.flagDeriverKey,
      });
      return;
    }

    const flags = deriveFlags(majorQuestions, responsesArray);
    const enabled = await loadEnabledAssessments();
    console.log('[assessmentScheduler] Loaded enabled config:', enabled);

    const isAssessmentEnabled = (assessmentId: string): boolean => {
      if (!enabled) {
        console.warn('[assessmentScheduler] No enabled config found');
        return false;
      }
      const result = Boolean(enabled[assessmentId]);
      console.log(`[assessmentScheduler] Checking enabled[${assessmentId}] = ${enabled[assessmentId]} => ${result}`);
      return result;
    };

    // Pick the first mini whose condition is satisfied and is enabled in admin
    console.log("[assessmentScheduler] Evaluating minis for", { grade, phase, flags });

    const chosenMini = config.minis.find((mini) => {
      const conditionMet = mini.when(flags);
      const enabledStatus = isAssessmentEnabled(mini.assessmentId);
      console.log(`[assessmentScheduler] Checking mini ${mini.assessmentId}: conditionMet=${conditionMet}, enabled=${enabledStatus}`);
      return conditionMet && enabledStatus;
    });

    if (!chosenMini) {
      console.log("[assessmentScheduler] No eligible mini found for", {
        grade,
        phase,
        flags,
        satisfiedButDisabled: config.minis.filter(m => m.when(flags)).map(m => m.assessmentId)
      });
      return;
    }

    let nextMiniPayload: {
      assessmentId: string;
      fileKey: string;
      flags?: Record<string, boolean>;
    } | undefined;

    if (
      chosenMini.nextMiniId &&
      (!chosenMini.nextMiniCondition || chosenMini.nextMiniCondition(flags)) &&
      isAssessmentEnabled(chosenMini.nextMiniId)
    ) {
      nextMiniPayload = {
        assessmentId: chosenMini.nextMiniId,
        fileKey:
          config.minis.find((m) => m.assessmentId === chosenMini.nextMiniId)?.fileKey ||
          chosenMini.nextMiniId,
        ...(chosenMini.nextMiniProjectFlags
          ? { flags: chosenMini.nextMiniProjectFlags(flags) }
          : {}),
      };
    }

    await scheduleMiniForUser(userId, {
      grade,
      phase,
      assessmentId: chosenMini.assessmentId,
      fromAssessmentId: chosenMini.fromAssessmentId,
      fileKey: chosenMini.fileKey,
      ...(chosenMini.projectFlags ? { flags: chosenMini.projectFlags(flags) } : {}),
      ...(nextMiniPayload ? { nextMini: nextMiniPayload } : {}),
      status: "scheduled",
    });
  } catch (err) {
    console.error("[assessmentScheduler] Failed to schedule next mini assessment", { userId, grade, phase }, err);
  }
}

// Export helper functions for dashboard stats
export function getAvailableAssessments(userId: string, grade: number, phase: number) {
  const flowKey = `g${grade}-p${phase}`;
  const config = FLOW_CONFIG[flowKey];
  
  if (!config) {
    return {
      major: null,
      mini: null
    };
  }
  
  return {
    major: {
      available: true,
      assessmentId: `g${grade}-p${phase}-major`,
      name: 'Major Assessment'
    },
    mini: {
      available: true,
      assessmentId: `g${grade}-p${phase}-mini-1`,
      name: 'Mini Assessment'
    }
  };
}

export function getCurrentPhase(userId: string, grade: number): number {
  // This would typically fetch from user data or assessments
  // For now, return a default phase based on grade
  if (grade <= 6) return 1;
  if (grade <= 7) return 2;
  if (grade <= 8) return 3;
  return 4;
}
