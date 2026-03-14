
import { Router } from 'express';
import { StripeController } from './stripe.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import express from 'express';

const router = Router();
const controller = new StripeController();

// Checkout (Protected)
router.post('/checkout', authenticateToken, (req, res) => controller.createCheckoutSession(req, res));

// Portal (Protected)
router.post('/portal', authenticateToken, (req, res) => controller.createPortalSession(req, res));

// Webhook (Public, Raw Body)
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => controller.handleWebhook(req, res));

export default router;
