import { Router } from 'express';
import { container } from 'tsyringe';
import { GoalController } from './goal.controller';
import { authenticateToken } from '../../middleware/authMiddleware';
import { validateResource } from '../../middleware/validateResource';
import { createGoalSchema } from '../../schemas/goal.schema';

const router = Router();
const goalController = container.resolve(GoalController);

router.use(authenticateToken);

router.post('/', validateResource(createGoalSchema), goalController.createGoal);
router.get('/', goalController.getGoals);

export default router;
