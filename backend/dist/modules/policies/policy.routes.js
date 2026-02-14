"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const policy_controller_1 = require("./policy.controller");
const router = (0, express_1.Router)();
const policyController = tsyringe_1.container.resolve(policy_controller_1.PolicyController);
// Policies
router.post('/policies', policyController.createPolicy);
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
exports.default = router;
