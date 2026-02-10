
import { Router } from 'express';
import { updateEnforcementMode } from '../controllers/userController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.put('/enforcement-mode', authenticateToken, updateEnforcementMode);

export default router;
