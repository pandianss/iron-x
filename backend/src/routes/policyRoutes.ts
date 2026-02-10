import { Router } from 'express';
import {
    createPolicy, getPolicies, getPolicyById, updatePolicy, deletePolicy,
    createRole, getRoles, assignPolicyToRole, assignRoleToUser,
    requestException, approveException
} from '../controllers/policyController';

const router = Router();

// Policies
router.post('/policies', createPolicy);
router.get('/policies', getPolicies);
router.get('/policies/:id', getPolicyById);
router.put('/policies/:id', updatePolicy);
router.delete('/policies/:id', deletePolicy);

// Roles
router.post('/roles', createRole);
router.get('/roles', getRoles);
router.post('/roles/assign-policy', assignPolicyToRole);
router.post('/users/assign-role', assignRoleToUser);

// Exceptions
router.post('/exceptions/request', requestException);
router.post('/exceptions/approve', approveException);

export default router;
