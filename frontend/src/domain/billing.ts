import { api } from './api';

export const BillingClient = {
    createCheckoutSession: async (priceId: string, successUrl: string, cancelUrl: string) => {
        const response = await api.post('/billing/checkout', { priceId, successUrl, cancelUrl });
        return response.data;
    },

    createPortalSession: async (returnUrl: string = window.location.href) => {
        const response = await api.post('/billing/portal', { returnUrl });
        return response.data;
    },

    getSubscription: async (userId?: string) => {
        // Currently only supports getting own subscription
        const response = await api.get('/subscription/me');
        return response.data;
    }
};
