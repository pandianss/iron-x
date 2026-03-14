import { api } from './api';

export const AuthClient = {
    getProfile: async () => {
        const response = await api.get('/user/profile');
        return response.data;
    },

    sync: async (idToken: string, extraData: any = {}) => {
        const response = await api.post('/auth/sync', extraData, {
            headers: {
                Authorization: `Bearer ${idToken}`
            }
        });
        return response.data;
    },

    togglePublicScore: async () => {
        const response = await api.patch('/user/public-score');
        return response.data;
    }
};
