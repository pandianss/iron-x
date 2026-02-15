import { api } from './api';

export interface DisciplineState {
    score: number;
    status: 'STRICT' | 'STABLE' | 'DRIFTING' | 'BREACH';
    timeSinceLastViolation: string;
    countdownToNextCheck: string;
    decayRate: number;
}

export interface DriftVector {
    source: string;
    current: string;
    threshold: string;
    timeToBreach: string;
}

export interface PressureData {
    compositePressure: 'LOW' | 'RISING' | 'HIGH';
    driftVectors: DriftVector[];
}

export interface Prediction {
    event: string;
    time: string;
    confidence: number;
    correctiveAction: string;
    consequence: string;
}

export interface ConstraintsData {
    activePolicies: string[];
    exceptions: { id: string; title: string; expiry: string }[];
    reducedPrivileges: string[];
    frozenActions: string[];
}

export interface AuditEntry {
    id: string;
    timestamp: string;
    action: string;
    impact: string;
    severity: string;
}

export const DisciplineClient = {
    getState: async () => {
        const response = await api.get<DisciplineState>('/discipline/state');
        return response.data;
    },

    getPressure: async () => {
        const response = await api.get<PressureData>('/discipline/pressure');
        return response.data;
    },

    getPredictions: async () => {
        const response = await api.get<Prediction[]>('/discipline/predictions');
        return response.data;
    },

    getConstraints: async () => {
        const response = await api.get<ConstraintsData>('/discipline/constraints');
        return response.data;
    },

    getHistory: async () => {
        const response = await api.get<AuditEntry[]>('/discipline/history');
        return response.data;
    }
};
