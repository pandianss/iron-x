
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { requireRole } from '../../middleware/roleAuthMiddleware';
import * as SubscriptionController from './subscription.controller';

const router = Router();

// User endpoints
router.get('/me', authenticateToken, SubscriptionController.getMySubscription);

// Admin endpoints
router.post('/admin/assign', authenticateToken, requireRole(['ADMIN']), SubscriptionController.assignTier);

export default router;
