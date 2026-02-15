import { Router } from 'express';
import { container } from 'tsyringe';
import { GoalController } from './goal.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { validate } from '../../middleware/validate';
import { CreateGoalSchema } from '../../validators/goal.validator';

import { checkGoalLimit } from '../../middleware/subscriptionMiddleware';

const router = Router();
const goalController = container.resolve(GoalController);

router.use(authenticateToken);

router.post('/', validate(CreateGoalSchema), checkGoalLimit, goalController.createGoal);
router.get('/', goalController.getGoals);

export default router;
