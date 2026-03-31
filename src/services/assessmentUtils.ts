/**
 * Assessment Utility Functions
 * 
 * This module provides shared utilities for assessment processing, flag derivation,
 * and response handling. All utilities are optimized for performance with O(1) or O(n)
 * complexity where possible.
 * 
 * @module assessmentUtils
 * @since 2.0.0
 */

// ===== TYPE DEFINITIONS =====

/**
 * Represents a single assessment question with all its metadata.
 * 
 * @interface AssessmentQuestion
 * @property {string} id - Unique identifier for the question
 * @property {string} domain - Primary domain (e.g., 'Academic', 'Social', 'Emotional')
 * @property {string} [subdomain] - Sub-classification within the domain
 * @property {string} question - The actual question text
 * @property {number} [questionNumber] - 1-indexed question number
 * @property {'radio'|'checkbox'|'textarea'|'scale'|'likert'} responseType - Type of response expected
 * @property {Object} responseOptions - Configuration for response options
 * @property {Record<string, string|number>} [flagConditions] - Conditions that trigger flags
 * @property {Object} [textAnalysis] - Text analysis configuration for open-ended responses
 */
export interface AssessmentQuestion {
    id: string;
    domain: string;
    subdomain?: string;
    question: string;
    questionNumber?: number;
    responseType: 'radio' | 'checkbox' | 'textarea' | 'scale' | 'likert';
    responseOptions: {
        type: string;
        options?: string[];
        scale?: string[];
        values?: number[];
    };
    flagConditions?: Record<string, string | number>;

}

/**
 * Represents a student's response to a single question.
 * 
 * @interface AssessmentResponse
 * @property {string} [questionId] - Stable question ID (primary key for new responses)
 * @property {number} [questionIndex] - 0-indexed position (kept for backward compat with old data)
 * @property {string|number|string[]} answer - The student's answer (supports arrays for checkboxes)
 * @property {number} [timestamp] - Unix timestamp when response was submitted
 */
export interface AssessmentResponse {
    questionId?: string;
    questionIndex?: number;
    answer: string | number | string[];
    timestamp?: number;
}

/**
 * Generic flag set type representing boolean flags for student concerns.
 * 
 * @type FlagSet
 * @example
 * const flags: FlagSet = {
 *   academic_recheck: true,
 *   social_isolation: false,
 *   no_flags_baseline: false
 * };
 */
export type FlagSet = Record<string, boolean>;

// ===== RESPONSE LOOKUP UTILITIES =====

/**
 * Creates a Map for O(1) response lookups by questionId (primary) or questionIndex (fallback).
 * 
 * New responses are keyed by `questionId` (stable, resilient to reordering).
 * Old responses without `questionId` are keyed by `__idx_{questionIndex}` for backward compatibility.
 * 
 * @param {AssessmentResponse[]} responsesArray - Array of student responses
 * @returns {Map<string, string|number|string[]>} Map from questionId or __idx_N to answer value
 * 
 * @example
 * // New format
 * const responses = [
 *   { questionId: 'G6_P1_M1_Q1', questionIndex: 0, answer: 'Yes' },
 *   { questionId: 'G6_P1_M1_Q3', questionIndex: 1, answer: 'Often' }
 * ];
 * const map = createResponseMap(responses);
 * console.log(map.get('G6_P1_M1_Q1')); // 'Yes'
 * 
 * // Old format (backward compat)
 * const oldResponses = [{ questionIndex: 0, answer: 'Yes' }];
 * const oldMap = createResponseMap(oldResponses);
 * console.log(oldMap.get('__idx_0')); // 'Yes'
 * 
 * @performance O(n) where n = number of responses
 * @see getAnswerFromMap
 */
export const createResponseMap = (
    responsesArray: AssessmentResponse[]
): Map<string, string | number | string[]> => {
    const map = new Map<string, string | number | string[]>();

    if (!Array.isArray(responsesArray)) {
        console.warn('createResponseMap: Invalid responsesArray, expected array');
        return map;
    }

    responsesArray.forEach((resp) => {
        if (resp && resp.questionId) {
            // New: ID-based (primary)
            map.set(resp.questionId, resp.answer);
        } else if (resp && typeof resp.questionIndex === 'number') {
            // Legacy: index-based (fallback)
            map.set(`__idx_${resp.questionIndex}`, resp.answer);
        }
    });

    return map;
};

/**
 * Gets the answer for a specific question from a pre-built response map.
 * 
 * Lookup priority:
 * 1. Try `question.id` → direct ID-based lookup (new format)
 * 2. Fall back to `__idx_{questionNumber-1}` → index-based lookup (old format)
 * 
 * @param {AssessmentQuestion|any} question - The question to get the answer for
 * @param {(AssessmentQuestion|any)[]} questions - Array of all questions (for fallback indexOf lookup)
 * @param {Map<string, string|number|string[]>} responseMap - Pre-built map of questionId or __idx_N → answer
 * @returns {string|number|string[]|null} The answer value or null if not found
 * 
 * @example
 * const responseMap = createResponseMap(responsesArray);
 * questions.forEach(q => {
 *   const answer = getAnswerFromMap(q, questions, responseMap); // O(1) lookup
 *   if (answer === 'Concerning') {
 *     flags.someFlag = true;
 *   }
 * });
 * 
 * @performance O(1) average case, O(n) worst case if questionNumber missing
 * @see createResponseMap
 */
export const getAnswerFromMap = (
    question: AssessmentQuestion | any,
    questions: (AssessmentQuestion | any)[],
    responseMap: Map<string, string | number | string[]>
): string | number | string[] | null => {
    if (!question) {
        return null;
    }

    // Try ID-based lookup first (new format)
    if (question.id) {
        const answer = responseMap.get(question.id);
        if (answer !== undefined) return answer;
    }

    // Fallback: index-based lookup (old format)
    let index: number;

    if (typeof question.questionNumber === 'number') {
        // questionNumber is 1-indexed, convert to 0-indexed
        index = question.questionNumber - 1;
    } else {
        // Fall back to array indexOf
        index = questions.indexOf(question);
    }

    if (index < 0) {
        return null;
    }

    const answer = responseMap.get(`__idx_${index}`);
    return answer !== undefined ? answer : null;
};

/**
 * Legacy function: Gets the answer for a specific question (original O(n) implementation).
 * 
 * **DEPRECATED**: This function is maintained for backward compatibility but is less efficient
 * than using `createResponseMap` + `getAnswerFromMap`. Use the optimized approach for new code.
 * 
 * @deprecated Use {@link createResponseMap} + {@link getAnswerFromMap} for better performance
 * @param {AssessmentQuestion|any} question - The question to get the answer for
 * @param {(AssessmentQuestion|any)[]} questions - Array of all questions
 * @param {(AssessmentResponse|any)[]} responsesArray - Array of all responses
 * @returns {string|number|string[]|null} The answer value or null if not found
 * 
 * @performance O(n) where n = number of responses (slower than getAnswerFromMap)
 */
export const getAnswerForQuestion = (
    question: AssessmentQuestion | any,
    questions: (AssessmentQuestion | any)[],
    responsesArray: AssessmentResponse[] | any[]
): string | number | string[] | null => {
    if (!question) {
        return null;
    }

    // Try ID-based lookup first (new format)
    if (question.id) {
        const resp = responsesArray.find((r: any) => r.questionId === question.id);
        if (resp) return resp.answer;
    }

    // Fallback: index-based lookup (old format)
    let index: number;

    if (typeof question.questionNumber === 'number') {
        // questionNumber is 1-indexed, convert to 0-indexed
        index = question.questionNumber - 1;
    } else {
        // Fall back to array indexOf
        index = questions.indexOf(question);
    }

    if (index < 0) {
        return null;
    }

    // Linear search (O(n)) - less efficient than using createResponseMap
    const resp = responsesArray.find((r: any) => r.questionIndex === index);
    return resp ? resp.answer : null;
};

// ===== FLAG UTILITIES =====

/**
 * Checks if any flags are set to true (excluding specified flags).
 * 
 * Useful for determining if `no_flags_baseline` should be set. By default,
 * excludes 'no_flags_baseline' itself from the check to prevent circular logic.
 * 
 * @param {Record<string, any>} flags - Object containing boolean flag values
 * @param {string[]} [excludeKeys=['no_flags_baseline']] - Array of flag keys to exclude from check
 * @returns {boolean} true if any non-excluded flag is true
 * 
 * @example
 * const flags = {
 *   academic_recheck: false,
 *   social_isolation: true,
 *   no_flags_baseline: false
 * };
 * console.log(hasAnyFlags(flags)); // true (social_isolation is flagged)
 * 
 * @example
 * // Exclude multiple flags
 * const hasRelevantFlags = hasAnyFlags(flags, ['no_flags_baseline', 'general_check']);
 */
export const hasAnyFlags = (
    flags: Record<string, any>,
    excludeKeys: string[] = ['no_flags_baseline']
): boolean => {
    return Object.entries(flags).some(
        ([key, value]) => !excludeKeys.includes(key) && value === true
    );
};

/**
 * Gets a default/empty flag object with all flags initialized to false.
 * 
 * @template T - Type extending Record<string, boolean>
 * @param {string[]} flagKeys - Array of flag key names
 * @returns {T} Object with all flags initialized to false
 * 
 * @example
 * const emptyFlags = getDefaultFlags<MiniFlagsG8P1>([
 *   'academic_recheck',
 *   'social_recheck',
 *   'no_flags_baseline'
 * ]);
 * // Result: { academic_recheck: false, social_recheck: false, no_flags_baseline: false }
 */
export const getDefaultFlags = <T extends Record<string, boolean>>(
    flagKeys: string[]
): T => {
    const flags: Record<string, boolean> = {};
    flagKeys.forEach((key) => {
        flags[key] = false;
    });
    return flags as T;
};

// ===== QUESTION LOOKUP BY ID =====

/**
 * Creates a Map for O(1) question lookups by question ID.
 * 
 * Similar to `createResponseMap`, but indexes questions by their ID string
 * instead of numeric index.
 * 
 * @param {(AssessmentQuestion|any)[]} questions - Array of assessment questions
 * @returns {Map<string, AssessmentQuestion|any>} Map from question ID to question object
 * 
 * @example
 * const questionMap = createQuestionMap(questions);
 * const q1 = questionMap.get('G8_P1_M1_Q1'); // O(1) lookup
 * 
 * @performance O(n) to build, O(1) for lookups
 */
export const createQuestionMap = (
    questions: (AssessmentQuestion | any)[]
): Map<string, AssessmentQuestion | any> => {
    const map = new Map<string, AssessmentQuestion | any>();

    if (!Array.isArray(questions)) {
        console.warn('createQuestionMap: Invalid questions array');
        return map;
    }

    questions.forEach((q) => {
        if (q && typeof q.id === 'string') {
            map.set(q.id, q);
        }
    });

    return map;
};

// ===== ERROR HANDLING =====

/**
 * Safely derives flags with comprehensive error handling and validation.
 * 
 * This wrapper function protects flag derivation from crashes due to malformed data.
 * It validates inputs, catches errors, and returns safe defaults if derivation fails,
 * ensuring the assessment flow continues even with unexpected data.
 * 
 * @template T - Type extending FlagSet
 * @param {Function} deriver - Flag derivation function to wrap
 * @param {any[]} questions - Array of assessment questions
 * @param {any[]} responses - Array of assessment responses
 * @param {T} defaultFlags - Default flags to return on error (typically `{ no_flags_baseline: true }`)
 * @returns {T} Derived flags or default flags on error
 * 
 * @example
 * // In assessmentScheduler.ts
 * const flags = deriveFlagsSafely(
 *   deriveMiniFlagsForG8P1,
 *   questions,
 *   responses,
 *   { no_flags_baseline: true }  // Safe default if derivation fails
 * );
 * 
 * @example
 * // Custom error handler
 * const flags = deriveFlagsSafely(
 *   myDeriver,
 *   questions,
 *   responses,
 *   getDefaultFlags<MyFlags>(['flag1', 'flag2', 'no_flags_baseline'])
 * );
 * 
 * @throws Never throws - always returns either derived flags or defaults
 * @see getDefaultFlags
 */
export const deriveFlagsSafely = <T extends FlagSet>(
    deriver: (questions: any[], responses: any[]) => T,
    questions: any[],
    responses: any[],
    defaultFlags: T
): T => {
    try {
        // Validate inputs
        if (!Array.isArray(questions) || questions.length === 0) {
            console.warn('[deriveFlagsSafely] Invalid or empty questions array, using defaults', {
                questionsType: typeof questions,
                questionsLength: Array.isArray(questions) ? questions.length : 'N/A'
            });
            return defaultFlags;
        }

        if (!Array.isArray(responses)) {
            console.warn('[deriveFlagsSafely] Invalid responses array, using defaults', {
                responsesType: typeof responses
            });
            return defaultFlags;
        }

        // Call deriver
        const flags = deriver(questions, responses);

        // Validate output
        if (!flags || typeof flags !== 'object') {
            console.error('[deriveFlagsSafely] Deriver returned invalid flags, using defaults', {
                flagsType: typeof flags,
                flags
            });
            return defaultFlags;
        }

        return flags;
    } catch (error: any) {
        console.error('[deriveFlagsSafely] Error during flag derivation, using defaults', {
            error: error?.message || error,
            stack: error?.stack,
            questionsCount: Array.isArray(questions) ? questions.length : 'N/A',
            responsesCount: Array.isArray(responses) ? responses.length : 'N/A'
        });
        return defaultFlags;
    }
};

// ===== SCORING HELPERS =====

/**
 * Standard option scores for various response types.
 * Maps common Likert scale and Yes/No responses to risk scores (4 = High Risk, 0 = Low Risk).
 */
export const optionScores: Record<string, number> = {
    // Frequency style
    Always: 4,
    Often: 3,
    Sometimes: 2,
    Rarely: 1,
    Never: 0,
    // Yes / No (Standard: Yes=Risk)
    Yes: 4,
    No: 0,
    // Agreement scales
    'Strongly Disagree': 0,
    Disagree: 1,
    Neutral: 2,
    Agree: 3,
    'Strongly Agree': 4,
    // Intensity / amount (e.g., Not at all → Very much)
    'Not at all': 0,
    'A little': 1,
    Somewhat: 2,
    'Quite a bit': 3,
    'Very much': 4,
    // Quality (e.g., Very badly → Very well)
    'Very badly': 4,
    Badly: 3,
    Okay: 2,
    Well: 1,
    'Very well': 0,
    // Mood rating (e.g., Very low → Very good)
    'Very low': 4,
    Low: 3,
    Good: 1,
    'Very good': 0,
};

/**
 * Determines whether a question should be reverse-scored based on its text.
 * Uses a canonical list of positive indicators (e.g., "I feel happy").
 * 
 * @param {string} questionText - The text of the question
 * @returns {boolean} true if the question is positively phrased (reverse scored)
 */
export const isReverseScoredQuestion = (questionText: string): boolean => {
    const q = questionText.trim().toLowerCase();
    const reversePhrases = [
        'i enjoy doing things i used to enjoy',
        'i feel calm even when things go wrong',
        'i feel supported by my family during difficult times',
        "my parents/caregivers listen when i share feelings",
        'i can ask for help without feeling ashamed',
        'i feel cheerful and in good spirits',
        'i feel calm and relaxed',
        'i feel active and full of energy',
        'i feel that my life has meaning and purpose',
        'i wake up feeling fresh and rested',
        'i am confident in myself',
        'i can adapt when things change',
        "i understand and respect others' feelings",
        'i feel like i belong in school',
        'i feel respected by classmates and teachers',
        'i am satisfied with my academic performance',
        'i get along well with classmates',
        'i believe i can solve difficult tasks with effort',
        'i can manage my time and submit work on time',
        'i feel safe at home',
        'i am happy with my body image',
        'i feel mentally clear and able to recall information during practice tests and study sessions',
        'i still feel motivated to study and prepared to give my best effort in board exams',
        'the atmosphere at home is supportive and not adding to my exam stress',
        'i am getting adequate sleep (7+ hours) and my body is recovering from study stress',
        'i am not experiencing severe physical symptoms (nausea, headaches, weight loss) due to stress',
        'i believe in my ability to perform well and pass the board examinations',
        'i maintain healthy connections with friends and family despite exam pressure',
        'i have a clear strategy for managing exam day stress and performing my best',
    ];
    return reversePhrases.some((phrase) => q.includes(phrase));
};
