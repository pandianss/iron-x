import { Router } from 'express';
import { container } from 'tsyringe';
import { ActionController } from './action.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { checkLockout } from '../../middleware/lockoutMiddleware';
import { checkActionLimit, checkStrictModeAccess } from '../../middleware/subscriptionMiddleware';

import { validate } from '../../middleware/validate';
import { CreateActionSchema, GetActionSchema } from '../../validators/action.validator';

const router = Router();
const actionController = container.resolve(ActionController);

router.use(authenticateToken);

router.post('/', validate(CreateActionSchema), checkLockout, checkActionLimit, checkStrictModeAccess, actionController.createAction);
router.get('/', actionController.getActions);
router.get('/:actionId', validate(GetActionSchema), actionController.getActionById);

export default router;
