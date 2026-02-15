
import { Router } from 'express';
import { getAuditLogs, updateSystemConfig, getSystemMetrics } from '../../controllers/adminController';
import { authenticateToken } from '../../middleware/authMiddleware';

import { requireRole } from '../../middleware/roleAuthMiddleware';
import { container } from 'tsyringe';
import { AdminController } from '../../modules/admin/admin.controller';

const router = Router();
const adminController = container.resolve(AdminController);

// Protect all admin routes
router.use(authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']));

router.get('/audit-logs', getAuditLogs);
router.put('/config', updateSystemConfig);
router.get('/metrics', getSystemMetrics);
router.post('/trigger-weekly-digests', adminController.triggerWeeklyDigests);

export default router;
