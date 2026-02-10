import { Router } from 'express';
import { createAction, getActions } from '../controllers/actionController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

import { checkLockout } from '../middleware/lockoutMiddleware';
import { checkActionLimit, checkStrictModeAccess } from '../middleware/subscriptionMiddleware';

router.post('/', checkLockout, checkActionLimit, checkStrictModeAccess, createAction);
router.get('/', getActions);

export default router;
