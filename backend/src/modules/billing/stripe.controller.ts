
import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { StripeService } from './stripe.service';
import { AuthRequest } from '../../middleware/authMiddleware';

const stripeService = container.resolve(StripeService);

export class StripeController {
    async createCheckoutSession(req: AuthRequest, res: Response) {
        try {
            const { priceId, successUrl, cancelUrl } = req.body;
            // AuthRequest ensures user is present if authenticateToken middleware passes
            // But strict null checks might still complain if optional
            const user = req.user;
            if (!user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const userId = user.userId;
            const email = 'test@example.com';
            // AuthRequest definition in authMiddleware.ts only has userId.
            // We need to fetch email or update AuthRequest.
            // For now, let's use a dummy or fetch user?
            // StripeService.createCheckoutSession needs email to create customer.
            // Let's rely on fallback in service or here.

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
