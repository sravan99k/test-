import {
    deriveMiniFlagsForG6P1,
    deriveMiniFlagsForG6P2,
    deriveMiniFlagsForG6P3,
    deriveMiniFlagsForG6P4
} from './grade6';

import {
    deriveMiniFlagsForG7P1,
    deriveMiniFlagsForG7P2,
    deriveMiniFlagsForG7P3,
    deriveMiniFlagsForG7P4
} from './grade7';

import {
    deriveMiniFlagsForG8P1,
    deriveMiniFlagsForG8P2,
    deriveMiniFlagsForG8P3,
    deriveMiniFlagsForG8P4
} from './grade8';

import {
    deriveMiniFlagsForG9P1,
    deriveMiniFlagsForG9P2,
    deriveMiniFlagsForG9P3,
    deriveMiniFlagsForG9P4
} from './grade9';

import {
    deriveMiniFlagsForG10P1,
    deriveMiniFlagsForG10P2,
    deriveMiniFlagsForG10P3,
    deriveMiniFlagsForG10P4
} from './grade10';

export * from './types';

// Export individual functions for backward compatibility/testing
export {
    deriveMiniFlagsForG6P1, deriveMiniFlagsForG6P2, deriveMiniFlagsForG6P3, deriveMiniFlagsForG6P4,
    deriveMiniFlagsForG7P1, deriveMiniFlagsForG7P2, deriveMiniFlagsForG7P3, deriveMiniFlagsForG7P4,
    deriveMiniFlagsForG8P1, deriveMiniFlagsForG8P2, deriveMiniFlagsForG8P3, deriveMiniFlagsForG8P4,
    deriveMiniFlagsForG9P1, deriveMiniFlagsForG9P2, deriveMiniFlagsForG9P3, deriveMiniFlagsForG9P4,
    deriveMiniFlagsForG10P1, deriveMiniFlagsForG10P2, deriveMiniFlagsForG10P3, deriveMiniFlagsForG10P4
};

/**
 * Central registry of all flag derivation functions.
 * Used by the Assessment Scheduler to dynamically look up the correct logic
 * based on the configuration key (e.g., "deriveMiniFlagsForG6P1").
 */
export const FLAG_DERIVERS: Record<string, Function> = {
    // Grade 6
    deriveMiniFlagsForG6P1,
    deriveMiniFlagsForG6P2,
    deriveMiniFlagsForG6P3,
    deriveMiniFlagsForG6P4,

    // Grade 7
    deriveMiniFlagsForG7P1,
    deriveMiniFlagsForG7P2,
    deriveMiniFlagsForG7P3,
    deriveMiniFlagsForG7P4,

    // Grade 8
    deriveMiniFlagsForG8P1,
    deriveMiniFlagsForG8P2,
    deriveMiniFlagsForG8P3,
    deriveMiniFlagsForG8P4,

    // Grade 9
    deriveMiniFlagsForG9P1,
    deriveMiniFlagsForG9P2,
    deriveMiniFlagsForG9P3,
    deriveMiniFlagsForG9P4,

    // Grade 10
    deriveMiniFlagsForG10P1,
    deriveMiniFlagsForG10P2,
    deriveMiniFlagsForG10P3,
    deriveMiniFlagsForG10P4
};
