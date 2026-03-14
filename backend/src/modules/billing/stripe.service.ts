
import Stripe from 'stripe';
import prisma from '../../db';
import { container } from 'tsyringe';

import { Logger } from '../../utils/logger';

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
            // Fail hard and loud — missing webhook secret means no subscriptions will activate
            Logger.error('[Stripe] STRIPE_WEBHOOK_SECRET is not set. All webhook events will be rejected.');
            throw new Error('STRIPE_WEBHOOK_SECRET not configured. Set it in environment variables.');
        }

        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err: any) {
            Logger.error(`[Stripe] Webhook signature verification failed: ${err.message}`);
            throw new Error(`Webhook signature invalid: ${err.message}`);
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
                Logger.info(`[Stripe] Unhandled event type: ${event.type}`);
        }
    }

    private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
        const customerId = invoice.customer as string;
        const sub = await (prisma as any).subscription.findUnique({ where: { stripe_customer_id: customerId } });

        if (sub?.user_id) {
            const { SubscriptionService: SubService } = await import('../subscription/subscription.service');
            const subService = container.resolve(SubService);
            await subService.lockAccount(sub.user_id);
        }
    }

    private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
        const userId = session.metadata?.userId;
        if (!userId) {
            Logger.error('[Stripe] checkout.session.completed missing userId in metadata');
            return;
        }

        // Determine tier from the price ID purchased
        const lineItems = await this.stripe.checkout.sessions.listLineItems(session.id);
        const priceId = lineItems.data[0]?.price?.id;

        // Map price ID to subscription tier
        // Update these to match your actual Stripe price IDs
        const tierMap: Record<string, string> = {
            'price_pro_monthly': 'INDIVIDUAL_PRO',
            'price_enterprise_seats': 'TEAM_ENTERPRISE',
        };

        const tier = tierMap[priceId || ''];
        if (!tier) {
            Logger.warn(`[Stripe] Unknown price ID in checkout: ${priceId}`);
            return;
        }

        await (prisma as any).subscription.upsert({
            where: { user_id: userId },
            update: {
                plan_tier: tier as any,
                stripe_subscription_id: session.subscription as string,
                is_active: true,
                updated_at: new Date()
            },
            create: {
                user_id: userId,
                plan_tier: tier as any,
                stripe_subscription_id: session.subscription as string,
                is_active: true
            }
        });

        Logger.info(`[Stripe] User ${userId} upgraded to ${tier}`);
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
                const { SubscriptionService: SubService } = await import('../subscription/subscription.service');
                const subService = container.resolve(SubService);
                await subService.unlockAccount(sub.user_id);
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
