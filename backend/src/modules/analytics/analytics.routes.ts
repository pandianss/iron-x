
import { Router } from 'express';
import { container } from 'tsyringe';
import { AnalyticsController } from './analytics.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
const analyticsController = container.resolve(AnalyticsController);

router.get('/discipline', authenticateToken, analyticsController.getDisciplineData);
router.get('/team/:teamId/velocity', authenticateToken, analyticsController.getTeamVelocity);

export default router;
