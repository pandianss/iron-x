import { api } from './api';

export interface ScheduledItem {
    instance_id: string;
    action: {
        title: string;
        window_start_time: string;
        window_duration_minutes: number;
    };
    scheduled_start_time: string;
    scheduled_end_time: string;
    status: string;
    executed_at: string | null;
}

export const ScheduleClient = {
    getToday: async (): Promise<ScheduledItem[]> => {
        const response = await api.get('/schedule/today');
        return response.data;
    },

    logExecution: async (instanceId: string): Promise<void> => {
        await api.post(`/schedule/instances/${instanceId}/log`);
    }
};
