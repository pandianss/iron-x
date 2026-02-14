import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from './auth.controller';
import { validateResource } from '../../middleware/validateResource';
import { registerSchema, loginSchema } from '../../schemas/auth.schema';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/register', validateResource(registerSchema), authController.register);
router.post('/login', validateResource(loginSchema), authController.login);

export default router;
