"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutionPipeline = void 0;
const events_1 = require("./domain/events");
const logger_1 = require("../utils/logger");
class ExecutionPipeline {
    constructor(policyEvaluator) {
        this.policyEvaluator = policyEvaluator;
    }
    async detectViolations(context) {
        // Future: Check for late execution or other policy violations
    }
    async handleViolations(userId, violations, context) {
        // We only emit events here. The actual "enforcement" (lockout, badging)
        // should happen in an observer that listens to VIOLATION_DETECTED.
        const { rules, mode } = await this.policyEvaluator.evaluate(context);
        for (const instanceId of violations) {
            logger_1.Logger.info(`[Kernel] Violation detected for ${userId}: MISSED action ${instanceId}`);
            events_1.domainEvents.emit(events_1.DomainEventType.VIOLATION_DETECTED, {
                type: events_1.DomainEventType.VIOLATION_DETECTED,
                timestamp: new Date(),
                userId,
                payload: {
                    instanceId,
                    reason: 'MISSED_ACTION',
                    policyId: mode // 'HARD' or 'SOFT' acting as pseudo-policy ID for now
                }
            });
        }
    }
}
exports.ExecutionPipeline = ExecutionPipeline;
