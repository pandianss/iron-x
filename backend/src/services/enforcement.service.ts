import prisma from '../db';
import { AuditService } from './audit.service';
import { PolicyService } from './policy.service';
import { ExceptionService } from './exception.service';

/**
 * Service for enforcing discipline rules, handling mode transitions,
 * and managing lockouts.
 */
export const EnforcementService = {

    /**
     * Updates a user's enforcement mode.
     * Logs the change to audit trail.
     */

    /**
     * Updates a user's enforcement mode.
     * Logs the change to audit trail.
     * @deprecated Policy should drive enforcement mode. This might be used for overrides.
     */
    async setEnforcementMode(userId: string, targetMode: 'NONE' | 'SOFT' | 'HARD', actorId?: string) {
        const user = await prisma.user.findUnique({ where: { user_id: userId } });
        if (!user) throw new Error('User not found');

        if (user.enforcement_mode === targetMode) return;

        await prisma.user.update({
            where: { user_id: userId },
            data: { enforcement_mode: targetMode }
        });

        await AuditService.logEvent(
            'ENFORCEMENT_MODE_CHANGE',
            { previous: user.enforcement_mode, new: targetMode },
            userId,
            actorId
        );
    },

    /**
     * Applies penalty for a missed action based on enforcement mode.
     * Logic now derives mode from PolicyService.
     */
    async handleMissedAction(userId: string, instanceId: string) {
        // Check for Exceptions
        const hasException = await ExceptionService.hasActiveException(userId);
        if (hasException) {
            await AuditService.logEvent(
                'ACTION_MISSED_EXCEPTION_APPLIED',
                { instanceId, reason: 'Active Discipline Exception' },
                userId,
                undefined
            );
            return;
        }

        // Resolve effective policy
        const policy = await PolicyService.resolvePolicyForUser(userId);

        // Fallback to user setting if no policy (or if policy mode is 'SOFT' but user selected 'HARD'? 
        // No, Policy should win. But for transition, let's respect the stricter of the two?)
        // Strictly following "Enforcement reads from policy" (Task Q1).
        // If no policy, fallback to user.enforcement_mode.
        const enforcementMode = policy ? policy.enforcement_mode : (await prisma.user.findUnique({ where: { user_id: userId } }))?.enforcement_mode || 'NONE';

        if (enforcementMode === 'HARD') {
            await this.checkAndApplyLockout(userId);

            // Recalculate score immediately
            const { calculateUserScore } = await import('../jobs/calculateScore');
            await calculateUserScore(userId);

            await AuditService.logEvent(
                'ACTION_MISSED_HARD_MODE',
                { instanceId, policyId: policy?.policy_id },
                userId,
                undefined // System action
            );
        }
    },

    /**
     * Checks if a user should be locked out based on recent performance.
     * Trigger: Configurable via Policy.
     */
    async checkAndApplyLockout(userId: string) {
        // Check for Exceptions
        const hasException = await ExceptionService.hasActiveException(userId);
        if (hasException) {
            return; // Skip lockout check
        }

        const user = await prisma.user.findUnique({ where: { user_id: userId } });
        if (!user) return;

        const rules = await PolicyService.getEffectiveRules(userId);

        // Use rules or defaults
        const MAX_MISSES = rules.max_misses ?? 3;
        const SCORE_THRESHOLD = rules.score_threshold ?? 50;
        const LOCKOUT_DURATION_HOURS = rules.lockout_hours ?? 24;

        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        // Check misses
        const recentMisses = await prisma.actionInstance.count({
            where: {
                user_id: userId,
                status: 'MISSED',
                scheduled_date: { gte: sevenDaysAgo }
            }
        });

        let shouldLock = false;
        let reason = '';

        if (recentMisses >= MAX_MISSES) {
            shouldLock = true;
            reason = `Too many missed actions (${recentMisses} in 7 days). Policy Limit: ${MAX_MISSES}`;
        } else if (user.current_discipline_score < SCORE_THRESHOLD && user.current_discipline_score > 0) {
            // Score based lockout logic 
            // (Optional based on policy)
        }

        if (shouldLock) {
            // Check if already locked
            if (user.locked_until && user.locked_until > now) {
                return; // Already locked
            }

            const lockedUntil = new Date();
            lockedUntil.setHours(lockedUntil.getHours() + LOCKOUT_DURATION_HOURS);

            await prisma.user.update({
                where: { user_id: userId },
                data: {
                    locked_until: lockedUntil,
                    acknowledgment_required: true
                }
            });

            await AuditService.logEvent(
                'USER_LOCKED_OUT',
                { reason, durationHours: LOCKOUT_DURATION_HOURS, lockedUntil, rulesApplied: rules },
                userId,
                undefined
            );
        }
    },

    /**
     * Unlocks a user manually or if conditions met.
     */
    async unlockUser(userId: string, actorId: string, reason: string) {
        await prisma.user.update({
            where: { user_id: userId },
            data: {
                locked_until: null,
                acknowledgment_required: false
            }
        });

        await AuditService.logEvent(
            'USER_UNLOCKED',
            { reason },
            userId,
            actorId
        );
    }
};
