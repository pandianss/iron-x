import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { DriftReportController } from './driftReport.controller';

const router = Router();
const controller = new DriftReportController();

router.use(authenticateToken);
router.post('/analytics/drift-report', (req, res) => controller.generateDriftReport(req, res));

export default router;
