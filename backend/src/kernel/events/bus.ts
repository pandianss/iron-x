import { EventEmitter } from 'events';

export enum DomainEventType {
    // Core Lifecycle
    INSTANCE_MATERIALIZED = 'INSTANCE_MATERIALIZED',
    VIOLATION_DETECTED = 'VIOLATION_DETECTED',
    SCORE_UPDATED = 'SCORE_UPDATED',
    KERNEL_CYCLE_COMPLETED = 'KERNEL_CYCLE_COMPLETED',

    // User Actions
    ACTION_CREATED = 'ACTION_CREATED',
    ACTION_UPDATED = 'ACTION_UPDATED',

    // Governance
    ACCESS_DENIED = 'ACCESS_DENIED',
    LOCKOUT_ENFORCED = 'LOCKOUT_ENFORCED'
}

export interface DomainEvent {
    type: DomainEventType;
    timestamp: Date;
    userId?: string;
    payload: any;
    traceId?: string;
}

class EventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(20); // Increase limit for multiple subscribers
    }

    emitEvent(type: DomainEventType, payload: any, userId?: string, traceId?: string) {
        const event: DomainEvent = {
            type,
            timestamp: new Date(),
            userId,
            payload,
            traceId
        };

        // Emit specific event type
        super.emit(type, event);

        // Emit wildcard for catch-all loggers
        super.emit('*', event);
    }

    subscribe(type: DomainEventType, handler: (event: DomainEvent) => Promise<void> | void) {
        this.on(type, async (event) => {
            try {
                await handler(event);
            } catch (error) {
                console.error(`[EventBus] Error in subscriber for ${type}:`, error);
                // Prevent crash, but log error
            }
        });
    }
}

export const kernelEvents = new EventBus();
