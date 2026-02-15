
import { domainEvents, DomainEventType } from '../../../kernel/domain/events';
import { container } from 'tsyringe';
import { WebhookService } from './webhook.service';
import prisma from '../../../db';

/**
 * Initializes listeners for domain events to trigger outbound webhooks.
 */
export const initializeWebhookListeners = () => {
    const webhookService = container.resolve(WebhookService);

    domainEvents.on(DomainEventType.VIOLATION_DETECTED, async (event: any) => {
        // Fetch orgId for the user
        const user = await prisma.user.findUnique({
            where: { user_id: event.userId },
            select: { org_id: true } as any
        }) as any;

        if (user?.org_id) {
            await webhookService.triggerEvent(user.org_id, 'violation.detected', event.payload);
        }
    });

    domainEvents.on(DomainEventType.SCORE_UPDATED, async (event: any) => {
        const user = await prisma.user.findUnique({
            where: { user_id: event.userId },
            select: { org_id: true } as any
        }) as any;

        if (user?.org_id) {
            await webhookService.triggerEvent(user.org_id, 'score.updated', event.payload);
        }
    });
};
