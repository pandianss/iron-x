
import { Router } from 'express';
import { RazorpayController } from './razorpay.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

import { container } from 'tsyringe';
import { validate } from '../../middleware/validate';
import { RazorpaySubscribeSchema } from '../../validators/billing.validator';

const router = Router();
const controller = container.resolve(RazorpayController);

router.post('/subscribe', authenticateToken, validate(RazorpaySubscribeSchema), (req, res) => controller.createSubscription(req, res));
router.post('/webhook', (req, res) => controller.webhook(req, res));

export default router;
