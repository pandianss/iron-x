import { api } from './api';

export const SecurityClient = {
    setupMFA: async () => {
        const response = await api.post('/security/mfa/setup');
        return response.data;
    },

    verifyMFA: async (token: string) => {
        const response = await api.post('/security/mfa/verify', { token });
        return response.data;
    },

    disableMFA: async (password: string) => {
        const response = await api.post('/security/mfa/disable', { password });
        return response.data;
    }
};
