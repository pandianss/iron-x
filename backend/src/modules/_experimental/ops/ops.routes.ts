
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { requireRole } from '../../middleware/roleAuthMiddleware';
import { OpsController } from './ops.controller';
import { RevOpsController } from './revops.controller';
import { container } from 'tsyringe';

const router = Router();
const opsController = container.resolve(OpsController);

router.get('/health', opsController.healthCheck);
router.post('/maintenance', authenticateToken, requireRole(['ADMIN']), opsController.triggerMaintenance);
router.get('/revops', authenticateToken, requireRole(['ADMIN']), RevOpsController.getCommercialMetrics);

export default router;
