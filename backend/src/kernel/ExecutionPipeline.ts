import { UserId, InstanceId, DisciplineContext } from './domain/types';
import { PolicyEvaluator } from './PolicyEvaluator';
import { domainEvents, DomainEventType } from './domain/events';
import { Logger } from '../utils/logger';

export class ExecutionPipeline {
    constructor(private policyEvaluator: PolicyEvaluator) { }

    async detectViolations(context: DisciplineContext) {
        // Future: Check for late execution or other policy violations
    }

    async handleViolations(userId: UserId, violations: string[], context: DisciplineContext) {
        // We only emit events here. The actual "enforcement" (lockout, badging)
        // should happen in an observer that listens to VIOLATION_DETECTED.

        const { rules, mode } = await this.policyEvaluator.evaluate(context);

        for (const instanceId of violations) {
            Logger.info(`[Kernel] Violation detected for ${userId}: MISSED action ${instanceId}`);

            domainEvents.emit(DomainEventType.VIOLATION_DETECTED, {
                type: DomainEventType.VIOLATION_DETECTED,
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
