
import { Router } from 'express';
import { StripeController } from './stripe.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import express from 'express';

import { container } from 'tsyringe';
import { validate } from '../../middleware/validate';
import { StripeCheckoutSchema, StripePortalSchema } from '../../validators/billing.validator';

const router = Router();
const controller = container.resolve(StripeController);

// Checkout (Protected)
router.post('/checkout', authenticateToken, validate(StripeCheckoutSchema), (req, res) => controller.createCheckoutSession(req, res));

// Portal (Protected)
router.post('/portal', authenticateToken, validate(StripePortalSchema), (req, res) => controller.createPortalSession(req, res));

// Webhook (Public, Raw Body)
router.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => controller.handleWebhook(req, res));

export default router;
