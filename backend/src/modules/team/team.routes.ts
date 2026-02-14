import { Router } from 'express';
import { container } from 'tsyringe';
import { TeamController } from './team.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
const teamController = container.resolve(TeamController);

router.post('/', authenticateToken, teamController.createTeam);
router.post('/members', authenticateToken, teamController.addMember);
router.get('/:teamId/stats', authenticateToken, teamController.getTeamStats);
router.get('/:teamId/report', authenticateToken, teamController.exportComplianceReport);

export default router;
