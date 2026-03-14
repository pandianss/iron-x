
import { Router } from 'express';
import { RazorpayController } from './razorpay.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
const controller = new RazorpayController();

router.post('/subscribe', authenticateToken, (req, res) => controller.createSubscription(req, res));
router.post('/webhook', (req, res) => controller.webhook(req, res));

export default router;
