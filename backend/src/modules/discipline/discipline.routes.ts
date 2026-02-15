
import { Router } from 'express';
import { DisciplineController } from './discipline.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/state', DisciplineController.getState);
router.get('/pressure', DisciplineController.getPressure);
router.get('/trajectory', DisciplineController.getTrajectory);
router.get('/identity', DisciplineController.getIdentity);
router.get('/history', DisciplineController.getHistory);
router.get('/preview', DisciplineController.getPreview);
router.get('/warnings', DisciplineController.getWarnings);

router.post('/refresh', DisciplineController.refreshScore);

export default router;
