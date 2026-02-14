import { Router } from 'express';
import { getDailySchedule, logExecution } from '../../controllers/scheduleController';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

import { logExecutionLimiter } from '../../middleware/rateLimitMiddleware';

router.get('/today', getDailySchedule);
router.post('/instances/:id/log', logExecutionLimiter, logExecution);

export default router;
