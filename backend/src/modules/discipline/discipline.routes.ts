import { Router } from 'express';
import { container } from 'tsyringe';
import { DisciplineController } from './discipline.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
const disciplineController = container.resolve(DisciplineController);

// Authenticate all routes
router.use(authenticateToken);

router.get('/state', disciplineController.getState);
router.get('/pressure', disciplineController.getPressure);
router.get('/predictions', disciplineController.getPredictions);
router.get('/constraints', disciplineController.getConstraints);
router.get('/history', disciplineController.getHistory);
router.post('/trigger-cycle', disciplineController.triggerCycle);

export default router;
