
import { Router } from 'express';
import { SSOController } from './sso.controller';

const router = Router();

// Public routes for SSO handshake
router.get('/login', SSOController.login);
router.post('/callback', SSOController.callback);

export default router;
