import { Logger } from '../../core/logger';
import { DomainEvent } from '../../kernel/domain/events';
import prisma from '../../infrastructure/db';

export class AuditObserver {
    async handle(event: DomainEvent) {
        try {
            await prisma.auditLog.create({
                data: {
                    actor_id: event.userId,
                    action: event.type,
                    details: JSON.stringify(event.payload),
                    timestamp: event.timestamp || new Date()
                }
            });
        } catch (e) {
            console.error(`[AuditObserver] Failed to log event ${event.type} for user ${event.userId}`, e);
        }
    }
}

export const auditObserver = new AuditObserver();
