// frontend/src/domain/discipline.ts

import { api } from './api';

export interface DisciplineState {
    score: number;
    classification: 'STRICT' | 'STABLE' | 'DRIFTING' | 'BREACH';
    compositePressure: number;
    driftVectors: Array<{
        source: string;
        magnitude: number;
        direction: 'POSITIVE' | 'NEGATIVE';
    }>;
    violationHorizon: {
        daysUntilBreach: number | null;
        criticalActions: string[];
    };
    activeConstraints: {
        policiesActive: number;
        lockedUntil: Date | null;
        reducedPrivileges: string[];
        frozenActions: string[];
    };
    performanceMetrics: {
        weeklyCompletionRate: number;
        averageLatency: number;
        habitStrength: Record<string, number>;
    };
}

export interface DisciplineIdentity {
    score: number;
    classification: 'STRICT' | 'STABLE' | 'DRIFTING' | 'BREACH';
    weeklyCompletionRate: number;
    averageLatency: number;
    activePolicies: number;
    lockedUntil: Date | null;
}

export interface PressureData {
    compositePressure: number;
    driftVectors: Array<{
        source: string;
        magnitude: number;
        direction: 'POSITIVE' | 'NEGATIVE';
    }>;
}

export interface TrajectoryData {
    trajectory: Array<{
        date: string;
        score: number;
    }>;
}

export const DisciplineClient = {
    /**
     * Get complete discipline state for cockpit
     */
    getState: async (): Promise<DisciplineState> => {
        const response = await api.get('/discipline/state');
        return response.data;
    },

    /**
     * Get pressure and drift vectors
     */
    getPressure: async (): Promise<PressureData> => {
        const response = await api.get('/discipline/pressure');
        return response.data;
    },

    /**
     * Get historical trajectory
     */
    getTrajectory: async (): Promise<TrajectoryData> => {
        const response = await api.get('/discipline/trajectory');
        return response.data;
    },

    /**
     * Get identity card data
     */
    getIdentity: async (): Promise<DisciplineIdentity> => {
        const response = await api.get('/discipline/identity');
        return response.data;
    },

    /**
     * Manually refresh discipline score
     */
    refreshScore: async (): Promise<{ success: boolean; newScore: number }> => {
        const response = await api.post('/discipline/refresh');
        return response.data;
    }
};
