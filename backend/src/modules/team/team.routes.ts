import { Router } from 'express';
import { container } from 'tsyringe';
import { TeamController } from './team.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

import { checkTeamLimit } from '../../middleware/subscriptionMiddleware';

const router = Router();
const teamController = container.resolve(TeamController);

router.post('/', authenticateToken, checkTeamLimit, teamController.createTeam);
router.post('/members', authenticateToken, teamController.addMember);
router.get('/:teamId/stats', authenticateToken, teamController.getTeamStats);
router.get('/:teamId/report', authenticateToken, teamController.exportComplianceReport);
router.post('/:teamId/invite', authenticateToken, teamController.inviteMember);
router.post('/invites/:token/accept', authenticateToken, teamController.acceptInvite);

export default router;
