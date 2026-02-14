"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditObserver = exports.AuditObserver = void 0;
class AuditObserver {
    async handle(event) {
        // TODO: Persist to AuditLog table
        console.log(`[Audit] Event: ${event.type} | User: ${event.userId} | TS: ${event.timestamp.toISOString()}`);
    }
}
exports.AuditObserver = AuditObserver;
exports.auditObserver = new AuditObserver();
