import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from './auth.controller';
import { validate } from '../../middleware/validate';
import { RegisterSchema, LoginSchema } from '../../validators/auth.validator';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/register', validate(RegisterSchema), authController.register);
router.post('/login', validate(LoginSchema), authController.login);

export default router;
