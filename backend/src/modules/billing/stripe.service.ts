
import Stripe from 'stripe';
import { singleton, container } from 'tsyringe';
import { IBillingProvider, CheckoutSessionParams, BillingEvent, BillingWebhookEvent } from './billing.provider';
import { Logger } from '../../utils/logger';

@singleton()
export class StripeService implements IBillingProvider {
    private stripe: Stripe;
    public name = 'stripe';

    constructor() {
        const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
        this.stripe = new Stripe(apiKey, {
            apiVersion: '2026-01-28.clover' as any,
            typescript: true,
        });
    }

    async createCustomer(userId: string, email: string): Promise<string> {
        const customer = await this.stripe.customers.create({
            email,
            metadata: { userId },
        });
        return customer.id;
    }

    async createCheckoutSession(params: CheckoutSessionParams) {
        const { userId, email, priceId, successUrl, cancelUrl } = params;
        
        // This should probably be handled by a factory or passed in
        const customerId = await this.createCustomer(userId, email);

        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { userId },
        });

        return session;
    }

    async createPortalSession(customerId: string, returnUrl: string) {
        return this.stripe.billingPortal.sessions.create({
            customer: customerId,
            return_url: returnUrl,
        });
    }

    async constructEvent(payload: Buffer, signature: string): Promise<BillingWebhookEvent> {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET not configured');

        const event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        
        const result: BillingWebhookEvent = {
            type: this.mapEventType(event.type),
            raw: event
        };

        const data = event.data.object as any;
        result.customerId = data.customer;
        result.subscriptionId = data.subscription || data.id;
        result.userId = data.metadata?.userId;

        if (event.type === 'checkout.session.completed') {
            const lineItems = await this.stripe.checkout.sessions.listLineItems(data.id);
            result.priceId = lineItems.data[0]?.price?.id;
        }

        return result;
    }

    private mapEventType(stripeType: string): BillingEvent {
        switch (stripeType) {
            case 'checkout.session.completed': return BillingEvent.CHECKOUT_COMPLETED;
            case 'invoice.paid': return BillingEvent.INVOICE_PAID;
            case 'invoice.payment_failed': return BillingEvent.PAYMENT_FAILED;
            case 'customer.subscription.deleted': return BillingEvent.SUBSCRIPTION_DELETED;
            default: return null as any;
        }
    }
}
