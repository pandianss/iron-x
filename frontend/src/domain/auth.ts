import { api } from './api';

export const AuthClient = {
    getProfile: async () => {
        const response = await api.get('/user/profile');
        return response.data;
    },

    login: async (email: string, password: string, mfaToken?: string) => {
        const response = await api.post('/auth/login', { email, password, mfaToken });
        return response.data;
    },

    register: async (data: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await api.post('/auth/register', data as any);
        return response.data;
    }
};
