
import Razorpay from 'razorpay';
import { singleton, container } from 'tsyringe';
import crypto from 'crypto';
import { IBillingProvider, CheckoutSessionParams, BillingEvent, BillingWebhookEvent } from './billing.provider';
import prisma from '../../infrastructure/db';
import { MetricsService } from '../../core/metrics.service';
import { Logger } from '../../core/logger';

@singleton()
export class RazorpayService implements IBillingProvider {
    private razorpay: Razorpay;
    public name = 'razorpay';

    constructor() {
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            Logger.warn('Razorpay configuration is missing required environment variables.');
        }

        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
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
            id: payload.id, // Capture event ID
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

    async handleWebhook(payload: any, signature: string) {
        const event = await this.constructEvent(payload, signature);
        
        if (!event.type || !event.id) {
            return;
        }

        const metrics = container.resolve(MetricsService);

        // Idempotency check
        const alreadyProcessed = await prisma.processedEvent.findUnique({
            where: { event_id: event.id }
        });

        if (alreadyProcessed) {
            Logger.info(`[Razorpay] Event ${event.id} already processed. Skipping.`);
            metrics.paymentOpsTotal.inc({ provider: 'RAZORPAY', status: 'DUPLICATE' });
            return;
        }

        const subService = container.resolve((await import('../subscription/subscription.service')).SubscriptionService);

        switch (event.type) {
            case BillingEvent.CHECKOUT_COMPLETED:
            case BillingEvent.INVOICE_PAID:
                if (event.userId && event.subscriptionId && event.customerId) {
                    await subService.activateSubscription({
                        userId: event.userId,
                        tier: 'INDIVIDUAL_PRO' as any,
                        subscriptionId: event.subscriptionId,
                        customerId: event.customerId,
                        provider: 'razorpay'
                    });
                }
                break;
            case BillingEvent.PAYMENT_FAILED:
                if (event.userId) {
                    await subService.lockAccount(event.userId);
                }
                break;
            case BillingEvent.SUBSCRIPTION_DELETED:
                if (event.userId) {
                    await subService.deactivateSubscription(event.userId);
                }
                break;
        }

        try {
            // Processing logic is already above, let's wrap it in try/catch or assume success if it reaches here
            Logger.info(`[Razorpay] Successfully processed event ${event.id}`);
            metrics.paymentOpsTotal.inc({ provider: 'RAZORPAY', status: 'SUCCESS' });
        } catch (err: any) {
            Logger.error(`[Razorpay] Error processing event ${event.id}: ${err.message}`);
            metrics.paymentOpsTotal.inc({ provider: 'RAZORPAY', status: 'FAILED' });
            throw err;
        }

        // Mark as processed
        await prisma.processedEvent.create({
            data: {
                event_id: event.id,
                provider: 'razorpay',
                type: event.type
            }
        });
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
