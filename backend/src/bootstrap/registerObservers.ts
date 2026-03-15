import { domainEvents, ViolationDetectedEvent, ScoreUpdatedEvent, InstanceMaterializedEvent } from '../kernel/domain/events';
import { DomainEventType } from '../kernel/domain/types';
import { enforcementObserver } from '../governance/observers/EnforcementObserver';
import { auditObserver } from '../governance/observers/AuditObserver';
import { auditSubscriber } from '../modules/audit/AuditSubscriber';
import { Logger } from '../utils/logger';
import { kernelEvents, DomainEventType as NewDomainEventType } from '../kernel/events/bus';

export function registerObservers() {
    Logger.info('[Bootstrap] Registering Governance Observers...');

    // Enforcement
    domainEvents.on(DomainEventType.VIOLATION_DETECTED, (e) => { enforcementObserver.handle(e); });

    // Audit (New)
    // Invoking the singleton to ensure subscriptions are active
    console.log('[Bootstrap] auditSubscriber initialized status:', !!auditSubscriber);

    // Legacy Audit (Migration in progress)
    domainEvents.on(DomainEventType.SCORE_UPDATED, (e) => { auditObserver.handle(e); });
    domainEvents.on(DomainEventType.VIOLATION_DETECTED, (e) => { auditObserver.handle(e); });
    domainEvents.on(DomainEventType.INSTANCE_MATERIALIZED, (e) => { auditObserver.handle(e); });

    // Future: KERNEL_CYCLE_COMPLETED
}
