
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { ComplianceController } from './compliance.controller';

const router = Router();

// Public for now (or auth required but no specific role until Enterprise features locked down)
router.get('/report/:framework', authenticateToken, ComplianceController.getReport);
router.get('/export/:framework', authenticateToken, ComplianceController.exportEvidence);

export default router;
