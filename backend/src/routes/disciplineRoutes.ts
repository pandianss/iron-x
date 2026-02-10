import { Router } from 'express';
import { getState, getPressure, getPredictions, getConstraints, getHistory } from '../controllers/disciplineController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/state', getState);
router.get('/pressure', getPressure);
router.get('/predictions', getPredictions);
router.get('/constraints', getConstraints);
router.get('/history', getHistory);

export default router;
