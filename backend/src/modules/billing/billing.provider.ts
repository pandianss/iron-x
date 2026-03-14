
export interface CheckoutSessionParams {
    userId: string;
    email: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
}

export interface IBillingProvider {
    name: string;
    createCustomer(userId: string, email: string): Promise<string>;
    createCheckoutSession(params: CheckoutSessionParams): Promise<any>;
    createPortalSession(customerId: string, returnUrl: string): Promise<any>;
    // Webhook parsing is often provider-specific, but we can standardize the output event
}

export enum BillingEvent {
    CHECKOUT_COMPLETED = 'CHECKOUT_COMPLETED',
    INVOICE_PAID = 'INVOICE_PAID',
    PAYMENT_FAILED = 'PAYMENT_FAILED',
    SUBSCRIPTION_DELETED = 'SUBSCRIPTION_DELETED',
}

export interface BillingWebhookEvent {
    type: BillingEvent;
    userId?: string;
    customerId?: string;
    subscriptionId?: string;
    priceId?: string;
    raw?: any;
}
