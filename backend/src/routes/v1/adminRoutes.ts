
import { Router } from 'express';
import { getAuditLogs, updateSystemConfig, getSystemMetrics } from '../../controllers/adminController';
import { authenticateToken } from '../../middleware/authMiddleware';

import { requireRole } from '../../middleware/roleAuthMiddleware';

const router = Router();

// Protect all admin routes
router.use(authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']));

router.get('/audit-logs', getAuditLogs);
router.put('/config', updateSystemConfig);
router.get('/metrics', getSystemMetrics);

export default router;
