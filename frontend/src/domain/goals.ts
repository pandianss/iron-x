import { api } from './api';

export interface Goal {
    goal_id: string;
    title: string;
    description: string | null;
    deadline: string | null;
    status: string;
    created_at: string;
}

export const GoalClient = {
    getAll: async () => {
        const response = await api.get<Goal[]>('/goals');
        return response.data;
    },

    create: async (data: { title: string; description?: string; deadline?: string | null }) => {
        const response = await api.post('/goals', data);
        return response.data;
    }
};
