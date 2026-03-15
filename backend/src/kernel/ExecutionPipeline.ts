import { UserId, InstanceId, DisciplineContext } from './domain/types';
import { PolicyEvaluator } from './PolicyEvaluator';
import { domainEvents, DomainEventType } from './domain/events';
import { Logger } from '../utils/logger';

export class ExecutionPipeline {
    constructor(private policyEvaluator: PolicyEvaluator) { }

    async detectViolations(context: DisciplineContext) {
        // Late Execution detection
        const { rules, mode } = await this.policyEvaluator.evaluate(context);

        const lateInstances = context.instances.filter(instance => {
            if (instance.status === 'COMPLETED' && instance.executed_at && instance.scheduled_end_time) {
                // If it was completed after the scheduled end time, it counts as a late execution violation
                return instance.executed_at > instance.scheduled_end_time;
            }
            return false;
        });

        for (const instance of lateInstances) {
            Logger.info(`[Kernel] Violation detected for ${context.userId}: LATE_EXECUTION action ${instance.instance_id}`);

            domainEvents.emit(DomainEventType.VIOLATION_DETECTED, {
                type: DomainEventType.VIOLATION_DETECTED,
                timestamp: new Date(),
                userId: context.userId,
                payload: {
                    instanceId: instance.instance_id,
                    reason: 'LATE_EXECUTION',
                    enforcementMode: mode // 'HARD' | 'SOFT' — not a policy ID
                }
            });
        }
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
                    enforcementMode: mode // 'HARD' | 'SOFT' — not a policy ID
                }
            });
        }
    }
}
