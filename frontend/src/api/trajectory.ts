import client from './client';

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

export const getTrajectoryIdentity = async (): Promise<TrajectoryIdentity> => {
    const response = await client.get('/trajectory/identity');
    return response.data;
};

export const getTrajectoryHistory = async (days: number = 30): Promise<TrajectoryData> => {
    const response = await client.get(`/trajectory/trajectory?days=${days}`);
    return response.data;
};

export const getProjectedScore = async (): Promise<PredictionData> => {
    const response = await client.get('/trajectory/projection');
    return response.data;
};

export const getAnticipatoryWarnings = async (): Promise<Warning[]> => {
    const response = await client.get('/trajectory/warnings');
    return response.data;
};

export const getTomorrowPreview = async (): Promise<TomorrowPreviewData> => {
    const response = await client.get('/trajectory/preview');
    return response.data;
};
