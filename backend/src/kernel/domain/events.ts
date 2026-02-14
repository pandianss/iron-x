import { EventEmitter } from 'events';
import { UserId, InstanceId, PolicyId } from './types';

export enum DomainEventType {
    INSTANCE_MATERIALIZED = 'INSTANCE_MATERIALIZED',
    VIOLATION_DETECTED = 'VIOLATION_DETECTED',
    SCORE_UPDATED = 'SCORE_UPDATED'
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

type EventMap = {
    [DomainEventType.INSTANCE_MATERIALIZED]: InstanceMaterializedEvent;
    [DomainEventType.VIOLATION_DETECTED]: ViolationDetectedEvent;
    [DomainEventType.SCORE_UPDATED]: ScoreUpdatedEvent;
    [key: string]: DomainEvent;
};

export class DomainEventBus extends EventEmitter {
    // @ts-ignore
    emit<K extends keyof EventMap>(event: K, payload: EventMap[K]) {
        return super.emit(event as string, payload);
    }

    // @ts-ignore
    on<K extends keyof EventMap>(event: K, listener: (payload: EventMap[K]) => void): this {
        return super.on(event as string, listener);
    }
}

export const domainEvents = new DomainEventBus();
