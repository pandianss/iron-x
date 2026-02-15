import { Router } from 'express';
import { container } from 'tsyringe';
import { PolicyController } from './policy.controller';
import { validate } from '../../middleware/validate';
import { CreatePolicySchema } from '../../validators/policy.validator';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
const policyController = container.resolve(PolicyController);

// Policies
router.post('/policies', authenticateToken, validate(CreatePolicySchema), policyController.createPolicy);
router.get('/policies', policyController.getPolicies);
router.get('/policies/:id', policyController.getPolicyById);
router.put('/policies/:id', policyController.updatePolicy);
router.delete('/policies/:id', policyController.deletePolicy);

// Roles
router.post('/roles', policyController.createRole);
router.get('/roles', policyController.getRoles);
router.post('/roles/assign-policy', policyController.assignPolicyToRole);
router.post('/users/assign-role', policyController.assignRoleToUser);

// Exceptions
router.post('/exceptions/request', policyController.requestException);
router.post('/exceptions/approve', policyController.approveException);

export default router;
