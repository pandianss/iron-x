import { DomainEvent } from '../../kernel/domain/events';

export class AuditObserver {
    async handle(event: DomainEvent) {
        // TODO: Persist to AuditLog table
        console.log(`[Audit] Event: ${event.type} | User: ${event.userId} | TS: ${event.timestamp.toISOString()}`);
    }
}

export const auditObserver = new AuditObserver();
