"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerObservers = registerObservers;
const events_1 = require("../kernel/domain/events");
const EnforcementObserver_1 = require("../governance/observers/EnforcementObserver");
const AuditObserver_1 = require("../governance/observers/AuditObserver");
function registerObservers() {
    console.log('[Bootstrap] Registering Governance Observers...');
    // Enforcement
    events_1.domainEvents.on(events_1.DomainEventType.VIOLATION_DETECTED, (e) => EnforcementObserver_1.enforcementObserver.handle(e));
    // Audit
    events_1.domainEvents.on(events_1.DomainEventType.SCORE_UPDATED, (e) => AuditObserver_1.auditObserver.handle(e));
    events_1.domainEvents.on(events_1.DomainEventType.VIOLATION_DETECTED, (e) => AuditObserver_1.auditObserver.handle(e));
    events_1.domainEvents.on(events_1.DomainEventType.INSTANCE_MATERIALIZED, (e) => AuditObserver_1.auditObserver.handle(e));
    // Future: KERNEL_CYCLE_COMPLETED
}
