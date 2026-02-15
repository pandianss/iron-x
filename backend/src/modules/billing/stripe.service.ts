
import Stripe from 'stripe';
import prisma from '../../db';

export class StripeService {
    private stripe: Stripe;

    constructor() {
        const apiKey = process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key';
        this.stripe = new Stripe(apiKey, {
            apiVersion: '2025-01-27.acacia',
            typescript: true,
        } as any);
    }

    async createCustomer(userId: string, email: string): Promise<string> {
        // Check if existing
        const existingSub = await (prisma as any).subscription.findUnique({ where: { user_id: userId } });
        if ((existingSub as any)?.stripe_customer_id) return (existingSub as any).stripe_customer_id;

        const customer = await this.stripe.customers.create({
            email,
            metadata: { userId },
        });

        // Update DB
        await (prisma as any).subscription.upsert({
            where: { user_id: userId },
            update: { stripe_customer_id: customer.id },
            create: {
                user_id: userId,
                stripe_customer_id: customer.id,
                plan_tier: 'FREE'
            }
        });

        return customer.id;
    }

    async createCheckoutSession(userId: string, email: string, priceId: string, successUrl: string, cancelUrl: string) {
        const customerId = await this.createCustomer(userId, email);

        const session = await this.stripe.checkout.sessions.create({
            customer: customerId,
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: { userId },
        });

        return session;
    }

    async createPortalSession(userId: string, returnUrl: string) {
        const sub = await (prisma as any).subscription.findUnique({ where: { user_id: userId } });
        if (!(sub as any)?.stripe_customer_id) throw new Error('No Stripe customer found for user');

        const session = await this.stripe.billingPortal.sessions.create({
            customer: (sub as any).stripe_customer_id,
            return_url: returnUrl,
        });

        return session;
    }

    async handleWebhook(signature: string, payload: Buffer) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            // In dev/test, if secret is missing, we might want to log warn and proceed or fail.
            // For verification script, we might not have it set in container env unless we set it.
            // Let's assume strict check.
            console.warn('STRIPE_WEBHOOK_SECRET not set');
            // throw new Error('STRIPE_WEBHOOK_SECRET not set');
        }

        let event: Stripe.Event;

        try {
            if (webhookSecret) {
                event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
            } else {
                // Mock event construction if secret is missing (DANGEROUS in prod, ok for MVP dev/test if we accept anything)
                // But verify_stripe sends a fake signature which will fail signature verification if we strictly enforce it.
                // The verification script expects 400 if signature fails.
                // If we want to support mock, we might need a bypass.
                // For now, let's allow it to throw if construction fails.
                event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret!);
            }
        } catch (err: any) {
            console.error(`Webhook signature verification failed.`, err.message);
            throw new Error(`Webhook Error: ${err.message}`);
        }

        switch (event.type) {
            case 'checkout.session.completed':
                await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
                break;
            case 'invoice.payment_failed':
                await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
                break;
            case 'customer.subscription.deleted':
                await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
    }

    private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
        const customerId = invoice.customer as string;
        const sub = await (prisma as any).subscription.findUnique({ where: { stripe_customer_id: customerId } });

        if (sub?.user_id) {
            const { SubscriptionService } = require('../subscription/subscription.service');
            await SubscriptionService.lockAccount(sub.user_id);
        }
    }

    private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;

        if (userId && subscriptionId) {
            await (prisma as any).subscription.update({
                where: { user_id: userId },
                data: {
                    stripe_subscription_id: subscriptionId,
                    plan_tier: 'INDIVIDUAL_PRO',
                    is_active: true,
                    start_date: new Date(),
                    end_date: null
                }
            });
        }
    }

    private async handleInvoicePaid(invoice: Stripe.Invoice) {
        const subscriptionId = (invoice as any).subscription as string;
        if (subscriptionId) {
            const sub = await (prisma as any).subscription.findUnique({
                where: { stripe_subscription_id: subscriptionId }
            });

            await (prisma as any).subscription.update({
                where: { stripe_subscription_id: subscriptionId },
                data: { is_active: true }
            });

            if ((sub as any)?.is_locked && sub?.user_id) {
                const { SubscriptionService } = require('../subscription/subscription.service');
                await SubscriptionService.unlockAccount(sub.user_id);
            }
        }
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        await (prisma as any).subscription.update({
            where: { stripe_subscription_id: subscription.id },
            data: {
                is_active: false,
                end_date: new Date(),
                plan_tier: 'FREE'
            }
        });
    }
}
