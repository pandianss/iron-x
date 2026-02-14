import { domainEvents, DomainEventType, ViolationDetectedEvent, ScoreUpdatedEvent, InstanceMaterializedEvent } from '../kernel/domain/events';
import { enforcementObserver } from '../governance/observers/EnforcementObserver';
import { auditObserver } from '../governance/observers/AuditObserver';
import { Logger } from '../utils/logger';

export function registerObservers() {
    Logger.info('[Bootstrap] Registering Governance Observers...');

    // Enforcement
    domainEvents.on(DomainEventType.VIOLATION_DETECTED, (e: ViolationDetectedEvent) => enforcementObserver.handle(e));

    // Audit
    domainEvents.on(DomainEventType.SCORE_UPDATED, (e: ScoreUpdatedEvent) => auditObserver.handle(e));
    domainEvents.on(DomainEventType.VIOLATION_DETECTED, (e: ViolationDetectedEvent) => auditObserver.handle(e));
    domainEvents.on(DomainEventType.INSTANCE_MATERIALIZED, (e: InstanceMaterializedEvent) => auditObserver.handle(e));

    // Future: KERNEL_CYCLE_COMPLETED
}
