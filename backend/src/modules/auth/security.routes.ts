import { Router } from 'express';
import { container } from 'tsyringe';
import { SecurityController } from './security.controller';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
const securityController = container.resolve(SecurityController);

// All security routes require authentication
router.use(authenticateToken);

router.post('/setup', securityController.setupMFA);
router.post('/verify', securityController.verifyMFA);
router.post('/disable', securityController.disableMFA);

export default router;
