
import { Router } from 'express';
import { getAuditLogs, updateSystemConfig, getSystemMetrics } from '../controllers/adminController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// TODO: Add admin role check middleware
router.get('/audit-logs', authenticateToken, getAuditLogs);
router.put('/config', authenticateToken, updateSystemConfig);
router.get('/metrics', authenticateToken, getSystemMetrics);

export default router;
