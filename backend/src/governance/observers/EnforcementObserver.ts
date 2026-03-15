import { container } from 'tsyringe';
import prisma from '../../db';
import { DomainEvent, ViolationDetectedEvent } from '../../kernel/domain/events';
import { DomainEventType } from '../../kernel/domain/types';
import { PolicyService } from '../../services/policy.service';

export class EnforcementObserver {
    async handle(event: DomainEvent) {
        if (event.type === DomainEventType.VIOLATION_DETECTED) {
            await this.handleViolation(event as ViolationDetectedEvent);
        }
    }

    private async handleViolation(event: ViolationDetectedEvent) {
        const { userId, payload } = event;
        const { policyId } = payload;

        console.log(`[Governance] Violation observed for ${userId}: ${payload.reason}`);

        if (policyId === 'HARD') {
            try {
                // Check if this is the user's first violation ever
                const violationCount = await prisma.auditLog.count({
                    where: {
                        target_user_id: userId,
                        action: 'VIOLATION_DETECTED'
                    }
                });

                if (violationCount <= 1) { // 1 because the current one might already be logged or is about to be
                    console.log(`[Governance] First-time violation for ${userId}. Applying Coaching Pause (2h) instead of Hard Lockout.`);
                    const twoHoursLater = new Date();
                    twoHoursLater.setHours(twoHoursLater.getHours() + 2);

                    await prisma.user.update({
                        where: { user_id: userId },
                        data: {
                            locked_until: twoHoursLater,
                            acknowledgment_required: true,
                            enforcement_mode: 'SOFT' // temporarily downgrade to SOFT/COACHING mode
                        }
                    });
                    
                    // Log the coaching pause
                    await prisma.auditLog.create({
                        data: {
                            actor_id: 'SYSTEM',
                            target_user_id: userId,
                            action: 'COACHING_PAUSE_APPLIED',
                            details: JSON.stringify({ reason: payload.reason, original_policy: 'HARD' })
                        }
                    });
                    return;
                }

                // Standard Hard Lockout for subsequent failures
                const user = await prisma.user.findUnique({
                    where: { user_id: userId },
                    select: { current_discipline_score: true }
                });

                if (user) {
                    const policyService = container.resolve(PolicyService);
                    await policyService.applyEnforcement(userId, user.current_discipline_score);
                }
            } catch (e) {
                console.error(`[Governance] Failed to apply enforcement for user ${userId}`, e);
            }
        }
    }
}

export const enforcementObserver = new EnforcementObserver();
