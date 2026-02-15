import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import { DisciplinePolicy } from '../kernel/policies/DisciplinePolicy';
import { EnforcementMode } from '../kernel/domain/types';
import { Logger } from '../utils/logger';

@injectable()
export class PolicyService {
    constructor(@inject('PrismaClient') private prisma: PrismaClient) { }

    /**
     * Evaluates and applies enforcement actions (lockouts) based on the current discipline score.
     */
    async applyEnforcement(userId: string, currentScore: number): Promise<{
        lockedUntil: Date | null;
        enforcementApplied: boolean;
    }> {
        Logger.info(`[PolicyService] Evaluating enforcement for User ${userId} (Score: ${currentScore})`);

        // 1. Fetch User and effective Policy
        const user = await this.prisma.user.findUnique({
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
        const mode = DisciplinePolicy.resolveEnforcementMode(
            policy?.enforcement_mode,
            user.enforcement_mode
        );

        // 2. Determine if Score triggers Lockout
        // Threshold check: if score is below the threshold, trigger lockout
        if (mode === EnforcementMode.HARD && currentScore < rules.score_threshold) {
            const now = new Date();
            const lockedUntil = new Date(now.getTime() + rules.lockout_hours * 60 * 60 * 1000);

            Logger.warn(`[PolicyService] HARD Lockout Triggered for User ${userId}. Score ${currentScore} < Threshold ${rules.score_threshold}. Locked until ${lockedUntil.toISOString()}`);

            await this.prisma.user.update({
                where: { user_id: userId },
                data: {
                    locked_until: lockedUntil,
                    // Optionally update classification to BREACH
                    discipline_classification: 'BREACH'
                }
            });

            // Create an audit log entry for the lockout
            await this.prisma.auditLog.create({
                data: {
                    actor_id: userId,
                    target_user_id: userId,
                    action: 'SYSTEM_LOCKOUT',
                    details: JSON.stringify({
                        score: currentScore,
                        threshold: rules.score_threshold,
                        lockout_hours: rules.lockout_hours,
                        locked_until: lockedUntil
                    })
                }
            });

            return { lockedUntil, enforcementApplied: true };
        }

        // 3. Clear Lockout if score has recovered (Self-Correction)
        // Note: In some systems, only time or manual intervention clears lockouts.
        // For Iron-X, if they are currently locked but their score (somehow) is now above threshold, 
        // we might allow it, but usually, lockouts are time-based.
        // Let's stick to time-based for now as per DisciplinePolicy.isLocked().

        return { lockedUntil: user.locked_until, enforcementApplied: false };
    }
}
