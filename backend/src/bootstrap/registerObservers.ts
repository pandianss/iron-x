import { domainEvents, DomainEventType } from '../kernel/domain/events';
import { enforcementObserver } from '../governance/observers/EnforcementObserver';
import { auditObserver } from '../governance/observers/AuditObserver';

export function registerObservers() {
    console.log('[Bootstrap] Registering Governance Observers...');

    // Enforcement
    domainEvents.on(DomainEventType.VIOLATION_DETECTED, (e: any) => enforcementObserver.handle(e));

    // Audit
    domainEvents.on(DomainEventType.SCORE_UPDATED, (e: any) => auditObserver.handle(e));
    domainEvents.on(DomainEventType.VIOLATION_DETECTED, (e: any) => auditObserver.handle(e));
    domainEvents.on(DomainEventType.INSTANCE_MATERIALIZED, (e: any) => auditObserver.handle(e));

    // Future: KERNEL_CYCLE_COMPLETED
}
