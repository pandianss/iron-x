
/**
 * Canonical Discipline Data Model (Version 1)
 * These interfaces define the public contract for the ecosystem.
 * Changes here must be backward compatible or require a major version bump.
 */

export interface ActionV1 {
    id: string;
    title: string;
    description?: string;
    type: 'HABIT' | 'TASK' | 'RESTRICTION';
    schedule: {
        frequency: string; // "DAILY", "WEEKLY"
        windowStart: string; // ISO Time "HH:mm"
        windowDurationMinutes: number;
    };
    strictMode: boolean;
}

export interface DisciplineScoreV1 {
    userId: string;
    date: string; // ISO Date "YYYY-MM-DD"
    score: number; // 0-100 integer
    metrics: {
        executionRate: number; // 0.0 - 1.0
        onTimeRate: number;    // 0.0 - 1.0
    };
    trend: 'RISING' | 'FALLING' | 'STABLE';
}

export interface PolicyV1 {
    id: string;
    name: string;
    enforcementMode: 'NONE' | 'SOFT' | 'HARD';
    rules: {
        maxMisses: number;
        lockoutDurationHours: number;
    };
}
