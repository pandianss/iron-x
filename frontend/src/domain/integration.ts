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

    generateApiKey: (name: string, expiresAt?: string) =>
        api.post('/api-keys', { name, expiresAt }).then(r => r.data),

    getApiKeys: () =>
        api.get('/api-keys').then(r => r.data),

    revokeApiKey: (keyId: string) =>
        api.delete(`/api-keys/${keyId}`).then(r => r.data),
};
