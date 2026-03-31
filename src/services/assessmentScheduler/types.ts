/**
 * Type definitions for Assessment Scheduler
 */

export type FlagDeriver = (questions: any[], responses: any[]) => any;

export type MiniConfig = {
    assessmentId: string;
    fileKey: string;
    fromAssessmentId: string;
    when: (flags: any) => boolean;
    projectFlags?: (flags: any) => Record<string, boolean> | undefined;
    nextMiniId?: string;
    nextMiniCondition?: (flags: any) => boolean;
    nextMiniProjectFlags?: (flags: any) => Record<string, boolean> | undefined;
};

export type GradePhaseConfig = {
    flagDeriverKey: string;
    minis: MiniConfig[];
};
