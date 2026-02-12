import client from './client';

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

export const getDisciplineState = async () => {
    const response = await client.get<DisciplineState>('/discipline/state');
    return response.data;
};

export const getPressure = async () => {
    const response = await client.get<PressureData>('/discipline/pressure');
    return response.data;
};

export const getPredictions = async () => {
    const response = await client.get<Prediction[]>('/discipline/predictions');
    return response.data;
};

export const getConstraints = async () => {
    const response = await client.get<ConstraintsData>('/discipline/constraints');
    return response.data;
};

export const getHistory = async () => {
    const response = await client.get<AuditEntry[]>('/discipline/history');
    return response.data;
};
