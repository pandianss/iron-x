
import prisma from '../../db';
import { UserId, PolicyRules, EnforcementMode } from './domain/types';

export class PolicyEvaluator {
    async evaluate(userId: UserId): Promise<{ rules: PolicyRules; mode: EnforcementMode }> {
        // 1. Resolve Policy
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                role: {
                    include: { policy: true }
                }
            }
        });

        if (!user) {
            throw new Error(`User ${userId} not found`);
        }

        let policy = user.role?.policy;

        if (!policy) {
            policy = await prisma.policy.findFirst({
                where: { scope: 'ORG', name: 'DEFAULT' }
            });
        }

        // 2. Parse Rules
        const SYSTEM_DEFAULTS: PolicyRules = {
            max_misses: 3,
            score_threshold: 50,
            lockout_hours: 24
        };

        let rules = SYSTEM_DEFAULTS;

        if (policy?.rules) {
            try {
                const parsed = JSON.parse(policy.rules);
                rules = { ...SYSTEM_DEFAULTS, ...parsed };
            } catch (e) {
                console.error(`Failed to parse policy rules for policy ${policy.policy_id}`, e);
            }
        }

        // 3. Determine Mode
        // Policy mode overrides user setting? Or logic says "Policy wins".
        // enforcement.service said: "enforcementMode = policy ? policy.enforcement_mode : user.enforcement_mode || 'NONE'"
        const modeStr = policy?.enforcement_mode || user.enforcement_mode || 'NONE';
        const mode = modeStr as EnforcementMode;

        return { rules, mode };
    }
}
