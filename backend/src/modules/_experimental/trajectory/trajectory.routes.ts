import { Router } from 'express';
import { container } from 'tsyringe';
import { TrajectoryController } from './trajectory.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
const trajectoryController = container.resolve(TrajectoryController);

router.use(authenticateToken);

router.get('/identity', trajectoryController.getIdentity);
router.get('/trajectory', trajectoryController.getTrajectory);
router.get('/preview', trajectoryController.getTomorrowPreview);
router.get('/report', trajectoryController.getWeeklyReport);
router.get('/projection', trajectoryController.getProjectedScore);
router.get('/warnings', trajectoryController.getAnticipatoryWarnings);

export default router;
