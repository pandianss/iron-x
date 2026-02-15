
import { Router } from 'express';
import { StripeController } from './stripe.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import express from 'express';

const router = Router();
const controller = new StripeController();

// Checkout (Protected)
router.post('/checkout', authenticateToken, controller.createCheckoutSession);

// Portal (Protected)
router.post('/portal', authenticateToken, controller.createPortalSession);

// Webhook (Public, Raw Body)
// Note: Webhook needs raw body. We might need to handle this in app.ts specifically for this route
// or use express.raw({ type: 'application/json' }) here?
// Webhook (Public, Raw Body)
// Note: Webhook needs raw body. We might need to handle this in app.ts specifically for this route
// or use express.raw({ type: 'application/json' }) here?
router.post('/webhook', express.raw({ type: 'application/json' }), controller.handleWebhook as any);

export default router;
