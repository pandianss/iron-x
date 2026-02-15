
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { SecurityController } from './security.controller';
import { container } from 'tsyringe';
import { validate } from '../../middleware/validate';
import { VerifyMFASchema } from '../../validators/auth.validator';

const router = Router();
const securityController = container.resolve(SecurityController);

router.post('/mfa/setup', authenticateToken, securityController.setupMFA);
router.post('/mfa/verify', authenticateToken, validate(VerifyMFASchema), securityController.verifyMFA);
router.post('/mfa/disable', authenticateToken, securityController.disableMFA);

export default router;
