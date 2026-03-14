import axios from 'axios';

import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    async (config) => {
        // Respect explicitly set authorization headers (e.g., from AuthClient.sync)
        if (config.headers.Authorization) {
            return config;
        }

        // Otherwise, fetch the current active Firebase token
        if (auth.currentUser) {
            try {
                const token = await auth.currentUser.getIdToken();
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (err) {
                // Ignore token fetch errors here
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 403) {
            const msg: string = error.response.data?.message || '';
            const code: string = error.response.data?.code || '';
            
            if (code === 'GOV_LOCKOUT') {
                sessionStorage.setItem('lockout_data', JSON.stringify({
                    locked_until: error.response.data.locked_until,
                    message: error.response.data.message,
                }));
                window.location.href = '/lockout';
                return Promise.reject(error);
            }

            if (msg.includes('Plan limit reached') || msg.includes('Resource limit reached') || code === 'PLAN_LIMIT_EXCEEDED') {
                const extractResource = (m: string) => {
                    const upper = m.toUpperCase();
                    if (upper.includes('ACTION')) return 'ACTIONS';
                    if (upper.includes('GOAL')) return 'GOALS';
                    if (upper.includes('TEAM')) return 'TEAMS';
                    return 'ACTIONS';
                };
                const resource = extractResource(msg);
                window.dispatchEvent(new CustomEvent('iron-x:quota-exceeded', { detail: { resource } }));
            }
        }
        return Promise.reject(error);
    }
);
