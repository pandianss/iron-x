
import { Router } from 'express';
import { createTeam, addMember, getTeamStats, exportComplianceReport } from '../controllers/teamController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/', authenticateToken, createTeam);
router.post('/members', authenticateToken, addMember);
router.get('/:teamId/stats', authenticateToken, getTeamStats);
router.get('/:teamId/report', authenticateToken, exportComplianceReport);

export default router;
