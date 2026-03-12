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
                // Fetch user to get current score
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
