
import Stripe from 'stripe';
import { singleton, container } from 'tsyringe';
import { MetricsService } from '../../core/metrics.service';
import { IBillingProvider, CheckoutSessionParams, BillingEvent, BillingWebhookEvent } from './billing.provider';
import prisma from '../../infrastructure/db';
import { Logger } from '../../core/logger';

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

    async handleWebhook(signature: string, payload: Buffer) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        const metrics = container.resolve(MetricsService);

        if (!webhookSecret) {
            Logger.error('[Stripe] STRIPE_WEBHOOK_SECRET is not set. All webhook events will be rejected.');
            metrics.paymentOpsTotal.inc({ provider: 'STRIPE', status: 'CONFIG_ERROR' });
            throw new Error('STRIPE_WEBHOOK_SECRET not configured. Set it in environment variables.');
        }

        let event: Stripe.Event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        } catch (err: any) {
            Logger.error(`[Stripe] Webhook signature verification failed: ${err.message}`);
            metrics.paymentOpsTotal.inc({ provider: 'STRIPE', status: 'SIGNATURE_FAILED' });
            throw new Error(`Webhook signature invalid: ${err.message}`);
        }

        // Idempotency check
        const processed = await prisma.processedEvent.findUnique({
            where: { event_id: event.id }
        });

        if (processed) {
            Logger.info(`[Stripe] Event ${event.id} already processed. Skipping.`);
            metrics.paymentOpsTotal.inc({ provider: 'STRIPE', status: 'DUPLICATE' });
            return;
        }

        try {
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
            Logger.info(`[Stripe] Successfully processed event ${event.id}`);
            metrics.paymentOpsTotal.inc({ provider: 'STRIPE', status: 'SUCCESS' });
        } catch (err: any) {
            Logger.error(`[Stripe] Error processing event ${event.id}: ${err.message}`);
            metrics.paymentOpsTotal.inc({ provider: 'STRIPE', status: 'FAILED' });
            throw err; // Re-throw the error after logging and metrics
        }

        // Mark as processed
        await prisma.processedEvent.create({
            data: {
                event_id: event.id,
                provider: 'stripe',
                type: event.type
            }
        });
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
        const tierMap: Record<string, string> = {
            'price_pro_monthly': 'INDIVIDUAL_PRO',
            'price_enterprise_seats': 'TEAM_ENTERPRISE',
        };

        const tier = tierMap[priceId || ''];
        if (!tier) {
            Logger.warn(`[Stripe] Unknown price ID in checkout: ${priceId}`);
            return;
        }

        await prisma.subscription.upsert({
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

    private async handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
        // Logic for failed payment (e.g., alert user, lock account)
        const customerId = invoice.customer as string;
        const sub = await prisma.subscription.findFirst({ where: { stripe_customer_id: customerId } });
        if (sub) {
            await prisma.subscription.update({
                where: { subscription_id: sub.subscription_id },
                data: { is_active: false }
            });
            Logger.warn(`[Stripe] Payment failed for customer ${customerId}, subscription deactivated`);
        }
    }

    private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
        const customerId = subscription.customer as string;
        const sub = await prisma.subscription.findFirst({ where: { stripe_customer_id: customerId } });
        if (sub) {
            await prisma.subscription.update({
                where: { subscription_id: sub.subscription_id },
                data: { is_active: false, plan_tier: 'FREE' }
            });
            Logger.info(`[Stripe] Subscription deleted for customer ${customerId}`);
        }
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
