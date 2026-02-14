import { Router } from 'express';
import {
    getIdentity,
    getTomorrowPreview,
    getTrajectory,
    getWeeklyReport,
    getProjectedScore,
    getAnticipatoryWarnings
} from '../controllers/trajectoryController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/identity', getIdentity);
router.get('/trajectory', getTrajectory);
router.get('/preview', getTomorrowPreview);
router.get('/report', getWeeklyReport);
router.get('/projection', getProjectedScore);
router.get('/warnings', getAnticipatoryWarnings);

export default router;
