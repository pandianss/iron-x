import { Router } from 'express';
import { createGoal, getGoals } from '../controllers/goalController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken); // Protect all routes

import { checkLockout } from '../middleware/lockoutMiddleware';

router.post('/', checkLockout, createGoal);
router.get('/', getGoals);

export default router;
