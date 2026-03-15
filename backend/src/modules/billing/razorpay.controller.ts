import { Request, Response } from 'express';
import { injectable } from 'tsyringe';
import { RazorpayService } from './razorpay.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { AuthRequest } from '../../middleware/authMiddleware';
import { Logger } from '../../core/logger';
import { BillingEvent } from './billing.provider';
import { SubscriptionTier } from '@prisma/client';

@injectable()
export class RazorpayController {
    constructor(
        private razorpayService: RazorpayService,
        private subService: SubscriptionService
    ) {}

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
            await this.razorpayService.handleWebhook(req.body, signature);
            res.status(200).send('OK');
        } catch (error: any) {
            Logger.error('[Razorpay] Webhook Error:', error);
            res.status(400).json({ error: error.message });
        }
    }
}
