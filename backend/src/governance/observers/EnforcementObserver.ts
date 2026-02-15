import prisma from '../../db';
import { DomainEvent, ViolationDetectedEvent } from '../../kernel/domain/events';
import { DomainEventType } from '../../kernel/domain/types';

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
            // Logic moved from ExecutionPipeline
            const MAX_MISSES = 3;
            const LOCKOUT_HOURS = 24;

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
                console.log(`[Governance] User ${userId} LOCKED OUT until ${lockedUntil}`);
                // Future: Emit USER_LOCKED_OUT event here if needed
            }
        }
    }
}

export const enforcementObserver = new EnforcementObserver();
