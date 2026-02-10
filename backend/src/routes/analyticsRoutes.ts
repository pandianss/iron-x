
import { Router } from 'express';
import { getDisciplineData } from '../controllers/analyticsController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/daily', getDisciplineData);

export default router;
