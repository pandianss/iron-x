import { DisciplinePolicy, SYSTEM_DEFAULTS } from '../../kernel/policies/DisciplinePolicy';
import { ScoringPolicy } from '../../kernel/policies/ScoringPolicy';
import { EnforcementMode } from '../../kernel/domain/types';

describe('DisciplinePolicy', () => {
    describe('resolveRules', () => {
        it('should return system defaults if input is null/undefined', () => {
            expect(DisciplinePolicy.resolveRules(null)).toEqual(SYSTEM_DEFAULTS);
            expect(DisciplinePolicy.resolveRules(undefined)).toEqual(SYSTEM_DEFAULTS);
        });

        it('should parse JSON string rules', () => {
            const rules = JSON.stringify({ max_misses: 5 });
            const resolved = DisciplinePolicy.resolveRules(rules);
            expect(resolved.max_misses).toBe(5);
            expect(resolved.score_threshold).toBe(SYSTEM_DEFAULTS.score_threshold); // default kept
        });

        it('should handle object input', () => {
            const rules = { lockout_hours: 48 };
            const resolved = DisciplinePolicy.resolveRules(rules);
            expect(resolved.lockout_hours).toBe(48);
        });

        it('should handle invalid JSON gracefully', () => {
            const resolved = DisciplinePolicy.resolveRules('invalid-json');
            expect(resolved).toEqual(SYSTEM_DEFAULTS);
        });
    });

    describe('resolveEnforcementMode', () => {
        it('should prioritize policy mode if valid', () => {
            expect(DisciplinePolicy.resolveEnforcementMode('HARD', 'SOFT')).toBe(EnforcementMode.HARD);
        });

        it('should fallback to user mode if policy mode is null', () => {
            expect(DisciplinePolicy.resolveEnforcementMode(null, 'SOFT')).toBe(EnforcementMode.SOFT);
        });

        it('should default to NONE if both are missing', () => {
            expect(DisciplinePolicy.resolveEnforcementMode(null, null)).toBe(EnforcementMode.NONE);
        });
    });

    describe('isLocked', () => {
        it('should return true if lockedUntil is in the future', () => {
            const future = new Date(Date.now() + 10000);
            expect(DisciplinePolicy.isLocked(future)).toBe(true);
        });

        it('should return false if lockedUntil is in the past', () => {
            const past = new Date(Date.now() - 10000);
            expect(DisciplinePolicy.isLocked(past)).toBe(false);
        });

        it('should return false if lockedUntil is null', () => {
            expect(DisciplinePolicy.isLocked(null)).toBe(false);
        });
    });
});

describe('ScoringPolicy', () => {
    describe('calculateScore', () => {
        it('should return 50 for empty instances', () => {
            expect(ScoringPolicy.calculateScore([])).toBe(50);
        });

        it('should return 50 if all instances are PENDING', () => {
            expect(ScoringPolicy.calculateScore([{ status: 'PENDING' }])).toBe(50);
        });

        it('should calculate correct score (100%)', () => {
            const instances = [{ status: 'COMPLETED' }, { status: 'COMPLETED' }];
            expect(ScoringPolicy.calculateScore(instances)).toBe(100);
        });

        it('should calculate correct score (50%)', () => {
            const instances = [{ status: 'COMPLETED' }, { status: 'MISSED' }];
            expect(ScoringPolicy.calculateScore(instances)).toBe(50);
        });

        it('should calculate correct score (0%)', () => {
            const instances = [{ status: 'MISSED' }];
            expect(ScoringPolicy.calculateScore(instances)).toBe(0);
        });

        it('should ignore PENDING instances in denominator', () => {
            const instances = [{ status: 'COMPLETED' }, { status: 'PENDING' }];
            // 1 completed / 1 total (non-pending) = 100%
            expect(ScoringPolicy.calculateScore(instances)).toBe(100);
        });
    });
});
