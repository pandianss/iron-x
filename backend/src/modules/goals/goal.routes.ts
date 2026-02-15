import { Router } from 'express';
import { container } from 'tsyringe';
import { GoalController } from './goal.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { validateResource } from '../../middleware/validateResource';
import { createGoalSchema } from '../../schemas/goal.schema';

import { checkGoalLimit } from '../../middleware/subscriptionMiddleware';

const router = Router();
const goalController = container.resolve(GoalController);

router.use(authenticateToken);

router.post('/', validateResource(createGoalSchema), checkGoalLimit, goalController.createGoal);
router.get('/', goalController.getGoals);

export default router;
