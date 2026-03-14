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

// Optimized token injection: Only fetch if needed, and rely on Firebase's internal caching
api.interceptors.request.use(
    async (config) => {
        if (config.headers.Authorization) {
            return config;
        }

        const currentUser = auth.currentUser;
        if (currentUser) {
            try {
                // forceRefresh: false allows Firebase to use its internal cached token if it hasn't expired
                const token = await currentUser.getIdToken(false);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (err) {
                // Silently fail, backend will return 401 if token is required
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const data = error.response?.data;
        const code = data?.code;
        const message = data?.message || '';

        // Handle System-Level States via Events instead of hard redirects
        if (status === 403) {
            // 1. Governance Lockout
            if (code === 'GOV_LOCKOUT') {
                window.dispatchEvent(new CustomEvent('iron-x:system-lockout', { 
                    detail: { 
                        lockedUntil: data.locked_until,
                        message: data.message 
                    } 
                }));
                return Promise.reject(error);
            }

            // 2. Plan Quota Exceeded
            if (code === 'PLAN_LIMIT_EXCEEDED' || message.includes('limit reached')) {
                const resource = message.toUpperCase().includes('GOAL') ? 'GOALS' : 
                                 message.toUpperCase().includes('TEAM') ? 'TEAMS' : 'ACTIONS';
                
                window.dispatchEvent(new CustomEvent('iron-x:quota-exceeded', { 
                    detail: { resource } 
                }));
                return Promise.reject(error);
            }
        }
        
        // 3. Auth Failures (Optional: trigger unified logout or re-auth)
        if (status === 401 && code === 'USER_NOT_FOUND') {
             window.dispatchEvent(new CustomEvent('iron-x:auth-failure', { detail: { code } }));
        }

        return Promise.reject(error);
    }
);
