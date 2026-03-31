/**
 * Utility functions for Assessment Scheduler
 */

/**
 * Projects selected flags from a flag set.
 * Flags are already booleans from derivers, so no Boolean() coercion needed.
 * 
 * @param flags - The complete flag object
 * @param keys - Array of flag keys to include in projection
 * @returns Object containing only the specified flags
 */
export const projectSelectedFlags = <T extends Record<string, any>>(
    flags: T,
    keys: (keyof T)[]
): Partial<T> => {
    const result: Partial<T> = {};
    keys.forEach(key => {
        result[key] = flags[key];
    });
    return result as Partial<T>;
};

/**
 * Projects all flags without modification.
 * Use when all flags should be passed through to mini assessment.
 */
export const projectAllFlags = <T>(flags: T): T => flags;
