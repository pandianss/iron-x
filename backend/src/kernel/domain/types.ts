
export type UserId = string;
export type ActionId = string;
export type InstanceId = string;
export type PolicyId = string;

export enum EnforcementMode {
    NONE = 'NONE',
    SOFT = 'SOFT',
    HARD = 'HARD'
}

export enum DisciplineStatus {
    STABLE = 'STABLE',
    DRIFTING = 'DRIFTING',
    BREACH = 'BREACH',
    STRICT = 'STRICT'
}

export interface DisciplineContext {
    userId: UserId;
    traceId: string;
    timestamp: Date;
    // Normalized State
    user?: {
        current_discipline_score: number;
    };
    instances: {
        instance_id: string;
        action_id: string;
        status: string;
        scheduled_date: Date;
        scheduled_start_time: Date;
        scheduled_end_time: Date;
    }[];
    policy: {
        rules: PolicyRules;
        mode: EnforcementMode;
    };
    violations: Violation[];
}

export interface PolicyRules {
    max_misses: number;
    score_threshold: number;
    lockout_hours: number;
}

export interface Violation {
    type: 'MISSED_ACTION' | 'LATE_EXECUTION';
    instanceId: InstanceId;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}
