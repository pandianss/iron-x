
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
        threshold: number;
        current: number;
        timeToBreach: string;
    }>;
}

export interface TrajectoryData {
    trajectory: Array<{
        date: string;
        score: number;
    }>;
}

export interface ConstraintsData {
    // Derived from DisciplineState
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
    details?: string;
}

export interface TomorrowPreviewData {
    scheduledCount: number;
    riskLevel: string;
    warning: string;
    date: string;
}

export interface Warning {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
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
    },

    /**
     * Get Audit Log / History
     */
    getHistory: async (): Promise<AuditEntry[]> => {
        const response = await api.get('/discipline/history');
        return response.data;
    },

    /**
     * Get Constraints (Derived from State or separate logic)
     * To be compatible with ActiveControlsPanel, we implement this helper
     * that might call getState or just map if we want to change the component.
     * But since ActiveControlsPanel calls getConstraints, let's implement it.
     * However, backend doesn't have /constraints. 
     * We will use getState and map it.
     */
    getConstraints: async (): Promise<ConstraintsData> => {
        const state = await DisciplineClient.getState();
        return {
            activePolicies: state.activeConstraints.policiesActive > 0 ? ['General Policy'] : [], // Mock mapping
            exceptions: [], // Backend doesn't return exceptions in activeConstraints yet, need to fix Service if needed
            reducedPrivileges: state.activeConstraints.reducedPrivileges,
            frozenActions: state.activeConstraints.frozenActions
        };
    },

    // Add wrappers for TomorrowPreview if we want to keep logic here
    getTomorrowPreview: async (): Promise<TomorrowPreviewData> => {
        const response = await api.get('/discipline/preview');
        return response.data;
    },

    getAnticipatoryWarnings: async (): Promise<Warning[]> => {
        const response = await api.get('/discipline/warnings');
        return response.data;
    }
};
