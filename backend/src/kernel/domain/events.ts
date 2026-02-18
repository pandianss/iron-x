import { EventEmitter } from 'events';
import { UserId, InstanceId, PolicyId, DomainEventType } from './types';
export { DomainEventType };


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

export interface KernelCycleCompletedEvent extends DomainEvent {
    type: DomainEventType.KERNEL_CYCLE_COMPLETED;
    payload: {
        score: number;
        violations: number;
        traceId?: string;
    };
}

export interface KernelStageTimingEvent extends DomainEvent {
    type: DomainEventType.KERNEL_STAGE_TIMING;
    payload: {
        traceId: string;
        lifecycleMs: number;
        pipelineMs: number;
        scoringMs: number;
        totalMs: number;
    };
}

type EventMap = {
    [DomainEventType.INSTANCE_MATERIALIZED]: InstanceMaterializedEvent;
    [DomainEventType.VIOLATION_DETECTED]: ViolationDetectedEvent;
    [DomainEventType.SCORE_UPDATED]: ScoreUpdatedEvent;
    [DomainEventType.KERNEL_CYCLE_COMPLETED]: KernelCycleCompletedEvent;
    [DomainEventType.KERNEL_STAGE_TIMING]: KernelStageTimingEvent;
    [key: string]: DomainEvent;
};

export class DomainEventBus extends EventEmitter {
    // @ts-expect-error - Overriding EventEmitter signatures to provide better types
    emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
        return super.emit(event as string, payload);
    }

    // @ts-expect-error - Overriding EventEmitter signatures to provide better types
    on<K extends keyof EventMap>(event: K, listener: (payload: EventMap[K]) => void): this {
        return super.on(event as string, listener);
    }
}

export const domainEvents = new DomainEventBus();

