import { Router } from 'express';
import { container } from 'tsyringe';
import { ActionController } from './action.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { checkLockout } from '../../middleware/lockoutMiddleware';
import { checkActionLimit, checkStrictModeAccess } from '../../middleware/subscriptionMiddleware';

const router = Router();
const actionController = container.resolve(ActionController);

router.use(authenticateToken);

router.post('/', checkLockout, checkActionLimit, checkStrictModeAccess, actionController.createAction);
router.get('/', actionController.getActions);

export default router;
