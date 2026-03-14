
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { RazorpayService } from './razorpay.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { AuthRequest } from '../../middleware/authMiddleware';
import { Logger } from '../../utils/logger';
import { BillingEvent } from './billing.provider';
import { SubscriptionTier } from '@prisma/client';

export class RazorpayController {
    private razorpayService = container.resolve(RazorpayService);
    private subService = container.resolve(SubscriptionService);

    async createSubscription(req: AuthRequest, res: Response) {
        try {
            const { planId, successUrl, cancelUrl } = req.body;
            const userId = req.user?.userId;
            const email = req.user?.email;

            if (!userId || !email) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const subscription = await this.razorpayService.createCheckoutSession({
                userId,
                email,
                priceId: planId,
                successUrl: successUrl || '',
                cancelUrl: cancelUrl || ''
            });

            res.json(subscription);
        } catch (error: any) {
            Logger.error('[Razorpay] Subscription Creation Error:', error);
            res.status(400).json({ error: error.message });
        }
    }

    async webhook(req: Request, res: Response) {
        try {
            const signature = req.headers['x-razorpay-signature'] as string;
            const event = await this.razorpayService.constructEvent(req.body, signature);

            if (!event.type) {
                return res.json({ ignored: true });
            }

            switch (event.type) {
                case BillingEvent.CHECKOUT_COMPLETED:
                case BillingEvent.INVOICE_PAID:
                    if (event.userId && event.subscriptionId && event.customerId) {
                        await this.subService.activateSubscription({
                            userId: event.userId,
                            tier: SubscriptionTier.INDIVIDUAL_PRO,
                            subscriptionId: event.subscriptionId,
                            customerId: event.customerId,
                            provider: 'razorpay'
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

            res.status(200).send('OK');
        } catch (error: any) {
            Logger.error('[Razorpay] Webhook Error:', error);
            res.status(400).json({ error: error.message });
        }
    }
}
