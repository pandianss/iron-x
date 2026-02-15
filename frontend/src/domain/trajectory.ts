import { api } from './api';

export interface TrajectoryIdentity {
    score: number;
    classification: 'UNRELIABLE' | 'RECOVERING' | 'STABLE' | 'HIGH_RELIABILITY';
    daysAtCurrent: number;
    nextThreshold: number;
    supervisionMode: string;
}

export interface TrajectoryData {
    history: { date: string; score: number }[];
    events: { date: string; type: string; cause: string }[];
}

export interface PredictionData {
    projectedScore: number;
    trend: 'UP' | 'DOWN' | 'FLAT';
}

export interface Warning {
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
}

export interface TomorrowPreviewData {
    scheduledCount: number;
    riskLevel: string;
    warning: string;
    date: string;
}

export const TrajectoryClient = {
    getIdentity: async () => {
        const response = await api.get<TrajectoryIdentity>('/trajectory/identity');
        return response.data;
    },

    getHistory: async (days: number = 30) => {
        const response = await api.get<TrajectoryData>(`/trajectory/trajectory?days=${days}`);
        return response.data;
    },

    getProjectedScore: async () => {
        const response = await api.get<PredictionData>('/trajectory/projection');
        return response.data;
    },

    getAnticipatoryWarnings: async () => {
        const response = await api.get<Warning[]>('/trajectory/warnings');
        return response.data;
    },

    getTomorrowPreview: async () => {
        const response = await api.get<TomorrowPreviewData>('/trajectory/preview');
        return response.data;
    }
};
