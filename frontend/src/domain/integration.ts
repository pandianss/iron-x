import { api } from './api';

export const IntegrationClient = {
    createWebhook: async (orgId: string, url: string, events: string, secret?: string) => {
        const response = await api.post('/integration/webhooks', { orgId, url, events, secret });
        return response.data;
    },

    getWebhooks: async (orgId: string) => {
        const response = await api.get(`/integration/${orgId}/webhooks`);
        return response.data;
    },

    generateApiKey: async (orgId: string, name: string) => {
        const response = await api.post(`/integration/${orgId}/keys`, { name });
        return response.data;
    },

    getApiKeys: async (orgId: string) => {
        const response = await api.get(`/integration/${orgId}/keys`);
        return response.data;
    }
};
