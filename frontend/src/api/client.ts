import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1'; // Fixed to match backend port

const client = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


export const createCheckoutSession = async (priceId: string, successUrl: string, cancelUrl: string) => {
    const response = await client.post('/billing/checkout', { priceId, successUrl, cancelUrl });
    return response.data;
};

export const createPortalSession = async (returnUrl: string) => {
    const response = await client.post('/billing/portal', { returnUrl });
    return response.data;
};

export const sendInvitation = async (teamId: string, email: string, role: string) => {
    const response = await client.post(`/team/${teamId}/invite`, { email, role });
    return response.data;
};

export const acceptInvitation = async (token: string) => {
    const response = await client.post(`/team/invites/${token}/accept`);
    return response.data;
};

export const getProfile = async () => {
    const response = await client.get('/user/profile');
    return response.data;
};

export const getDisciplineData = async () => {
    const response = await client.get('/analytics/discipline'); // Updated path
    return response.data;
};

// Security / MFA
export const setupMFA = async () => {
    const response = await client.post('/security/mfa/setup');
    return response.data;
};

export const verifyMFA = async (token: string) => {
    const response = await client.post('/security/mfa/verify', { token });
    return response.data;
};

export const disableMFA = async (password: string) => {
    const response = await client.post('/security/mfa/disable', { password });
    return response.data;
};

// Organizations
export const createOrganization = async (data: { name: string; slug: string }) => {
    const response = await client.post('/organizations', data);
    return response.data;
};

export const getOrganization = async (slug: string) => {
    const response = await client.get(`/organizations/${slug}`);
    return response.data;
};

export const getOrganizationStats = async (orgId: string) => {
    const response = await client.get(`/organizations/${orgId}/stats`);
    return response.data;
};

// Integrations
export const createWebhook = async (orgId: string, url: string, events: string, secret?: string) => {
    const response = await client.post('/integration/webhooks', { orgId, url, events, secret });
    return response.data;
};

export const getWebhooks = async (orgId: string) => {
    const response = await client.get(`/integration/${orgId}/webhooks`);
    return response.data;
};

export const generateApiKey = async (orgId: string, name: string) => {
    const response = await client.post(`/integration/${orgId}/keys`, { name });
    return response.data;
};

export const getApiKeys = async (orgId: string) => {
    const response = await client.get(`/integration/${orgId}/keys`);
    return response.data;
};

export const getAuditLogs = async (params: { userId?: string; action?: string; limit?: number; offset?: number }) => {
    const response = await client.get('/audit/logs', { params });
    return response.data;
};

export default client;
