
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { AuditController } from './audit.controller';
import { container } from 'tsyringe';

const router = Router();
const auditController = container.resolve(AuditController);

// Protected endpoints
router.get('/search', authenticateToken, auditController.getLogs);
router.get('/export', authenticateToken, auditController.exportLogs);

export default router;
