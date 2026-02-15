import { api } from './api';

export interface Action {
    action_id: string;
    title: string;
    description: string | null;
    window_start_time: string;
    window_duration_minutes: number;
    goal?: {
        title: string;
    };
    // Add other fields as needed
}

export const ActionClient = {
    getAll: async () => {
        const response = await api.get<Action[]>('/actions');
        return response.data;
    },

    create: async (data: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.post('/actions', data as any);
        return response.data;
    }
};
