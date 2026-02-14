
import { UserId, InstanceId, PolicyId, Violation } from './types';

export enum DomainEventType {
    INSTANCE_MATERIALIZED = 'INSTANCE_MATERIALIZED',
    EXECUTION_RECORDED = 'EXECUTION_RECORDED',
    VIOLATION_DETECTED = 'VIOLATION_DETECTED',
    SCORE_UPDATED = 'SCORE_UPDATED',
    POLICY_BREACHED = 'POLICY_BREACHED',
    USER_LOCKED_OUT = 'USER_LOCKED_OUT'
}

export interface DomainEvent {
    type: DomainEventType;
    timestamp: Date;
    userId: UserId;
    payload: any;
}

export interface InstanceMaterializedEvent extends DomainEvent {
    type: DomainEventType.INSTANCE_MATERIALIZED;
    payload: {
        instanceId: InstanceId;
        actionId: string;
        scheduledFor: Date;
    };
}

export interface ViolationDetectedEvent extends DomainEvent {
    type: DomainEventType.VIOLATION_DETECTED;
    payload: {
        instanceId: InstanceId;
        reason: string;
        policyId?: PolicyId;
    };
}

export interface ScoreUpdatedEvent extends DomainEvent {
    type: DomainEventType.SCORE_UPDATED;
    payload: {
        oldScore: number;
        newScore: number;
        reason: string;
    };
}
