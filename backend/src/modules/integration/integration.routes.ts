
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { requireRole } from '../../middleware/roleAuthMiddleware';
import { IntegrationController } from './integration.controller';
import { container } from 'tsyringe';

const router = Router();
const integrationController = container.resolve(IntegrationController);

// Manage Webhooks
router.post('/webhooks', authenticateToken, requireRole(['ADMIN', 'ORG_ADMIN']), integrationController.createWebhook);
router.get('/:orgId/webhooks', authenticateToken, integrationController.getWebhooks);

// Manage API Keys
router.post('/:orgId/keys', authenticateToken, requireRole(['ADMIN', 'ORG_ADMIN']), integrationController.generateApiKey);
router.get('/:orgId/keys', authenticateToken, integrationController.getKeys);

export default router;
