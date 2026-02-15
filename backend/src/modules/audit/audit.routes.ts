
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { AuditController } from './audit.controller';

const router = Router();

// Protected endpoints
router.get('/search', authenticateToken, AuditController.getLogs);
router.get('/export', authenticateToken, AuditController.exportLogs);

export default router;
