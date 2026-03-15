import { Router } from 'express';
import { container } from 'tsyringe';
import { TeamController } from './team.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

import { checkTeamLimit } from '../../middleware/subscriptionMiddleware';
import { validate } from '../../middleware/validate';
import { CreateTeamSchema, InviteMemberSchema, AddMemberSchema, AcceptInviteSchema } from '../../validators/team.validator';

const router = Router();
const teamController = container.resolve(TeamController);

router.post('/', authenticateToken, validate(CreateTeamSchema), checkTeamLimit, teamController.createTeam);
router.post('/members', authenticateToken, validate(AddMemberSchema), teamController.addMember);
router.get('/:teamId/stats', authenticateToken, teamController.getTeamStats);
router.get('/:teamId/report', authenticateToken, teamController.exportComplianceReport);
router.post('/:teamId/invite', authenticateToken, validate(InviteMemberSchema), teamController.inviteMember);
router.post('/invites/:token/accept', authenticateToken, validate(AcceptInviteSchema), teamController.acceptInvite);

export default router;
