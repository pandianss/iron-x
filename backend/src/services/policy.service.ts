import prisma from '../db';
import { User, Policy, Role } from '@prisma/client';
import { AuditService } from './audit.service';

export type PolicyRules = {
    max_misses?: number;
    score_threshold?: number;
    lockout_hours?: number;
    [key: string]: any;
};

export const PolicyService = {
    /**
     * Resolves the effective policy for a user based on hierarchy:
     * 1. Role-based Policy
     * 2. Team-based Policy (Future)
     * 3. Organization Default (Fallback)
     */
    async resolvePolicyForUser(userId: string): Promise<Policy | null> {
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                role: {
                    include: {
                        policy: true
                    }
                },
                // We might want to include team later
            }
        });

        if (!user) return null;

        // 1. Role Policy
        if (user.role?.policy) {
            return user.role.policy;
        }

        // 2. Default Policy
        // We can look for a policy named 'DEFAULT' or similar
        const defaultPolicy = await prisma.policy.findFirst({
            where: { scope: 'ORG', name: 'DEFAULT' }
        });

        return defaultPolicy;
    },

    /**
     * Returns the parsed rules for compliance checking.
     * Merges with system defaults if policy is missing or partial.
     */
    async getEffectiveRules(userId: string): Promise<PolicyRules> {
        const policy = await this.resolvePolicyForUser(userId);

        const SYSTEM_DEFAULTS: PolicyRules = {
            max_misses: 3,
            score_threshold: 50,
            lockout_hours: 24
        };

        if (!policy) {
            return SYSTEM_DEFAULTS;
        }

        try {
            const policyRules = JSON.parse(policy.rules) as PolicyRules;
            return { ...SYSTEM_DEFAULTS, ...policyRules };
        } catch (e) {
            console.error(`Failed to parse policy rules for policy ${policy.policy_id}`, e);
            return SYSTEM_DEFAULTS;
        }
    },

    /**
     * Helper to check if a user is subject to monitoring.
     * Logic might expand.
     */
    async isEnforcementActive(userId: string): Promise<boolean> {
        const policy = await this.resolvePolicyForUser(userId);
        if (!policy) return false;
        return policy.enforcement_mode !== 'NONE';
    },

    /**
     * Assigns a role to a user.
     */
    async assignRole(userId: string, roleName: string) {
        // Find role by name
        const role = await (prisma as any).role.findUnique({
            where: { name: roleName }
        });

        if (!role) {
            console.warn(`Role ${roleName} not found. Skipping assignment.`);
            return;
        }

        const previousRole = await prisma.user.findUnique({
            where: { user_id: userId },
            select: { role_id: true }
        });

        await prisma.user.update({
            where: { user_id: userId },
            data: { role_id: role.role_id } as any
        });

        await AuditService.logEvent(
            'ROLE_ASSIGNED',
            { role: roleName, roleId: role.role_id, previousRoleId: previousRole?.role_id },
            userId,
            undefined // actorId defaults to null (System)
        );
    },

    /**
     * Assigns the default 'Employee' role to a new user.
     */
    async assignDefaultRole(userId: string) {
        await this.assignRole(userId, 'Employee');
    }
};
