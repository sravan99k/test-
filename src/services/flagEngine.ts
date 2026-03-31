import { AssessmentQuestion } from './assessmentUtils';
import { AssessmentResponse } from './assessmentUtils';

/**
 * Calculates the numeric value for a given answer based on the question's response options.
 * 
 * Handles mapping from:
 * - Scale arrays (e.g. ["Rarely", "Always"]) -> values
 * - Direct value options
 * 
 * @param question - The assessment question definition
 * @param answer - The student's answer (string or value)
 * @returns The numeric value (score) of the answer, or null if not applicable/found
 */
export const getNumericValueForQuestionAnswer = (question: AssessmentQuestion, answer: string | number | string[]): number | null => {
  if (!question || !question.responseOptions) return null;
  const opts = question.responseOptions;
  const scale = Array.isArray(opts.scale) ? opts.scale : (Array.isArray(opts.options) ? opts.options : null);
  const values = Array.isArray(opts.values) ? opts.values : null;

  if (!scale || !values || scale.length !== values.length) {
    return null;
  }

  if (typeof answer !== 'string') return null;
  const idx = scale.indexOf(answer);
  if (idx === -1) return null;

  const value = values[idx];
  return typeof value === 'number' ? value : null;
};

/**
 * Determines if a question should be flagged based on its configured flagConditions.
 * 
 * Evaluates:
 * - Numeric comparisons (>=, <=, >, <, =)
 * - Exact string matches
 * - Special conditions like 'minLength:N'
 * 
 * @param question - The assessment question with potential `flagConditions`
 * @param answer - The student's answer to evaluate
 * @returns true if the answer triggers any flag condition
 */
export const isQuestionFlaggedByConditions = (question: AssessmentQuestion, answer: string | number | string[]): boolean => {
  const conditions = question?.flagConditions;
  if (!conditions || typeof conditions !== 'object') return false;

  const entries = Object.entries(conditions).filter(([, v]) => typeof v === 'string') as [
    string,
    string
  ][];

  if (!entries.length) return false;

  const numericValue = getNumericValueForQuestionAnswer(question, answer);

  const compare = (a: number, op: string, b: number): boolean => {
    switch (op) {
      case '>':
        return a > b;
      case '>=':
        return a >= b;
      case '<':
        return a < b;
      case '<=':
        return a <= b;
      case '==':
      case '=':
        return a === b;
      default:
        return false;
    }
  };

  const result = entries.some(([, cond]) => {
    const minLengthMatch = cond.match(/^minLength:(\d+)$/);
    if (minLengthMatch) {
      if (typeof answer !== 'string') return false;
      return answer.length >= parseInt(minLengthMatch[1], 10);
    }

    const match = cond.match(/^(>=|<=|>|<|==|=)\s*(\d+(?:\.\d+)?)$/);
    if (match) {
      if (numericValue == null) return false;
      const op = match[1];
      const threshold = parseFloat(match[2]);
      const result = compare(numericValue, op, threshold);
      if (result) {
        // console.log(`[flagEngine] Numeric Trigger: Q=${question.id} Ans=${answer} Val=${numericValue} Op=${op} Thresh=${threshold}`);
      }
      return result;
    }

    // Non-numeric condition: treat as exact string match on the answer label
    if (typeof answer === 'string') {
      const result = answer === cond;
      if (result) {
        // console.log(`[flagEngine] String Trigger: Q=${question.id} Ans='${answer}' Cond='${cond}'`);
      }
      return result;
    }

    return false;
  });

  // Debug logging for any positive flag (rate limited by logic flow)
  if (result) {
    console.log(`[flagEngine] 🚩 Flag Triggered for Q: ${question.id || 'unknown'}`, {
      answer,
      numericValue,
      conditions: JSON.stringify(conditions),
      entries: entries
    });
  }

  return result;
};
