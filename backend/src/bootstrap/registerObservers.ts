import { domainEvents, DomainEventType, ViolationDetectedEvent, ScoreUpdatedEvent, InstanceMaterializedEvent } from '../kernel/domain/events';
import { enforcementObserver } from '../governance/observers/EnforcementObserver';
import { auditObserver } from '../governance/observers/AuditObserver';
import { auditSubscriber } from '../modules/audit/AuditSubscriber';
import { Logger } from '../utils/logger';
import { kernelEvents, DomainEventType as NewDomainEventType } from '../kernel/events/bus';

export function registerObservers() {
    Logger.info('[Bootstrap] Registering Governance Observers...');

    // Enforcement
    domainEvents.on(DomainEventType.VIOLATION_DETECTED, (e: ViolationDetectedEvent) => enforcementObserver.handle(e));

    // Bind to new EventBus as well
    kernelEvents.on(NewDomainEventType.VIOLATION_DETECTED, (e) => {
        // Adapt event shape if necessary, or just pass if compatible
        // The old observer expects userId to be present.
        if (e.userId) {
            enforcementObserver.handle({
                type: DomainEventType.VIOLATION_DETECTED,
                timestamp: e.timestamp,
                userId: e.userId,
                payload: e.payload
            });
        }
    });

    // Audit (New)
    // Invoking the singleton to ensure subscriptions are active
    console.log('[Bootstrap] auditSubscriber initialized status:', !!auditSubscriber);

    // Legacy Audit (Migration in progress)
    domainEvents.on(DomainEventType.SCORE_UPDATED, (e: ScoreUpdatedEvent) => auditObserver.handle(e));
    domainEvents.on(DomainEventType.VIOLATION_DETECTED, (e: ViolationDetectedEvent) => auditObserver.handle(e));
    domainEvents.on(DomainEventType.INSTANCE_MATERIALIZED, (e: InstanceMaterializedEvent) => auditObserver.handle(e));

    // Future: KERNEL_CYCLE_COMPLETED
}
