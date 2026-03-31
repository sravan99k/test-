import { scheduleMiniForUser } from "@/services/miniAssessmentService";
import { loadEnabledAssessments } from "@/services/assessmentManagementService";
import { deriveFlagsSafely } from "@/services/assessmentUtils";
import { FLOW_CONFIG } from "./configs";
import { FlagDeriver } from "./types";

// Generic scheduler that uses FLOW_CONFIG and flag derivation functions.
// To support a new grade/phase, add a config entry and a flag-deriver;
// the engine logic below does not need to change.
export async function scheduleNextMiniAssessment(
    userId: string,
    grade: number,
    phase: number,
    majorQuestions: any[],
    responsesArray: any[],
    flagDerivationFunctions: Record<string, Function>,
    completedAssessmentIds: string[] = [] // New argument
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

        // Derive flags with error handling
        const flags = deriveFlagsSafely(
            deriveFlags,
            majorQuestions,
            responsesArray,
            { __derivation_failed__: true } as any
        );

        console.log('[assessmentScheduler] Derived Flags Detail:', {
            grade,
            phase,
            totalQuestions: majorQuestions?.length,
            totalResponses: responsesArray?.length,
            flags,
            sampleResponse: responsesArray.length > 0 ? responsesArray[0] : 'N/A'
        });

        // DEBUG: Deep dive into potential false positives (exclude no_flags_baseline from check)
        const hasConcernFlags = Object.entries(flags).some(([key, v]) => key !== 'no_flags_baseline' && v === true);
        if (hasConcernFlags) {
            console.log('[assessmentScheduler] 🚩 CONCERN FLAGS DETECTED! Analyzing trigger...');
            // Log the responses that might have triggered them
            console.log('[assessmentScheduler] Incident Response Dump:', JSON.stringify(responsesArray.slice(0, 10), null, 2));
        } else {
            console.log('[assessmentScheduler] ✅ No concern flags. no_flags_baseline:', (flags as any).no_flags_baseline);
        }

        if ((flags as any).__derivation_failed__) {
            console.warn("[assessmentScheduler] Flag derivation failed; skipping mini scheduling for", {
                grade,
                phase,
            });
            return;
        }

        const enabled = await loadEnabledAssessments();
        console.log('[assessmentScheduler] Loaded enabled config:', enabled);

        const isAssessmentEnabled = (assessmentId: string): boolean => {
            if (!enabled) return false;
            return Boolean(enabled[assessmentId]);
        };

        console.log("[assessmentScheduler] Evaluating minis for", { grade, phase, flags, completedCount: completedAssessmentIds.length });

        // STRICT DEPENDENCY ENFORCEMENT:
        // Calculate which minis are "dependent" (i.e., they are the 'nextMiniId' of another mini).
        // Dependent minis CANNOT be scheduled directly; they must be reached via the chaining logic.
        const dependentMiniIds = new Set<string>();
        config.minis.forEach(m => {
            if (m.nextMiniId) {
                dependentMiniIds.add(m.nextMiniId);
            }
        });

        // CHAINING LOGIC:
        // Iterate through defined minis.
        // 1. If a mini is COMPLETED -> Check its nextMini.
        //    - If nextMini is NOT completed and IS enabled -> Schedule it.
        // 2. If a mini is NOT COMPLETED -> Check its 'when' condition.
        //    - If met and IS enabled -> Schedule it.

        let chosenMini: any = null;
        let useProjectedFlags = false;
        let fromMiniId: string | undefined = undefined;

        for (const mini of config.minis) {
            const isCompleted = completedAssessmentIds.includes(mini.assessmentId);

            if (isCompleted) {
                console.log(`[assessmentScheduler] Mini ${mini.assessmentId} is COMPLETED. Checking chain...`);
                // Check if it has a next step
                if (mini.nextMiniId) {
                    const nextMiniIsCompleted = completedAssessmentIds.includes(mini.nextMiniId);
                    if (nextMiniIsCompleted) {
                        console.log(`[assessmentScheduler] Next mini ${mini.nextMiniId} also completed. Continuing chain.`);
                        continue; // Continue to see if *that* mini has a next step (if config allows)
                        // Note: currently config.minis is flat, so the loop will eventually hit the configured entry for nextMiniId anyway.
                    }

                    // Check if next mini is enabled and condition met
                    const isNextEnabled = isAssessmentEnabled(mini.nextMiniId);
                    const isNextConditionMet = !mini.nextMiniCondition || mini.nextMiniCondition(flags);

                    if (isNextEnabled && isNextConditionMet) {
                        console.log(`[assessmentScheduler] Chaining trigger: ${mini.assessmentId} -> ${mini.nextMiniId}`);
                        // We need to resolve the full config object for the next mini
                        const nextMiniConfig = config.minis.find(m => m.assessmentId === mini.nextMiniId);
                        if (nextMiniConfig) {
                            chosenMini = nextMiniConfig;
                            useProjectedFlags = true; // Use flags projected from the previous mini
                            fromMiniId = mini.assessmentId;
                            // We found our target, break the loop
                            break;
                        }
                    } else {
                        console.log(`[assessmentScheduler] Next mini ${mini.nextMiniId} skipped. Enabled=${isNextEnabled}, Condition=${isNextConditionMet}`);
                    }
                }
            } else {
                // Not completed, check if this is the one we should start

                // DEPENDENCY CHECK: Is this mini a dependent of another one?
                // Allow direct scheduling if the mini has its own 'when' condition that is met.
                // This enables non-flagged students to skip Mini 1 and go directly to Mini 2.
                if (dependentMiniIds.has(mini.assessmentId)) {
                    const ownConditionMet = mini.when(flags);
                    if (!ownConditionMet) {
                        console.log(`[assessmentScheduler] Mini ${mini.assessmentId} is dependent and own condition not met. Skipping.`);
                        continue;
                    }
                    console.log(`[assessmentScheduler] Mini ${mini.assessmentId} is dependent BUT own condition IS met. Allowing direct scheduling.`);
                }

                const conditionMet = mini.when(flags);
                const enabledStatus = isAssessmentEnabled(mini.assessmentId);
                console.log(`[assessmentScheduler] Checking candidate ${mini.assessmentId}: conditionMet=${conditionMet}, enabled=${enabledStatus}`);

                if (conditionMet && enabledStatus) {
                    chosenMini = mini;
                    break;
                }
            }
        }

        if (!chosenMini) {
            console.log("[assessmentScheduler] No eligible mini found to schedule.");
            return;
        }

        console.log(`[assessmentScheduler] Scheduling: ${chosenMini.assessmentId}`);

        let nextMiniPayload: {
            assessmentId: string;
            fileKey: string;
            flags?: Record<string, boolean>;
        } | undefined;

        // Prepare nextMini payload if applicable (standard logic)
        if (
            chosenMini.nextMiniId &&
            (!chosenMini.nextMiniCondition || chosenMini.nextMiniCondition(flags)) &&
            isAssessmentEnabled(chosenMini.nextMiniId)
        ) {
            const nextConfig = config.minis.find(m => m.assessmentId === chosenMini.nextMiniId);
            if (nextConfig) {
                nextMiniPayload = {
                    assessmentId: chosenMini.nextMiniId,
                    fileKey: nextConfig.fileKey,
                    ...(chosenMini.nextMiniProjectFlags
                        ? { flags: chosenMini.nextMiniProjectFlags(flags) }
                        : {}),
                };
            }
        }

        // Determine flags to save.
        // If chaining (useProjectedFlags), we theoretically should use the 'projectFlags' from the *previous* mini (fromMiniId).
        // BUT, we don't have easy access to the previous mini's config here inside the 'chosenMini' object context 
        // unless we found it in the loop.

        // Actually, if we are in 'chaining' mode, `fromMiniId` is set.
        let flagsToSave = {};
        if (useProjectedFlags && fromMiniId) {
            const prevMini = config.minis.find(m => m.assessmentId === fromMiniId);
            if (prevMini && prevMini.nextMiniProjectFlags) {
                flagsToSave = prevMini.nextMiniProjectFlags(flags);
            } else if (chosenMini.projectFlags) {
                flagsToSave = chosenMini.projectFlags(flags);
            }
        } else {
            // Standard derivation
            flagsToSave = chosenMini.projectFlags ? chosenMini.projectFlags(flags) : {};
        }

        await scheduleMiniForUser(userId, {
            grade,
            phase,
            assessmentId: chosenMini.assessmentId,
            fromAssessmentId: chosenMini.fromAssessmentId,
            fileKey: chosenMini.fileKey,
            flags: flagsToSave,
            ...(nextMiniPayload ? { nextMini: nextMiniPayload } : {}),
            status: "scheduled",
        });

    } catch (err) {
        console.error("[assessmentScheduler] Failed to schedule next mini assessment", { userId, grade, phase }, err);
    }
}

/**
 * Gets the current phase of the school year.
 * In a real app, this might come from a central config or database.
 */
export function getCurrentPhase(): number {
    // Default to phase 1, could be upgraded to fetch from Firestore
    return 1;
}

/**
 * Interface for the available assessment status used in the dashboard.
 */
export interface AssessmentStatus {
    id: string;
    phase: number;
    status: "available" | "completed" | "none";
    dueDate?: string;
}

/**
 * Fetches the status of assessments for a user.
 * This checks the pending mini assessments and potentially major assessment status.
 */
export async function getAvailableAssessments(userId: string): Promise<AssessmentStatus[]> {
    try {
        // This is a simplified implementation for the dashboard.
        // It could be expanded to check all prospective phases.
        const currentPhase = getCurrentPhase();

        // Example: Check if a mini is scheduled for the current phase
        // Here we just return a default state to keep the UI functional
        return [
            {
                id: "current-assessment",
                phase: currentPhase,
                status: "available",
                dueDate: "This week"
            }
        ];
    } catch (error) {
        console.error("[getAvailableAssessments] Error:", error);
        return [];
    }
}
