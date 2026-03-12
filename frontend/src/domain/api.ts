import axios from 'axios';

import { auth } from '../config/firebase';

const API_URL = 'http://localhost:3000/api/v1';

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
