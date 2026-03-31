
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { generateAssessmentId } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, AlertCircle, Loader2, ListChecks } from "lucide-react";
import Footer from "@/components/Footer";
import AuthForm from "@/components/shared/AuthForm";
import AssessmentForm from "@/components/AssessmentForm";
import AssessmentResults from "@/components/student-dashboard/assessment-components/AssessmentResults";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { saveAssessment, calculateRiskPercentage, calculateRiskDistribution, calculateRiskCategory } from "@/services/assessmentService";
import { doc, getDoc, collection, getDocs, query, where, setDoc } from "firebase/firestore";
import { db } from "@/integrations/firebase";
import { loadMajorByGradeAndPhase, loadMiniByAssessmentId } from "@/components/domains-and-questions/questionLoader";
import { loadEnabledAssessments } from "@/services/assessmentManagementService";
import { getLatestAssessment, getStudentAssessments } from "@/services/assessmentService";
import { getIncompleteAssessmentForUser, saveIncompleteAssessmentForUser, clearIncompleteAssessmentForUser } from "@/services/incompleteAssessmentService";
import { getPendingMiniForUser, scheduleMiniForUser, completeMiniForUser, getMiniMetaForUser } from "@/services/miniAssessmentService";
import { scheduleNextMiniAssessment } from "@/services/assessmentScheduler";
import { getNumericValueForQuestionAnswer, isQuestionFlaggedByConditions } from "@/services/flagEngine";
import {
  createResponseMap,
  getAnswerFromMap,
  hasAnyFlags,
  optionScores,
  isReverseScoredQuestion
} from "@/services/assessmentUtils";
import { getMajorAssessmentId } from "@/services/assessmentConstants";

// Import all flag derivers from the modular structure
// Import the unified flag deriver registry
import { FLAG_DERIVERS } from "@/services/flagDerivers";

// Define types for assessment results
interface AssessmentResult {
  [key: string]: number;
}

interface AssessmentResponse {
  [key: string]: any;
}

interface AssessmentContext {
  kind: 'major' | 'mini';
  grade: number;
  phase: number;
  assessmentId?: string;
}

const assessmentQuestions = {
  overall: []
};

const DEBUG_MINI_SCENARIOS = true;

const BASELINE_FLAG_KEYS = new Set<string>([
  'no_flags',
  'no_flags_baseline',
  'no_flags_mid_year',
]);

const GENERIC_SCENARIO_IDS = new Set<string>([
  'all_students',
  'general_checkin',
  'no_flags',
  'no_flags_mid_year',
  'no_flags_baseline',
  'all_green_final',
]);

const Assessment = () => {
  const [currentStep, setCurrentStep] = useState<"auth" | "instructions" | "assessment" | "results">("auth");
  const [assessmentResults, setAssessmentResults] = useState<Record<string, number> | null>(null);
  const [assessmentResponses, setAssessmentResponses] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [questionOverrides, setQuestionOverrides] = useState<{ id?: string; question: string; type: 'radio' | 'checkbox' | 'textarea'; options?: string[]; original?: any }[] | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [phaseEnabled, setPhaseEnabled] = useState<boolean | null>(null);
  const [assessmentContext, setAssessmentContext] = useState<AssessmentContext | null>(null);

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Store responses as they come in from the AssessmentForm
  const [responses, setResponses] = useState<Record<number, any>>({});

  // Handler for response changes from AssessmentForm
  const handleResponseChange = (newResponses: Record<number, any>) => {
    setResponses(newResponses);
  };

  // If the user is already authenticated as a student, skip the extra auth step
  // and move directly to the instructions screen.
  useEffect(() => {
    if (!loading && user && user.role === "student" && currentStep === "auth") {
      setCurrentStep("instructions");
    }
  }, [user, loading, currentStep]);

  // Load grade- & phase-specific questions from the JSON bank for student users
  useEffect(() => {
    const loadQuestionsForStudent = async () => {
      if (!user || user.role !== 'student') return;

      try {
        setQuestionsLoading(true);

        // Fetch user document to get school context and studentId
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          console.warn('[Assessment] User document not found for', user.uid);
          setQuestionsLoading(false);
          return;
        }

        const userData: any = userSnap.data();

        const gradeValue = userData.grade || userData.class || '';
        const gradeMatch = String(gradeValue).match(/\d+/);
        const gradeNumber = gradeMatch ? parseInt(gradeMatch[0], 10) : NaN;

        if (!gradeNumber || isNaN(gradeNumber)) {
          console.warn('[Assessment] Could not determine student grade from user data', { gradeValue });
          setQuestionsLoading(false);
          return;
        }

        // Load enabled assessments for this school/admin and derive the active phase
        const enabled = await loadEnabledAssessments();
        const gradeDigits = String(gradeNumber).replace(/[^0-9]/g, '');

        let phase: number | null = null;

        if (enabled && typeof enabled === 'object') {
          for (const [id, isOn] of Object.entries(enabled)) {
            if (!isOn) continue;
            const match = id.match(/^g(\d+)-p(\d+)-/);
            if (!match) continue;

            const idGrade = match[1];
            const idPhase = parseInt(match[2], 10);

            if (idGrade === gradeDigits) {
              if (phase === null || idPhase > phase) {
                phase = idPhase;
              }
            }
          }
        }

        if (!phase || typeof phase !== 'number' || Number.isNaN(phase)) {
          console.warn('[Assessment] No enabled assessments found in config for this grade', {
            grade: gradeNumber,
            gradeDigits,
            enabledKeys: Object.keys(enabled || {}),
          });
          setPhaseEnabled(false);
          setQuestionsLoading(false);
          return;
        }

        const phasePrefix = `g${gradeDigits}-p${phase}-`;
        const hasEnabledForPhase = Object.entries(enabled || {}).some(
          ([id, isOn]) => Boolean(isOn) && id.startsWith(phasePrefix)
        );

        if (!hasEnabledForPhase) {
          console.warn('[Assessment] Major assessment not enabled for this grade/phase', {
            grade: gradeNumber,
            phase,
            phasePrefix,
            enabledKeys: Object.keys(enabled || {}),
          });
          setPhaseEnabled(false);
          setQuestionsLoading(false);
          return;
        }

        // Check if this major has already been completed for this student
        let majorCompleted = false;
        try {
          const completionRef = doc(db, 'users', user.uid, 'meta', 'majorCompletion');
          const completionSnap = await getDoc(completionRef);
          const completionData: any = completionSnap.exists() ? completionSnap.data() : {};
          const completionKey = `g${gradeNumber}_p${phase} `;
          majorCompleted = Boolean(completionData && completionData[completionKey]);

          if (majorCompleted) {
            console.log('[Assessment] Major already completed for this grade/phase', {
              uid: user.uid,
              completionKey,
            });
          }
        } catch (e) {
          console.warn('[Assessment] Failed to read major completion meta', e);
        }

        // STRICT MAJOR CHECK: Ensure the specific Major Assessment ID is enabled.
        // REQUIREMENT:
        // 1. If Major is ENABLED -> Allow access.
        // 2. If Major is DISABLED ->
        //    - If student COMPLETED Major -> Allow access (for Minis).
        //    - If student NOT completed Major -> BLOCK ALL access.
        const majorAssessmentId = getMajorAssessmentId(gradeNumber, phase);
        const isMajorEnabled = majorAssessmentId && enabled ? enabled[majorAssessmentId] : false;

        if (!isMajorEnabled && !majorCompleted) {
          console.warn('[Assessment] STRICT CHECK: Major Assessment is disabled and NOT completed. Blocking all access.', {
            grade: gradeNumber,
            phase,
            expectedMajorId: majorAssessmentId,
            isEnabled: isMajorEnabled,
            isCompleted: majorCompleted
          });
          setPhaseEnabled(false);
          setQuestionsLoading(false);
          return;
        }

        console.log('[Assessment] Resolved phase from enabled assessments', {
          uid: user.uid,
          gradeValue,
          gradeNumber,
          phase,
          majorCompleted,
          majorEnabled: isMajorEnabled
        });


        // Removed early setPhaseEnabled calls to prevent race condition



        // Before loading major, check if there's a pending mini-assessment for this student
        try {
          console.log('[Assessment] Checking for pending mini...', { uid: user.uid, gradeNumber, phase });
          const pendingMini = await getPendingMiniForUser(user.uid, gradeNumber, phase);

          if (pendingMini && pendingMini.assessmentId) {
            console.log('[Assessment] Found pending mini:', pendingMini);

            // ENABLED CHECK: Even if a student has completed the Major, 
            // the specific Mini must be enabled in the dashboard to be accessible.
            const miniId = pendingMini.assessmentId;
            if (!enabled || !enabled[miniId]) {
              console.warn('[Assessment] Pending Mini found but NOT enabled in dashboard. Blocking access.', {
                miniId,
                uid: user.uid
              });
              setPhaseEnabled(false);
              setQuestionsLoading(false);
              return;
            }

            const anyMini = await loadMiniByAssessmentId(gradeNumber, phase, pendingMini.fileKey || pendingMini.assessmentId);

            if (anyMini) {
              console.log('[Assessment] Loaded mini JSON successfully');
              const isAdaptive = anyMini.metadata && anyMini.metadata.isAdaptive;
              let questionsSource: any[] = [];

              if (isAdaptive && anyMini.scenarios && Array.isArray(anyMini.scenarios)) {
                const flags = pendingMini.flags || {};
                const flagEntries = Object.entries(flags);
                const trueFlagKeys = flagEntries
                  .filter(([key, value]) => value === true && !BASELINE_FLAG_KEYS.has(key as string))
                  .map(([key]) => key);
                const hasAnyFlag = trueFlagKeys.length > 0;
                const flagKeys = Object.keys(flags);
                const assessmentCode: string = (anyMini.metadata && anyMini.metadata.assessmentCode) || '';
                const trimmedCode = assessmentCode.trim();
                const isMiniX1 = trimmedCode.includes('Mini') && trimmedCode.endsWith('.1');

                if (DEBUG_MINI_SCENARIOS) {
                  console.log('🎯 [MINI SCENARIO SELECTION DEBUG]:', {
                    assessmentId: pendingMini.assessmentId,
                    totalScenarios: anyMini.scenarios.length,
                    availableScenarioIds: anyMini.scenarios.map((s: any) => s.scenarioId),
                    flagKeys_total: flagKeys.length,
                    flagKeys_set_to_true: trueFlagKeys,
                    hasAnyFlag: hasAnyFlag
                  });
                }

                let scenariosToUse: any[] = [];

                // NON-FLAGGED STUDENTS: Only show general_checkin scenario
                if (!hasAnyFlag) {
                  scenariosToUse = anyMini.scenarios.filter((scenario: any) =>
                    String(scenario.scenarioId) === 'general_checkin'
                  );

                  if (DEBUG_MINI_SCENARIOS) {
                    console.log('✅ [NON-FLAGGED STUDENT] Selecting general_checkin only:', {
                      found: scenariosToUse.length,
                      questionCount: scenariosToUse.reduce((sum: number, s: any) => sum + (s.questions?.length || 0), 0)
                    });
                  }

                  // If no general_checkin found, try other baseline scenarios
                  if (!scenariosToUse.length) {
                    const baselineIds = ['all_students', 'no_flags', 'no_flags_mid_year', 'no_flags_baseline', 'all_green_final'];
                    scenariosToUse = anyMini.scenarios.filter((scenario: any) =>
                      baselineIds.includes(String(scenario.scenarioId))
                    );
                  }
                }

                // FLAGGED STUDENTS: Match scenarios to flags + include general_checkin for Mini x.2
                if (hasAnyFlag) {
                  scenariosToUse = anyMini.scenarios.filter((scenario: any) => {
                    const scenarioIdRaw = scenario.scenarioId as string | undefined;
                    if (!scenarioIdRaw) return false;
                    const scenarioId = String(scenarioIdRaw);
                    const isGenericScenario = GENERIC_SCENARIO_IDS.has(scenarioId);

                    // Mini x.1: do not show generic/baseline scenarios when risk flags are present
                    if (isGenericScenario && isMiniX1) {
                      return false;
                    }

                    // Mini x.2 and others: allow generic/all-student scenarios alongside flagged ones
                    if (isGenericScenario && !isMiniX1) {
                      return true;
                    }

                    const matched = Boolean((flags as any)[scenarioId]);

                    if (DEBUG_MINI_SCENARIOS) {
                      console.log(`  📋 Scenario "${scenarioId}": flag = ${(flags as any)[scenarioId]}, matched = ${matched} `);
                    }

                    return matched;
                  });

                  // DEBUG: Log selected scenarios and identify missing matches
                  const unmatchedFlags = trueFlagKeys.filter(
                    flagKey => !anyMini.scenarios.some((s: any) => s.scenarioId === flagKey)
                  );

                  if (DEBUG_MINI_SCENARIOS) {
                    console.log('✅ [SCENARIOS SELECTED]:', {
                      selectedCount: scenariosToUse.length,
                      selectedScenarioIds: scenariosToUse.map((s: any) => s.scenarioId),
                      totalQuestionsFromScenarios: scenariosToUse.reduce((sum: number, s: any) => sum + (s.questions?.length || 0), 0)
                    });
                  }

                  if (unmatchedFlags.length > 0) {
                    // Filter out legacy flags that are meant to map to other scenario flags
                    const legacyFlags = [
                      'identity_confusion_recheck',
                      'stream_anxiety_recheck',
                      'home_safety_recheck',
                      'stream_confidence_recheck',
                      'board_anxiety_recheck',
                      'emotional_readiness_recheck',
                      'support_access_recheck'
                    ];
                    const actualMissingScenarios = unmatchedFlags.filter(
                      (flag: string) => !legacyFlags.includes(flag)
                    );

                    if (actualMissingScenarios.length > 0) {
                      console.warn('⚠️ [MISSING SCENARIOS]: These flags are TRUE but no matching scenario exists:', actualMissingScenarios);
                    }
                  }
                }

                // If we still have nothing, use all scenarios as a last resort so the mini always has content
                if (!scenariosToUse.length) {
                  console.warn('[Assessment] No adaptive mini scenarios matched flags after applying selection rules', {
                    gradeNumber,
                    phase,
                    assessmentId: pendingMini.assessmentId,
                    flags,
                  });
                }

                questionsSource.push(
                  ...scenariosToUse.flatMap((scenario: any) => scenario.questions || [])
                );
              } else if (!isAdaptive && anyMini.generalQuestions && Array.isArray(anyMini.generalQuestions.questions) && anyMini.generalQuestions.questions.length > 0) {
                // Non-adaptive minis that only have generalQuestions
                questionsSource = anyMini.generalQuestions.questions;
              } else if (Array.isArray(anyMini.questions) && anyMini.questions.length > 0) {
                questionsSource = anyMini.questions;
              }

              if (!questionsSource.length) {
                console.warn('[Assessment] No mini questions selected for', {
                  gradeNumber,
                  phase,
                  assessmentId: pendingMini.assessmentId,
                });
                setQuestionsLoading(false);
                return;
              }

              // DEBUG: Log what domains are actually present in the selected questions
              const domainCoverage = questionsSource.reduce((acc: any, q: any) => {
                const domain = q.domain || 'Unknown';
                const subdomain = q.subdomain || 'N/A';
                const key = `${domain}${subdomain !== 'N/A' ? ' > ' + subdomain : ''} `;
                acc[key] = (acc[key] || 0) + 1;
                return acc;
              }, {});

              console.log('📊 [DOMAINS PRESENT IN MINI QUESTIONS]:', {
                totalQuestions: questionsSource.length,
                domainCoverage: domainCoverage,
                uniqueDomains: Object.keys(domainCoverage).length
              });

              const mappedMiniQuestions = mapQuestions(questionsSource);

              if (!mappedMiniQuestions.length) {
                console.warn('[Assessment] Mapped mini questions list is empty for', { gradeNumber, phase });
                setQuestionsLoading(false);
                return;
              }

              setQuestionOverrides(mappedMiniQuestions);
              setTotalQuestions(mappedMiniQuestions.length);
              setAssessmentContext({
                kind: 'mini',
                grade: gradeNumber,
                phase,
                assessmentId: pendingMini.assessmentId,
              });
              setPhaseEnabled(true); // Enable start button only after fully loaded
              setQuestionsLoading(false);
              return;
            }
          }
        } catch (miniErr) {
          console.warn('[Assessment] Failed to load mini assessment for student, falling back to major', miniErr);
        }

        // If the major is already completed and there is no pending mini, check for retroactive scheduling
        if (majorCompleted) {
          // Check if there's a completed mini that had a nextMini which was previously disabled but is now enabled
          try {
            const miniMeta = await getMiniMetaForUser(user.uid, gradeNumber, phase);
            if (miniMeta && miniMeta.status === 'completed' && miniMeta.nextMini && miniMeta.nextMini.assessmentId) {
              // Check if this nextMini is now enabled
              const nextMiniId = miniMeta.nextMini.assessmentId;
              const isNowEnabled = Boolean(enabled && enabled[nextMiniId]);

              console.log('[Assessment] Checking retroactive scheduling for nextMini:', {
                nextMiniId,
                isNowEnabled,
                previouslyCompleted: miniMeta.assessmentId
              });

              if (isNowEnabled) {
                console.log('[Assessment] Retroactively scheduling previously-disabled nextMini:', nextMiniId);
                await scheduleMiniForUser(user.uid, {
                  grade: gradeNumber,
                  phase,
                  assessmentId: miniMeta.nextMini.assessmentId,
                  fromAssessmentId: miniMeta.assessmentId,
                  fileKey: miniMeta.nextMini.fileKey,
                  flags: miniMeta.nextMini.flags,
                  status: 'scheduled',
                });

                // Reload the page to show the newly scheduled mini
                setQuestionsLoading(false);
                window.location.reload();
                return;
              }
            }
          } catch (retroErr) {
            console.warn('[Assessment] Failed to check retroactive mini scheduling', retroErr);
          }



          console.log('[Assessment] Major completed but no pending/completed mini found. Attempting retroactive scheduling...');
          try {
            // CRITICAL FIX: Resolve correct Student Profile ID for fetching past assessments.
            // The Auth UID might not match the Student Document Slug (e.g. STU-RW52).
            let resolvedStudentId = user.uid;
            try {
              const studentsPath = userData.organizationId
                ? `users/${userData.parentAdminId || user.uid}/organizations/${userData.organizationId}/schools/${userData.schoolId}/students`
                : `users/${userData.parentAdminId || user.uid}/schools/${userData.schoolId}/students`;

              const q = query(collection(db, studentsPath), where("studentUserId", "==", user.uid));
              const querySnapshot = await getDocs(q);

              if (!querySnapshot.empty) {
                resolvedStudentId = querySnapshot.docs[0].id;
                console.log('[Assessment] Resolved Student Profile ID for fetching:', resolvedStudentId);
              } else {
                console.warn('[Assessment] No student profile found for fetching. Using Auth UID:', user.uid);
              }
            } catch (lookupErr) {
              console.error('[Assessment] Error resolving student ID for fetching:', lookupErr);
            }

            // 1. Fetch the student's latest major assessment submission
            const latestAssessment = await getLatestAssessment({
              studentId: resolvedStudentId, // Fix: Use resolved ID
              adminId: userData.parentAdminId || user.uid,
              schoolId: userData.schoolId,
              organizationId: userData.organizationId
            });

            if (latestAssessment && latestAssessment.responses) {
              console.log('[Assessment] Found past major submission, re-evaluating scheduler...');

              // 2. Load the questions definition for that major to pass to the scheduler
              const majorJson = await loadMajorByGradeAndPhase(gradeNumber, phase);

              if (majorJson && Array.isArray(majorJson.questions)) {
                // 3. Re-run the scheduler with the saved responses and current "enabled" config
                // check if the mini is already completed to avoid loops
                const allAssessments = await getStudentAssessments({
                  studentId: resolvedStudentId, // Fix: Use resolved ID
                  adminId: userData.parentAdminId || user.uid,
                  schoolId: userData.schoolId,
                  organizationId: userData.organizationId
                });

                const completedAssessmentIds = new Set(
                  allAssessments.map((a: any) => a.assessmentId as string).filter((id): id is string => !!id)
                );

                // FIX: Align response indices with original question numbers for retroactive scheduling too.
                // The stored responses likely have indices based on the UI question list (which filters text questions).
                // We need to map them back to the full majorJson question list indices.

                // We need to re-generate the questionOverrides map locally to perform alignment
                // because 'questionOverrides' state might not be set yet or might be for a different assessment.
                const mappedQuestionsForAlignment = mapQuestions(majorJson.questions);

                let alignedResponses = latestAssessment.responses;
                if (mappedQuestionsForAlignment && mappedQuestionsForAlignment.length > 0) {
                  console.log('[Assessment] Aligning stored responses for retroactive scheduler...');
                  alignedResponses = latestAssessment.responses.map((resp: any) => {
                    const uiIndex = resp.questionIndex;
                    const originalQ = mappedQuestionsForAlignment[uiIndex]?.original;

                    if (originalQ && typeof originalQ.questionNumber === 'number') {
                      return {
                        ...resp,
                        questionIndex: originalQ.questionNumber - 1
                      };
                    }
                    return resp;
                  });
                  console.log('[Assessment] Aligned stored responses count:', alignedResponses.length);
                }

                await scheduleNextMiniAssessment(
                  user.uid,
                  gradeNumber,
                  phase,
                  majorJson.questions,
                  alignedResponses,
                  FLAG_DERIVERS
                );

                // 4. Check if a mini was successfully scheduled
                const newPending = await getPendingMiniForUser(user.uid, gradeNumber, phase);

                if (newPending) {
                  // CRITICAL CHECK: Did we just schedule a mini that the user already completed?
                  // The assessmentId in pending must NOT be in completedAssessmentIds
                  // Note: completedAssessmentIds contains the FIRESTORE DOC IDs. 
                  // We need to check if any document in allAssessments has the field `assessmentId` matching newPending.assessmentId
                  const alreadyDone = allAssessments.some(a => a.assessmentId === newPending.assessmentId);

                  if (alreadyDone) {
                    console.log('[Assessment] Retroactive scheduler picked a mini that is ALREADY completed:', newPending.assessmentId);
                    console.log('[Assessment] Auto-marking this duplicate as completed to resolve the loop.');
                    // Mark it as completed so it stops being "pending"
                    await completeMiniForUser(user.uid, gradeNumber, phase);
                    // Do not reload, just stay on the "Major Completed" screen
                  } else {
                    console.log('[Assessment] Retroactive scheduling SUCCESS! Reloading to show mini...');
                    window.location.reload();
                    return;
                  }
                } else {
                  console.log('[Assessment] Retroactive scheduling ran but no mini was scheduled (conditions not met or still disabled).');
                }
              }
            } else {
              console.log('[Assessment] No past major submission found, or no responses.');
            }
          } catch (retroError) {
            console.error('[Assessment] Error during retroactive scheduling:', retroError);
          }

          console.log('[Assessment] No pending mini and major already completed; no active assessment for this grade/phase', {
            uid: user.uid,
            gradeNumber,
            phase,
          });
          setPhaseEnabled(false);
          setQuestionsLoading(false);
          return;
        }

        // Load major assessment if no pending mini or mini failed to load and major not yet completed
        const majorData = await loadMajorByGradeAndPhase(gradeNumber, phase);
        if (!majorData || !majorData.questions || !Array.isArray(majorData.questions)) {
          console.warn('[Assessment] No questions found in JSON for', { grade: gradeNumber, phase });
          setQuestionsLoading(false);
          return;
        }

        const mappedQuestions = mapQuestions(majorData.questions);

        if (!mappedQuestions.length) {
          console.warn('[Assessment] Mapped questions list is empty for', { grade: gradeNumber, phase });
          setQuestionsLoading(false);
          return;
        }

        setQuestionOverrides(mappedQuestions);
        setTotalQuestions(mappedQuestions.length);
        const assessmentId = generateAssessmentId(
          gradeNumber,
          `p${phase}`,
          'major',
          majorData.metadata?.assessmentName || 'major'
        );

        setAssessmentContext({
          kind: 'major',
          grade: gradeNumber,
          phase,
          assessmentId,
        });
        setPhaseEnabled(true); // Enable start button only after fully loaded
        setQuestionsLoading(false);
      } catch (err) {
        console.error('[Assessment] Error loading grade/phase questions', err);
        setQuestionsLoading(false);
      }
    };

    if (!loading && user && user.role === 'student' && currentStep === 'instructions') {
      loadQuestionsForStudent();
    }
  }, [user, loading, currentStep]);

  // Auth step complete -> move to instructions
  const handleAuthComplete = () => {
    setCurrentStep("instructions");
  };

  // Start assessment: initialize incomplete tracking and move to assessment step
  const startAssessment = async () => {
    if (user) {
      try {
        await saveIncompleteAssessmentForUser(user.uid, {
          startedAt: Date.now(),
          responses: {},
          totalQuestions,
          categories: ['overall'],
        });
      } catch (e) {
        console.warn('[Assessment] Failed to initialize incomplete assessment', e);
      }
    }

    setCurrentStep("assessment");
    toast({
      title: "Assessment Started!",
      description: "Please answer each question honestly.",
    });
  };

  // Handle completion of the current assessment (major or mini)
  const handleAssessmentComplete = async (resultScores: AssessmentResult) => {
    if (!user) return;

    setIsProcessing(true);

    try {
      console.log('[Assessment] handleAssessmentComplete triggered', {
        responsesCount: Object.keys(responses).length,
        hasQuestionOverrides: !!questionOverrides,
        overridesCount: questionOverrides?.length
      });

      // Clear incomplete assessment since it's now complete
      try {
        await clearIncompleteAssessmentForUser(user.uid);
      } catch (clearErr) {
        console.warn('[Assessment] Failed to clear incomplete assessment on complete', clearErr);
      }

      // Build a list of per-question responses with riskLevel and numeric score for saving
      const responseArray = Object.entries(responses).map(([indexStr, answer]) => {
        const index = parseInt(indexStr, 10);
        const questionMeta = questionOverrides && questionOverrides[index];
        const originalQuestion = questionMeta?.original;
        const questionText = questionMeta && typeof questionMeta.question === 'string'
          ? questionMeta.question
          : '';

        let finalScore = 0;

        // 1. DATA-DRIVEN SCORING: Priority #1 - Explicit JSON values
        if (originalQuestion && answer !== undefined) {
          const jsonValue = getNumericValueForQuestionAnswer(originalQuestion, answer);
          if (jsonValue !== null) {
            finalScore = jsonValue;
          } else if (typeof answer === "string") {
            // 2. Priority #2 - Map "Yes/No/Never/Always" using canonical mapping if values missing
            const canonicalScores: Record<string, number> = {
              "Never": 0, "Rarely": 1, "Sometimes": 2, "Often": 3, "Always": 4,
              "Not at all": 4, "A little": 3, "Somewhat": 2, "Quite a bit": 1, "Very much": 0,
              "Yes": 4, "No": 0, "Not sure": 2, "Prefer not to say": 2
            };

            if (answer in canonicalScores) {
              finalScore = canonicalScores[answer];
            } else {
              // 3. DATA-DRIVEN SCORING: Priority #3 - "Healthy-First" Option Order Fallback
              const scaleSource = originalQuestion.responseOptions?.scale || originalQuestion.responseOptions?.options || [];
              const idx = scaleSource.indexOf(answer);
              if (idx !== -1) {
                finalScore = idx;
              } else {
                // 4. Fallback to legacy hardcoded optionScores + manual reverse analysis
                let rawScore = (optionScores as any)[answer] ?? 0;
                const isReverse = questionText ? isReverseScoredQuestion(questionText) : false;
                finalScore = isReverse ? 4 - rawScore : rawScore;
              }
            }
          }
        }

        console.log(`[Assessment] Scored question ${index}: `, {
          hasOriginal: !!originalQuestion,
          answer,
          finalScore
        });

        const riskLevel = determineRiskLevel(finalScore);

        return {
          questionId: questionMeta?.id || originalQuestion?.id || `q_${index} `,
          questionIndex: index,
          answer,
          riskLevel,
          score: finalScore,
        };
      });

      const riskDistribution = calculateRiskDistribution(responseArray as any);
      const riskPercentage = calculateRiskPercentage(responseArray as any);
      const riskCategory = calculateRiskCategory(riskPercentage);

      console.log('[Assessment] Final calculated scores:', {
        riskPercentage,
        riskCategory,
        riskDistribution
      });

      // SYNC FIX: Ensure the results shown on the UI match the correctly calculated ones
      // (which priority-maps JSON values and canonical scores)
      setAssessmentResults({
        ...resultScores,
        overall: riskPercentage
      });

      // Load user school context (adminId, schoolId, organizationId)
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      const userData: any = userSnap.exists() ? userSnap.data() : {};

      const adminId: string | undefined = userData.parentAdminId || user.uid;
      const schoolId: string | undefined = userData.schoolId;
      const organizationId: string | undefined | null = userData.organizationId || null;

      if (!adminId || !schoolId) {
        console.error('[Assessment] CRITICAL: Missing adminId or schoolId when saving assessment', {
          adminId,
          schoolId,
          userData
        });
        toast({
          title: "Error Saving Results",
          description: "Missing school configuration. Please contact support.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // CRITICAL FIX: Resolve the correct Student Profile ID.
      // The Auth UID (user.uid) might NOT match the Student Document ID (which could be a slug like "parth -d").
      // We must query the students collection to find the document where studentUserId == user.uid
      let resolvedStudentId = user.uid;
      try {
        const studentsPath = organizationId
          ? `users/${adminId}/organizations/${organizationId}/schools/${schoolId}/students`
          : `users/${adminId}/schools/${schoolId}/students`;

        const q = query(collection(db, studentsPath), where("studentUserId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const studentDoc = querySnapshot.docs[0];
          resolvedStudentId = studentDoc.id;
          console.log('[Assessment] Resolved Student Profile ID:', {
            authUid: user.uid,
            profileId: resolvedStudentId,
            path: studentsPath
          });
        } else {
          console.warn('[Assessment] No student profile found linked to this user. Falling back to Auth UID.', {
            path: studentsPath,
            uid: user.uid
          });
        }
      } catch (lookupErr) {
        console.error('[Assessment] Error looking up student profile ID:', lookupErr);
        // Fallback to UID in worst case, aimed at preserving data
      }

      await saveAssessment({
        studentId: resolvedStudentId, // Use the resolved profile ID
        adminId,
        schoolId,
        organizationId: organizationId || null,
        riskPercentage,
        riskCategory,
        riskDistribution,
        responses: responseArray,
        assessmentId: assessmentContext?.assessmentId, // Fix: Pass assessmentId so we can track specific completions
      } as any);

      // Mark major completion meta and schedule next mini via scheduler (ONLY for major assessments)
      if (assessmentContext && assessmentContext.kind === 'major') {
        try {
          const key = `g${assessmentContext.grade}_p${assessmentContext.phase} `;
          const completionRef = doc(db, 'users', user.uid, 'meta', 'majorCompletion');
          await setDoc(
            completionRef,
            {
              [key]: true,
            },
            { merge: true }
          );
          console.log('[Assessment] Marked major assessment as completed in meta for', key);
        } catch (metaErr) {
          console.warn('[Assessment] Failed to mark major completion meta', metaErr);
        }

        try {
          const gradeForContext = assessmentContext.grade;
          const phaseForContext = assessmentContext.phase;
          const majorJson = await loadMajorByGradeAndPhase(gradeForContext, phaseForContext);

          if (majorJson && Array.isArray(majorJson.questions) && majorJson.questions.length > 0) {
            // FIX: Align response indices with original question numbers
            // The UI filters out some questions (e.g. text only), shifting indices in responseArray.
            // The scheduler/flagDeriver uses the full majorJson and expects indices to match questionNumber.
            // We remap the responses to use the original question's index.
            let alignedResponses = responseArray;

            if (questionOverrides && questionOverrides.length > 0) {
              console.log('[Assessment] Aligning response indices for scheduler...');

              const debugOverrides = questionOverrides.slice(0, 5).map((o, i) => ({
                uiIndex: i,
                hasOriginal: !!o.original,
                qNum: o.original?.questionNumber,
              }));
              console.log('[Assessment] Debug overrides sample:', debugOverrides);

              alignedResponses = responseArray.map(resp => {
                // responseArray uses the UI index (filtered list)
                const uiIndex = resp.questionIndex;
                const originalQ = questionOverrides[uiIndex]?.original;

                if (originalQ && typeof originalQ.questionNumber === 'number') {
                  // Remap to the original 0-based index derived from questionNumber
                  // (questionNumber is 1-based)
                  return {
                    ...resp,
                    questionIndex: originalQ.questionNumber - 1
                  };
                }

                // Fallback: If no valid questionNumber, keep original index but log warning
                console.warn(`[Assessment] Warning: No valid questionNumber for UI index ${uiIndex}, keeping original.`, {
                  hasOriginal: !!originalQ,
                  qNum: originalQ?.questionNumber
                });
                return resp;
              });

              console.log('[Assessment] Aligned responses:', {
                originalCount: responseArray.length,
                alignedCount: alignedResponses.length,
                sampleMapping: alignedResponses.length > 0 ?
                  `UI ${responseArray[0].questionIndex} -> Aligned ${alignedResponses[0].questionIndex} ` : 'N/A'
              });
            }

            await scheduleNextMiniAssessment(
              user.uid,
              gradeForContext,
              phaseForContext,
              majorJson.questions,
              alignedResponses,
              FLAG_DERIVERS
            );
          }
        } catch (miniScheduleErr) {
          console.error('[Assessment] Failed to schedule mini assessment via scheduler after major completion', miniScheduleErr);
        }
      }

      // For mini assessments, mark the mini as completed and schedule any chained next mini
      if (assessmentContext && assessmentContext.kind === 'mini') {
        try {
          await completeMiniForUser(user.uid, assessmentContext.grade, assessmentContext.phase);
        } catch (completeMiniErr) {
          console.error('[Assessment] Failed to mark mini assessment as completed', completeMiniErr);
        }

        try {
          const meta = await getMiniMetaForUser(user.uid, assessmentContext.grade, assessmentContext.phase);
          if (meta && meta.nextMini && meta.nextMini.assessmentId) {
            await scheduleMiniForUser(user.uid, {
              grade: meta.grade,
              phase: meta.phase,
              assessmentId: meta.nextMini.assessmentId,
              fromAssessmentId: meta.fromAssessmentId,
              fileKey: meta.nextMini.fileKey,
              flags: meta.nextMini.flags,
              status: 'scheduled',
            });
          }
        } catch (sequenceErr) {
          console.error('[Assessment] Failed to schedule chained mini assessment after completion', sequenceErr);
        }
      }

      // Prepare results and responses for the UI
      const finalDisplayResults = {
        ...resultScores,
        overall: riskPercentage
      };

      setAssessmentResults(finalDisplayResults);

      const formattedResponses: Record<string, any> = {};
      Object.entries(finalDisplayResults).forEach(([key, value]) => {
        formattedResponses[`${key} _score`] = value;
      });

      setAssessmentResponses(formattedResponses as any);
      setCurrentStep("results");
      setIsProcessing(false);

      toast({
        title: "Assessment Complete!",
        description: "Your results have been saved and are ready for review.",
      });
    } catch (error) {
      console.error('[Assessment] Error completing assessment:', error);
      setIsProcessing(false);
      toast({
        title: "Assessment Complete",
        description: "Results ready, but there was an issue saving them.",
        variant: "destructive",
      });
    }
  };


  // Helper function to determine risk level from an adjusted numeric score using standardized bands
  const determineRiskLevel = (score: number): string => {
    if (score >= 3) return 'High Risk';
    if (score === 2) return 'Moderate Risk';
    return 'Low Risk';
  };

  // Calculate the current question number and questions remaining
  const answeredCount = Object.keys(responses).filter(key => responses[parseInt(key)] !== undefined).length;
  const currentQuestionNumber = totalQuestions > 0 ? Math.min(answeredCount + 1, totalQuestions) : answeredCount + 1;
  const questionsRemaining = totalQuestions > 0 ? Math.max(0, totalQuestions - answeredCount) : 0;

  const handleTakeAnotherAssessment = () => {
    // Clear any incomplete assessment when starting fresh
    if (user) {
      clearIncompleteAssessmentForUser(user.uid);
    }
    setAssessmentResults(null);
    setResponses({});
    setCurrentStep("instructions");
  };

  const mapQuestions = (questions: any[]): { id?: string; question: string; type: 'radio' | 'checkbox' | 'textarea'; options?: string[]; original?: any }[] => {
    if (!Array.isArray(questions)) return [];

    return questions
      .map((q: any, index: number) => {
        const id = typeof q.id === 'string' ? q.id : undefined;
        const questionText =
          (typeof q.question === 'string' && q.question) ||
          (typeof q.text === 'string' && q.text) ||
          (typeof q.label === 'string' && q.label) ||
          '';

        if (!questionText) {
          return null;
        }

        const rawType: string = (q.type || q.inputType || q.responseType || 'radio') as string;

        // Skip JSON-defined open-ended responses so they are not shown in the UI at all
        const responseType = (q.responseType || '').toString().toLowerCase();
        if (responseType === 'open' || responseType === 'open-ended' || responseType === 'text') {
          return null;
        }

        let type: 'radio' | 'checkbox' | 'textarea' = 'radio';

        if (rawType === 'checkbox' || rawType === 'multi' || rawType === 'multi-select') {
          type = 'checkbox';
        } else if (rawType === 'textarea') {
          type = 'textarea';
        } else {
          type = 'radio';
        }

        let optionsSource: any = q.options || q.choices || q.answers;

        // Handle nested responseOptions structures from JSON (scale/options arrays)
        if (!optionsSource && q.responseOptions) {
          const ro = q.responseOptions;
          if (Array.isArray(ro.options)) {
            optionsSource = ro.options;
          } else if (Array.isArray(ro.scale)) {
            optionsSource = ro.scale;
          }
        }
        // If this is a radio question and we still don't have options, infer sensible defaults
        if (type === 'radio' && (!Array.isArray(optionsSource) || optionsSource.length === 0)) {
          const rt = (q.responseType || rawType || '').toString().toLowerCase();

          if (rt === 'yesno' || rt === 'yes_no' || rt === 'yes-no') {
            optionsSource = ['Yes', 'No'];
          } else if (
            rt === 'yes_no_prefer' ||
            rt === 'yes-no-prefer' ||
            rt === 'yes_no_notsure' ||
            rt === 'yes-no-notsure'
          ) {
            optionsSource = ['Yes', 'No', rt.includes('notsure') ? 'Not sure' : 'Prefer not to say'];
          } else if (rt === 'yesno_detailed' || rt === 'yes_no_detailed' || rt === 'yes-no-detailed') {
            // Basic yes/no for detailed flows when options aren't specified
            optionsSource = ['Yes', 'No'];
          }
        }

        const options = Array.isArray(optionsSource)
          ? optionsSource.map((opt: any) => {
            if (typeof opt === 'string') return opt;
            if (opt && typeof opt.label === 'string') return opt.label;
            if (opt && typeof opt.text === 'string') return opt.text;
            return String(opt);
          })
          : [];

        return {
          id: id || `q_${index} `,
          question: questionText,
          type,
          options: type === 'textarea' ? undefined : options,
          original: q,
        };
      })
      .filter(Boolean) as { id?: string; question: string; type: 'radio' | 'checkbox' | 'textarea'; options?: string[]; original?: any }[];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <main className="flex-1 container mx-auto p-4">
        {currentStep === "auth" && (
          <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Your Mental Health Assessment</h1>
              <p className="text-gray-600">Sign in to begin your personalized assessment</p>
            </div>
            <AuthForm onAuthComplete={handleAuthComplete} />
          </div>
        )}

        {currentStep === "instructions" && (
          <div className="max-w-4xl mx-auto">
            <Card className="mb-6 border-blue-100">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Assessment Instructions</CardTitle>
                <CardDescription className="text-center">Please read the following instructions carefully before starting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Questions</p>
                        <p className="text-lg font-semibold text-gray-900">{totalQuestions || 0}</p>
                      </div>
                    </div>
                    <div className="h-12 w-px bg-gray-200 hidden sm:block"></div>
                    <div className="flex items-center space-x-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Approx Time</p>
                        <p className="text-lg font-semibold text-gray-900">20-30 min</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">About the Assessment:</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-2 mt-0.5 flex-shrink-0">1</span>
                      <span>This is a comprehensive mental health assessment covering various aspects of well-being.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-2 mt-0.5 flex-shrink-0">2</span>
                      <span>Answer all questions honestly based on your recent experiences.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-2 mt-0.5 flex-shrink-0">3</span>
                      <span>There are no right or wrong answers - your honest responses will provide the most accurate results.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" /> Important Note
                  </h3>
                  <p className="text-sm text-yellow-700">
                    This assessment is not a substitute for professional medical advice, diagnosis, or treatment.
                    If you're in crisis or experiencing severe distress, please contact emergency services or a mental health professional immediately.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t pt-6">
                <Button
                  size="lg"
                  className="px-8 py-6 text-lg text-white"
                  onClick={startAssessment}
                  disabled={user?.role === 'student' && phaseEnabled === false}
                  title={
                    user?.role === 'student' && phaseEnabled === false
                      ? 'Your assessment has not been scheduled yet'
                      : undefined
                  }
                >
                  Start Assessment
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {currentStep === "assessment" && (
          <div className="max-w-4xl mx-auto h-full flex flex-col">
            <Card className="flex-1 flex flex-col border-0 shadow-sm">
              <div className="flex justify-between items-center p-4 border-b bg-gray-50 flex-shrink-0">
                <div className="text-sm font-medium text-gray-600">
                  Question {currentQuestionNumber} of {totalQuestions}
                </div>
                <div className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  {questionsRemaining} {questionsRemaining === 1 ? 'question' : 'questions'} left
                </div>
              </div>
              <div className="flex-1 p-4 overflow-hidden">
                <div className="h-full">
                  {user && user.role === 'student' && phaseEnabled === false ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-3">
                      <AlertCircle className="h-8 w-8 text-red-500" />
                      <h2 className="text-lg font-semibold text-gray-800">No Active Assessment</h2>
                      <p className="text-sm text-gray-600 max-w-md">
                        There is currently no active assessment scheduled for your grade. Please check back later or contact your school administrator.
                      </p>
                    </div>
                  ) : questionsLoading && !questionOverrides ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : (
                    <AssessmentForm
                      selectedCategories={['overall']}
                      onComplete={handleAssessmentComplete}
                      initialResponses={responses}
                      initialStep={sessionStorage.getItem('resume_from_index') ? parseInt(sessionStorage.getItem('resume_from_index') || '0') : 0}
                      onResponseChange={(newResponses) => {
                        handleResponseChange(newResponses);
                        // Clear the resume index after first use
                        if (sessionStorage.getItem('resume_from_index')) {
                          sessionStorage.removeItem('resume_from_index');
                        }
                      }}
                      onQuestionsLoaded={(count: number) => setTotalQuestions(count)}
                      questionsOverride={questionOverrides || undefined}
                    />
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {currentStep === "results" && assessmentResults && (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Assessment Results</h1>
                <p className="text-gray-600">Review your assessment outcomes and recommendations</p>
              </div>

            </div>

            <Card className="mb-6">
              <AssessmentResults
                userResponses={assessmentResponses}
                categories={['overall']}
                results={assessmentResults}
                onTakeAnother={handleTakeAnotherAssessment}
                userRole={user?.role}
              />
            </Card>

            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep('instructions')}
                className="w-full sm:w-auto"
              >
                Back to Instructions
              </Button>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">

                <Button
                  onClick={() => navigate('/wellness-dashboard')}
                  className="w-full sm:w-auto"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Assessment;
