import { singleton, container, inject } from 'tsyringe';
import prisma from '../../infrastructure/db';
import { PrismaClient, SubscriptionTier } from '@prisma/client';
import { Logger } from '../../core/logger';
import { MetricsService } from '../../core/metrics.service';
import { DisciplinePolicy } from '../../kernel/policies/DisciplinePolicy';
import { EnforcementMode } from '../../kernel/domain/types';

@singleton()
export class PolicyService {
    // --- Policies ---
    async createPolicy(data: any) {
        // Handle parent_id if passed in data
        const { parent_id, ...rest } = data;
        return prisma.policy.create({
            data: {
                ...rest,
                parent_policy_id: parent_id
            }
        });
    }

    async getAllPolicies() {
        return (prisma as any).policy.findMany({
            include: { parent_policy: true, child_policies: true } as any
        });
    }

    async getPolicyById(id: string) {
        return (prisma as any).policy.findUnique({
            where: { policy_id: id },
            include: { parent_policy: true, child_policies: true } as any
        });
    }

    async updatePolicy(id: string, data: any) {
        return prisma.policy.update({
            where: { policy_id: id },
            data
        });
    }

    async deletePolicy(id: string) {
        return prisma.policy.delete({
            where: { policy_id: id }
        });
    }

    // --- Roles ---
    async createRole(data: any) {
        return prisma.role.create({ data });
    }

    async getAllRoles() {
        return prisma.role.findMany({
            include: { policy: true }
        });
    }

    async assignPolicyToRole(roleId: string, policyId: string) {
        return prisma.role.update({
            where: { role_id: roleId },
            data: { policy_id: policyId }
        });
    }

    async assignRoleToUser(userId: string, roleId: string) {
        return prisma.user.update({
            where: { user_id: userId },
            data: { role_id: roleId }
        });
    }

    // --- Exceptions ---
    async requestException(data: { userId: string; policyId: string; reason: string }) {
        return prisma.disciplineException.create({
            data: {
                user_id: data.userId,
                policy_id: data.policyId,
                reason: data.reason
            }
        });
    }

    async approveException(exceptionId: string, approverId: string) {
        return prisma.disciplineException.update({
            where: { exception_id: exceptionId },
            data: {
                approved_by: approverId
            }
        });
    }

    // --- Enterprise Features (New) ---

    // Static wrapper compatible with my previous implementation if used statically
    // But now I'm making it instance based as per controller usage. 
    // If I used it statically elsewhere, I should check. 
    // My previous sso/audit implementations didn't use it.

    async resolveEffectivePolicy(userId: string) {
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                role: { include: { policy: true } },
                team_memberships: {
                    include: {
                        team: { include: { policies: true } as any }
                    }
                },

                organization: { include: { policies: true } as any }
            }
        }) as any;

        if (!user) return null;

        let effectiveRules: Record<string, any> = {};

        // 1. Start with Role Policy
        if (user.role?.policy?.rules) {
            try {
                effectiveRules = JSON.parse(user.role.policy.rules);
            } catch (e) {
                console.error('Failed to parse role policy rules', e);
            }
        }

        // 2. Merge Team Policies
        user.team_memberships?.forEach((membership: any) => {
            membership.team?.policies?.forEach((policy: any) => {
                try {
                    const rules = JSON.parse(policy.rules);
                    effectiveRules = { ...effectiveRules, ...rules };
                } catch (e) {
                    console.error('Failed to parse team policy rules', e);
                }
            });
        });

        // 3. Apply User Exceptions (Overrides)
        const activeException = await prisma.disciplineException.findFirst({
            where: {
                user_id: userId,
                OR: [
                    { valid_until: null },
                    { valid_until: { gt: new Date() } }
                ]
            }
        });

        if (activeException) {
            effectiveRules.EXCEPTION_ACTIVE = true;
            effectiveRules.EXCEPTION_REASON = activeException.reason;
        }

        // 4. Layer Organization Policies (Mandatory ones override everything)
        user.organization?.policies?.forEach((orgPolicy: any) => {
            if (orgPolicy.is_mandatory || !effectiveRules[orgPolicy.rule_name]) {
                effectiveRules[orgPolicy.rule_name] = orgPolicy.rule_value;
            }
        });

        return {
            userId: user.user_id,
            orgId: user.org_id,
            rules: effectiveRules,
            enforcementMode: user.enforcement_mode
        };
    }

    // Kept this static in previous version but controller uses instance. 
    // Wait, controller DOES NOT use resolveEffectivePolicy? 
    // I added it for 'Enterprise Phase' logic.
    // I'll keep it as instance method.

    async assignDefaultRole(userId: string) {
        const defaultRole = await prisma.role.findUnique({
            where: { name: 'Member' }
        });

        if (defaultRole) {
            await prisma.user.update({
                where: { user_id: userId },
                data: { role_id: defaultRole.role_id }
            });
        } else {
            console.warn(`Default role 'Member' not found. User ${userId} has no role.`);
        }
    }

    async setEnforcementMode(userId: string, mode: 'NONE' | 'SOFT' | 'HARD') {
        await prisma.user.update({
            where: { user_id: userId },
            data: { enforcement_mode: mode }
        });
    }

    /**
     * Evaluates and applies enforcement actions (lockouts) based on the current discipline score.
     */
    async applyEnforcement(userId: string, currentScore: number): Promise<{
        lockedUntil: Date | null;
        enforcementApplied: boolean;
    }> {
        Logger.info(`[PolicyService] Evaluating enforcement for User ${userId} (Score: ${currentScore})`);

        // 1. Fetch User and effective Policy
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                role: {
                    include: { policy: true }
                }
            }
        });

        if (!user) throw new Error('User not found');

        // Resolve Policy and Rules
        const policy = user.role?.policy;
        const rules = DisciplinePolicy.resolveRules(policy?.rules);
        
        // Map Prisma EnforcementMode to our kernel expectation if necessary
        // In our schema, it's an enum. 
        const mode = DisciplinePolicy.resolveEnforcementMode(
            policy?.enforcement_mode as any,
            user.enforcement_mode as any
        );

        // 2. Determine if Score triggers Lockout
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentMisses = await prisma.actionInstance.count({
            where: {
                user_id: userId,
                status: 'MISSED',
                scheduled_start_time: { gte: sevenDaysAgo }
            }
        });

        const isScoreBreach = currentScore < rules.score_threshold;
        const isMissBreach = recentMisses >= rules.max_misses;

        if (mode === 'HARD' && (isScoreBreach || isMissBreach)) {
            const now = new Date();
            const lockedUntil = new Date(now.getTime() + rules.lockout_hours * 60 * 60 * 1000);

            const reason = isScoreBreach ? `Score ${currentScore} < Threshold ${rules.score_threshold}` : `Recent misses ${recentMisses} >= Max allowed ${rules.max_misses}`;
            Logger.warn(`[PolicyService] HARD Lockout Triggered for User ${userId}. ${reason}. Locked until ${lockedUntil.toISOString()}`);
            
            const metrics = container.resolve(MetricsService);
            metrics.lockoutsTotal.inc({ mode: 'HARD_LOCKOUT', reason: isScoreBreach ? 'SCORE_BREACH' : 'MISS_BREACH' });

            await prisma.user.update({
                where: { user_id: userId },
                data: {
                    locked_until: lockedUntil,
                    discipline_classification: 'BREACH'
                }
            });

            // Create an audit log entry for the lockout
            await prisma.auditLog.create({
                data: {
                    actor_id: 'SYSTEM',
                    target_user_id: userId,
                    action: 'SYSTEM_LOCKOUT',
                    details: JSON.stringify({
                        score: currentScore,
                        threshold: rules.score_threshold,
                        recent_misses: recentMisses,
                        max_misses: rules.max_misses,
                        lockout_hours: rules.lockout_hours,
                        locked_until: lockedUntil
                    })
                }
            });

            return { lockedUntil, enforcementApplied: true };
        }

        return { lockedUntil: user.locked_until, enforcementApplied: false };
    }
}
