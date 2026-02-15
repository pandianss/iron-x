import { Router } from 'express';
import { container } from 'tsyringe';
import { UserController } from './user.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

import { validate } from '../../middleware/validate';
import { UpdateProfileSchema } from '../../validators/user.validator';

const router = Router();
const userController = container.resolve(UserController);

router.put('/enforcement-mode', authenticateToken, validate(UpdateProfileSchema), userController.updateEnforcementMode);
router.get('/profile', authenticateToken, userController.getProfile);

export default router;
