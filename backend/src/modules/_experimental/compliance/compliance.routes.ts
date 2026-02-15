
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { ComplianceController } from './compliance.controller';
import { container } from 'tsyringe';

const router = Router();
const complianceController = container.resolve(ComplianceController);

// Public for now (or auth required but no specific role until Enterprise features locked down)
router.get('/report/:framework', authenticateToken, complianceController.getReport);
router.get('/export/:framework', authenticateToken, complianceController.exportEvidence);

export default router;
