"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const policyController_1 = require("../controllers/policyController");
const router = (0, express_1.Router)();
// Policies
router.post('/policies', policyController_1.createPolicy);
router.get('/policies', policyController_1.getPolicies);
router.get('/policies/:id', policyController_1.getPolicyById);
router.put('/policies/:id', policyController_1.updatePolicy);
router.delete('/policies/:id', policyController_1.deletePolicy);
// Roles
router.post('/roles', policyController_1.createRole);
router.get('/roles', policyController_1.getRoles);
router.post('/roles/assign-policy', policyController_1.assignPolicyToRole);
router.post('/users/assign-role', policyController_1.assignRoleToUser);
// Exceptions
router.post('/exceptions/request', policyController_1.requestException);
router.post('/exceptions/approve', policyController_1.approveException);
exports.default = router;
