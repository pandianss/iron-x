
import { Router } from 'express';
import { RazorpayController } from './razorpay.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

router.post('/subscribe', authenticateToken, RazorpayController.createSubscription);
router.post('/verify', authenticateToken, RazorpayController.verifyPayment);
router.post('/webhook', RazorpayController.webhook);

export default router;
