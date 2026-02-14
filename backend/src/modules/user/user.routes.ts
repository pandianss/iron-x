import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from './user.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
const userController = container.resolve(UserController);

router.put('/enforcement-mode', authenticateToken, userController.updateEnforcementMode);
router.get('/profile', authenticateToken, userController.getProfile);

export default router;
