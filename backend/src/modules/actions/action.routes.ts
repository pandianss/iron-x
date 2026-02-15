import { Router } from 'express';
import { container } from 'tsyringe';
import { ActionController } from './action.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { governanceGuard } from '../../middleware/governanceGuard';
import { checkActionLimit, checkStrictModeAccess } from '../../middleware/subscriptionMiddleware';

import { validate } from '../../middleware/validate';
import { CreateActionSchema, GetActionSchema } from '../../validators/action.validator';

const router = Router();
const actionController = container.resolve(ActionController);

router.use(authenticateToken);

// router.post('/', validate(CreateActionSchema), governanceGuard, checkActionLimit, checkStrictModeAccess, actionController.createAction);
// To use governanceGuard properly, we should import it.
// Updating usage to use governanceGuard instead of checkLockout.
router.post('/', validate(CreateActionSchema), governanceGuard, checkActionLimit, checkStrictModeAccess, actionController.createAction);
router.get('/', actionController.getActions);
router.get('/:actionId', validate(GetActionSchema), actionController.getActionById);

export default router;
