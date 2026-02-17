import { api } from './api';

export type SubscriptionTier = 'FREE' | 'INDIVIDUAL_PRO' | 'TEAM_ENTERPRISE';

export interface Subscription {
    subscription_id: string;
    plan_tier: SubscriptionTier;
    is_active: boolean;
    is_locked: boolean;
    end_date?: string;
    grace_period_until?: string;
}

export const BillingClient = {
    createCheckoutSession: async (priceId: string, successUrl: string, cancelUrl: string) => {
        const response = await api.post('/billing/checkout', { priceId, successUrl, cancelUrl });
        return response.data;
    },

    createPortalSession: async (returnUrl: string = window.location.href) => {
        const response = await api.post('/billing/portal', { returnUrl });
        return response.data;
    },

    createRazorpaySubscription: async (planId: string) => {
        const response = await api.post('/razorpay/subscribe', { planId });
        return response.data;
    },

    verifyRazorpayPayment: async (paymentResponse: any) => {
        const response = await api.post('/razorpay/verify', paymentResponse);
        return response.data;
    },

    getSubscription: async (): Promise<Subscription> => {
        // Currently only supports getting own subscription
        const response = await api.get('/subscription/me');
        return response.data;
    }
};
