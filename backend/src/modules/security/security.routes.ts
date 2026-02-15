
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { SecurityController } from './security.controller';
import { container } from 'tsyringe';

const router = Router();
const securityController = container.resolve(SecurityController);

router.post('/mfa/setup', authenticateToken, securityController.setupMFA);
router.post('/mfa/verify', authenticateToken, securityController.verifyMFA);
router.post('/mfa/disable', authenticateToken, securityController.disableMFA);

export default router;
