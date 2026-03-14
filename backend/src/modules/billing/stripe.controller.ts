
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { StripeService } from './stripe.service';
import { AuthRequest } from '../../middleware/authMiddleware';
import prisma from '../../db';

const stripeService = container.resolve(StripeService);

export class StripeController {
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

            const email = dbUser.email;

            const session = await stripeService.createCheckoutSession(userId, email, priceId, successUrl, cancelUrl);
            res.json({ url: session.url });
        } catch (error: any) {
            console.error('Checkout Error:', error);
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

            const session = await stripeService.createPortalSession(userId, returnUrl);
            res.json({ url: session.url });
        } catch (error: any) {
            console.error('Portal Error:', error);
            res.status(500).json({ error: error.message });
        }
    }

    async handleWebhook(req: Request, res: Response) {
        const signature = req.headers['stripe-signature'] as string;

        try {
            // raw body is needed. Assumes express.raw() middleware usage.
            // Explicitly cast body to Buffer
            await stripeService.handleWebhook(signature, req.body as Buffer);
            res.json({ received: true });
        } catch (error: any) {
            console.error('Webhook Error:', error);
            res.status(400).send(`Webhook Error: ${error.message}`);
        }
    }
}
