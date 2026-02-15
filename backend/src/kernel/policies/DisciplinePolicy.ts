import { EnforcementMode, PolicyRules } from '../domain/types';

export const SYSTEM_DEFAULTS: PolicyRules = {
    max_misses: 3,
    score_threshold: 50,
    lockout_hours: 24
};

export class DisciplinePolicy {
    /**
     * Resolves policy rules from raw JSON string or object, 
     * applying system defaults for missing values.
     */
    static resolveRules(policyRulesData: string | object | null | undefined): PolicyRules {
        if (!policyRulesData) return { ...SYSTEM_DEFAULTS };

        let parsed: Partial<PolicyRules> = {};

        try {
            if (typeof policyRulesData === 'string') {
                parsed = JSON.parse(policyRulesData);
            } else if (typeof policyRulesData === 'object') {
                parsed = policyRulesData as Partial<PolicyRules>;
            }
        } catch (e) {
            console.warn('DisciplinePolicy: Failed to parse rules, using defaults', e);
        }

        return {
            max_misses: parsed.max_misses ?? SYSTEM_DEFAULTS.max_misses,
            score_threshold: parsed.score_threshold ?? SYSTEM_DEFAULTS.score_threshold,
            lockout_hours: parsed.lockout_hours ?? SYSTEM_DEFAULTS.lockout_hours
        };
    }

    /**
     * Determines the effective enforcement mode based on Policy and User settings.
     * User setting usually overrides Policy setting if it's stricter or specifically set?
     * Logic from previous implementation: 
     * "policyData?.enforcement_mode || user.enforcement_mode || 'NONE'"
     * This implies Policy takes precedence if set? Or vice versa?
     * Let's stick to the existing logic in InstanceLifecycle:
     * const mode = (policyData?.enforcement_mode || user.enforcement_mode || 'NONE')
     */
    static resolveEnforcementMode(policyMode: string | null | undefined, userMode: string | null | undefined): EnforcementMode {
        if (policyMode && Object.values(EnforcementMode).includes(policyMode as EnforcementMode)) {
            return policyMode as EnforcementMode;
        }

        if (userMode && Object.values(EnforcementMode).includes(userMode as EnforcementMode)) {
            return userMode as EnforcementMode;
        }

        return EnforcementMode.NONE;
    }

    /**
     * Pure check for lockout status.
     * @param lockedUntil The date until which the user is locked.
     * @param now Reference time (default: current time)
     */
    static isLocked(lockedUntil: Date | null | undefined, now: Date = new Date()): boolean {
        if (!lockedUntil) return false;
        return lockedUntil > now;
    }
}
