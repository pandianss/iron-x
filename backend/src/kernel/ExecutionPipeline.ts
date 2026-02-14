
import prisma from '../../db';
import { UserId, InstanceId, DisciplineContext } from './domain/types';
import { PolicyEvaluator } from './PolicyEvaluator';

export class ExecutionPipeline {
    constructor(private policyEvaluator: PolicyEvaluator) { }

    async detectViolations(context: DisciplineContext) {
        // This is where we might check for violations other than missed actions
        // e.g. late execution, or check against specific policy rules
    }

    async handleViolations(userId: UserId, violations: string[]) {
        const { rules, mode } = await this.policyEvaluator.evaluate(userId);

        for (const instanceId of violations) {
            // Log violation (TODO: Emit VIOLATION_DETECTED event)
            console.log(`[Kernel] Violation detected for ${userId}: MISSED action ${instanceId}`);

            if (mode === 'HARD') {
                await this.applyHardEnforcement(userId, rules);
            }
        }
    }

    private async applyHardEnforcement(userId: UserId, rules: any) {
        // Check if lockout is needed
        const MAX_MISSES = rules.max_misses ?? 3;
        const LOCKOUT_HOURS = rules.lockout_hours ?? 24;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentMisses = await prisma.actionInstance.count({
            where: {
                user_id: userId,
                status: 'MISSED',
                scheduled_date: { gte: sevenDaysAgo }
            }
        });

        if (recentMisses >= MAX_MISSES) {
            const lockedUntil = new Date();
            lockedUntil.setHours(lockedUntil.getHours() + LOCKOUT_HOURS);

            await prisma.user.update({
                where: { user_id: userId },
                data: {
                    locked_until: lockedUntil,
                    acknowledgment_required: true
                }
            });
            // TODO: Emit USER_LOCKED_OUT event
        }
    }
}
