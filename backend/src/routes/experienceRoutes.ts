import { Router } from 'express';
import { getIdentity, getTomorrowPreview, getTrajectory, getWeeklyReport } from '../controllers/experienceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/identity', getIdentity);
router.get('/trajectory', getTrajectory);
router.get('/preview', getTomorrowPreview);
router.get('/report', getWeeklyReport);

export default router;
