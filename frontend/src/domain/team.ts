import { api } from './api';

export const TeamClient = {
    sendInvitation: async (teamId: string, email: string, role: string) => {
        const response = await api.post(`/team/${teamId}/invite`, { email, role });
        return response.data;
    },

    acceptInvitation: async (token: string) => {
        const response = await api.post(`/team/invites/${token}/accept`);
        return response.data;
    },

    getVelocity: async (teamId: string) => {
        const response = await api.get(`/analytics/team/${teamId}/velocity`);
        return response.data;
    }
};
