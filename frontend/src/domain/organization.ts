import { api } from './api';

export const OrganizationClient = {
    create: async (data: { name: string; slug: string }) => {
        const response = await api.post('/organizations', data);
        return response.data;
    },

    getBySlug: async (slug: string) => {
        const response = await api.get(`/organizations/${slug}`);
        return response.data;
    },

    getStats: async (orgId: string) => {
        const response = await api.get(`/organizations/${orgId}/stats`);
        return response.data;
    }
};
