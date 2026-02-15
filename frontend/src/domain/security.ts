import { api } from './api';

export const SecurityClient = {
    setupMFA: async (): Promise<{ secret: string; qrCode: string }> => {
        const response = await api.post('/security/setup');
        return response.data;
    },

    verifyMFA: async (token: string, secret: string) => {
        const response = await api.post('/security/verify', { token, secret });
        return response.data;
    },

    disableMFA: async (password: string, token?: string) => {
        const response = await api.post('/security/disable', { password, token });
        return response.data;
    }
};
