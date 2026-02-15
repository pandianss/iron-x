
import { Router } from 'express';
import { authenticateToken } from '../../middleware/authMiddleware';
import { requireRole } from '../../middleware/roleAuthMiddleware';
import { OrganizationController } from './organization.controller';
import { container } from 'tsyringe';
import { validate } from '../../middleware/validate';
import { CreateOrgSchema } from '../../validators/organization.validator';

const router = Router();
const organizationController = container.resolve(OrganizationController);

router.post('/', authenticateToken, requireRole(['ADMIN']), validate(CreateOrgSchema), organizationController.createOrganization);
router.get('/:slug', authenticateToken, organizationController.getOrganization);
router.get('/:orgId/stats', authenticateToken, organizationController.getStats);
router.post('/:orgId/users', authenticateToken, requireRole(['ADMIN', 'ORG_ADMIN']), organizationController.addUser);

export default router;
