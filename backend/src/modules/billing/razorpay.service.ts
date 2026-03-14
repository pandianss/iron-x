
import Razorpay from 'razorpay';
import { singleton } from 'tsyringe';
import crypto from 'crypto';
import { IBillingProvider, CheckoutSessionParams, BillingEvent, BillingWebhookEvent } from './billing.provider';
import { Logger } from '../../utils/logger';

@singleton()
export class RazorpayService implements IBillingProvider {
    private razorpay: Razorpay;
    public name = 'razorpay';

    constructor() {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            Logger.warn('Razorpay configuration is missing required environment variables.');
        }

        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || '',
            key_secret: process.env.RAZORPAY_KEY_SECRET || '',
        });
    }

    async createCustomer(userId: string, email: string): Promise<string> {
        const customer = await this.razorpay.customers.create({
            email,
            notes: { userId },
        } as any);
        return customer.id;
    }

    async createCheckoutSession(params: CheckoutSessionParams) {
        const { userId, email, priceId } = params;
        const customerId = await this.createCustomer(userId, email);

        const subscription = await this.razorpay.subscriptions.create({
            plan_id: priceId,
            customer_notify: 1,
            total_count: 12,
            notes: { userId, customerId },
        });

        return subscription;
    }

    async createPortalSession(customerId: string, returnUrl: string) {
        // Razorpay doesn't have a direct equivalent to Stripe Billing Portal
        // Return null or a internal link
        return { url: `/billing?customer=${customerId}` };
    }

    async constructEvent(payload: any, signature: string): Promise<BillingWebhookEvent> {
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (webhookSecret) {
            const expectedSignature = crypto
                .createHmac('sha256', webhookSecret)
                .update(JSON.stringify(payload))
                .digest('hex');

            if (expectedSignature !== signature) {
                throw new Error('Invalid Razorpay signature');
            }
        }

        const eventType = payload.event;
        const body = payload.payload;
        
        const result: BillingWebhookEvent = {
            type: this.mapEventType(eventType),
            raw: payload
        };

        const sub = body.subscription?.entity;
        if (sub) {
            result.subscriptionId = sub.id;
            result.customerId = sub.customer_id;
            result.userId = sub.notes?.userId;
            result.priceId = sub.plan_id;
        }

        return result;
    }

    private mapEventType(razorpayType: string): BillingEvent {
        switch (razorpayType) {
            case 'subscription.activated': return BillingEvent.CHECKOUT_COMPLETED;
            case 'subscription.charged': return BillingEvent.INVOICE_PAID;
            case 'subscription.pending': return BillingEvent.PAYMENT_FAILED;
            case 'subscription.cancelled': return BillingEvent.SUBSCRIPTION_DELETED;
            default: return null as any;
        }
    }
}
