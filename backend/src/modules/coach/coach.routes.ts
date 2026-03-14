import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { CoachController } from './coach.controller';

const router = Router();
const controller = new CoachController();

router.use(authenticateToken);
router.post('/coach/initialize', (req, res) => controller.initializeCoach(req, res));
router.get('/coach/dashboard', (req, res) => controller.getCoachDashboard(req, res));

export default router;
