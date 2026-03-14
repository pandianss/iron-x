
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { StripeService } from './stripe.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { AuthRequest } from '../../middleware/authMiddleware';
import prisma from '../../db';
import { Logger } from '../../utils/logger';
import { BillingEvent } from './billing.provider';
import { SubscriptionTier } from '@prisma/client';

export class StripeController {
    private stripeService = container.resolve(StripeService);
    private subService = container.resolve(SubscriptionService);

    async createCheckoutSession(req: AuthRequest, res: Response) {
        try {
            const { priceId, successUrl, cancelUrl } = req.body;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const dbUser = await prisma.user.findUnique({
                where: { user_id: userId },
                select: { email: true }
            });

            if (!dbUser) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            const session = await this.stripeService.createCheckoutSession({
                userId,
                email: dbUser.email,
                priceId,
                successUrl,
                cancelUrl
            });
            
            res.json({ url: session.url });
        } catch (error: any) {
            Logger.error('[Stripe] Checkout Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async createPortalSession(req: AuthRequest, res: Response) {
        try {
            const { returnUrl } = req.body;
            const userId = req.user?.userId;

            if (!userId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }

            const sub = await this.subService.getSubscription(userId);
            if (!sub?.stripe_customer_id) {
                return res.status(400).json({ error: 'No Stripe customer profile found' });
            }

            const session = await this.stripeService.createPortalSession(sub.stripe_customer_id, returnUrl);
            res.json({ url: session.url });
        } catch (error: any) {
            Logger.error('[Stripe] Portal Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async handleWebhook(req: Request, res: Response) {
        const signature = req.headers['stripe-signature'] as string;

        try {
            const event = await this.stripeService.constructEvent(req.body as Buffer, signature);
            
            if (!event.type) {
                return res.json({ ignored: true });
            }

            switch (event.type) {
                case BillingEvent.CHECKOUT_COMPLETED:
                case BillingEvent.INVOICE_PAID:
                    if (event.userId && event.priceId && event.subscriptionId && event.customerId) {
                        const tier = this.mapPriceToTier(event.priceId);
                        await this.subService.activateSubscription({
                            userId: event.userId,
                            tier,
                            subscriptionId: event.subscriptionId,
                            customerId: event.customerId,
                            provider: 'stripe'
                        });
                    }
                    break;
                case BillingEvent.PAYMENT_FAILED:
                    if (event.userId) {
                        await this.subService.lockAccount(event.userId);
                    }
                    break;
                case BillingEvent.SUBSCRIPTION_DELETED:
                    if (event.userId) {
                        await this.subService.deactivateSubscription(event.userId);
                    }
                    break;
            }

            res.json({ received: true });
        } catch (error: any) {
            Logger.error('[Stripe] Webhook Error:', error);
            res.status(400).send(`Webhook Error: ${error.message}`);
        }
    }

    private mapPriceToTier(priceId: string): SubscriptionTier {
        const tierMap: Record<string, SubscriptionTier> = {
            'price_pro_monthly': SubscriptionTier.INDIVIDUAL_PRO,
            'price_enterprise_seats': SubscriptionTier.TEAM_ENTERPRISE,
        };
        return tierMap[priceId] || SubscriptionTier.FREE;
    }
}
