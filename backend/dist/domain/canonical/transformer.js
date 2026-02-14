"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalTransformer = void 0;
exports.CanonicalTransformer = {
    toActionV1(internal) {
        return {
            id: internal.action_id,
            title: internal.title,
            description: internal.description || undefined,
            type: 'HABIT', // Default mapping, internal model needs expansion or inference
            schedule: {
                frequency: internal.frequency_rule,
                windowStart: internal.window_start_time.toISOString().split('T')[1].substring(0, 5), // Extract HH:mm
                windowDurationMinutes: internal.window_duration_minutes
            },
            strictMode: internal.is_strict
        };
    },
    toScoreV1(internal) {
        // Calculate Trend (requires history, simplified here for V1 MVP)
        return {
            userId: internal.user_id || 'UNKNOWN',
            date: internal.date.toISOString().split('T')[0],
            score: internal.score,
            metrics: {
                executionRate: Number(internal.execution_rate) || 0,
                onTimeRate: Number(internal.on_time_rate) || 0
            },
            trend: 'STABLE' // Placeholder for logic
        };
    },
    toPolicyV1(internal) {
        let rules = { maxMisses: 0, lockoutDurationHours: 0 };
        try {
            const parsed = JSON.parse(internal.rules);
            rules = {
                maxMisses: parsed.max_misses || 0,
                lockoutDurationHours: parsed.lockout_hours || 0
            };
        }
        catch (e) {
            // Log error
        }
        return {
            id: internal.policy_id,
            name: internal.name,
            enforcementMode: internal.enforcement_mode,
            rules
        };
    }
};
