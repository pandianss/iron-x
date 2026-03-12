import { Router } from 'express';
import { container } from 'tsyringe';
import { AuthController } from './auth.controller';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/sync', authController.sync);

export default router;
