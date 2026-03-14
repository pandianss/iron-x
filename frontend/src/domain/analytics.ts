import { api } from './api';

export const AnalyticsClient = {
    getDisciplineData: async () => {
        const response = await api.get('/analytics/discipline');
        return response.data;
    },

    getProjections: async () => {
        const response = await api.get('/analytics/projections');
        return response.data;
    },

    runSimulation: async (type: string, value: number) => {
        const response = await api.post('/analytics/simulate', { type, value });
        return response.data;
    },

    getAuditLogs: async (params: { userId?: string; action?: string; limit?: number; offset?: number }) => {
        const response = await api.get('/audit/logs', { params });
        return response.data;
    },

    getReport: async () => {
        const response = await api.get('/experience/report');
        return response.data;
    },

    getDailyStats: async () => {
        const response = await api.get('/analytics/daily');
        return response.data;
    },

    generateDriftReport: async (): Promise<{
        analysis: DriftAnalysis;
        pdfBase64: string;
        cached: boolean;
        generated_at: string;
    }> => {
        const response = await api.post('/analytics/drift-report');
        return response.data;
    }
};

export interface DriftAnalysis {
    primary_drift_pattern: string;
    root_cause_suggestion: string;
    recommended_adjustment: string;
    projected_score_recovery: number;
    confidence_level: 'LOW' | 'MED' | 'HIGH';
    created_at: string;
}

export const generateDriftReport = AnalyticsClient.generateDriftReport;
