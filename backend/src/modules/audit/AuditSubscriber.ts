import { kernelEvents, DomainEventType } from '../../kernel/events/bus';

export class AuditSubscriber {
    constructor() {
        this.setupSubscriptions();
    }

    private setupSubscriptions() {
        console.log('[AuditSubscriber] Initialized');

        kernelEvents.on(DomainEventType.ACCESS_DENIED, (event) => {
            console.log(`[AUDIT] ACCESS DENIED | User: ${event.userId} | Trace: ${event.traceId} | Reason: ${event.payload.reason}`);
        });

        kernelEvents.on(DomainEventType.LOCKOUT_ENFORCED, (event) => {
            console.log(`[AUDIT] LOCKOUT ENFORCED | User: ${event.userId} | Locked Until: ${event.payload.lockedUntil}`);
        });

        kernelEvents.on(DomainEventType.VIOLATION_DETECTED, (event) => {
            console.log(`[AUDIT] VIOLATION | User: ${event.userId} | Instance: ${event.payload.instanceId} | Reason: ${event.payload.reason}`);
        });

        kernelEvents.on(DomainEventType.ACTION_CREATED, (event) => {
            console.log(`[AUDIT] ACTION CREATED | User: ${event.userId} | Action: ${event.payload.actionId}`);
        });
    }
}

// Singleton instance
export const auditSubscriber = new AuditSubscriber();
