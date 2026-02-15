import { Router } from 'express';
import { container } from 'tsyringe';
import { authenticateToken } from '../../middleware/authMiddleware';
import { requireRole } from '../../middleware/roleAuthMiddleware';
import { SubscriptionController } from './subscription.controller';
import { validate } from '../../middleware/validate';
import { AssignTierSchema } from '../../validators/subscription.validator';

const router = Router();
const controller = container.resolve(SubscriptionController);

// User endpoints
router.get('/me', authenticateToken, controller.getMySubscription);

// Admin endpoints
router.post('/admin/assign', authenticateToken, requireRole(['ADMIN']), validate(AssignTierSchema), controller.assignTier);

export default router;
