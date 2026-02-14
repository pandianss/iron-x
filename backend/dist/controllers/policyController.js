"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveException = exports.requestException = exports.assignRoleToUser = exports.assignPolicyToRole = exports.getRoles = exports.createRole = exports.deletePolicy = exports.updatePolicy = exports.getPolicyById = exports.getPolicies = exports.createPolicy = void 0;
const policyService_1 = require("../services/policyService");
// --- Policies ---
const createPolicy = async (req, res) => {
    try {
        const policy = await policyService_1.PolicyService.createPolicy(req.body);
        res.json(policy);
    }
    catch (error) {
        console.error('Error creating policy:', error);
        res.status(500).json({ error: 'Failed to create policy' });
    }
};
exports.createPolicy = createPolicy;
const getPolicies = async (req, res) => {
    try {
        const policies = await policyService_1.PolicyService.getAllPolicies();
        res.json(policies);
    }
    catch (error) {
        console.error('Error fetching policies:', error);
        res.status(500).json({ error: 'Failed to fetch policies' });
    }
};
exports.getPolicies = getPolicies;
const getPolicyById = async (req, res) => {
    try {
        const policy = await policyService_1.PolicyService.getPolicyById(req.params.id);
        if (!policy) {
            res.status(404).json({ error: 'Policy not found' });
            return;
        }
        res.json(policy);
    }
    catch (error) {
        console.error('Error fetching policy:', error);
        res.status(500).json({ error: 'Failed to fetch policy' });
    }
};
exports.getPolicyById = getPolicyById;
const updatePolicy = async (req, res) => {
    try {
        const policy = await policyService_1.PolicyService.updatePolicy(req.params.id, req.body);
        res.json(policy);
    }
    catch (error) {
        console.error('Error updating policy:', error);
        res.status(500).json({ error: 'Failed to update policy' });
    }
};
exports.updatePolicy = updatePolicy;
const deletePolicy = async (req, res) => {
    try {
        await policyService_1.PolicyService.deletePolicy(req.params.id);
        res.json({ message: 'Policy deleted' });
    }
    catch (error) {
        console.error('Error deleting policy:', error);
        res.status(500).json({ error: 'Failed to delete policy' });
    }
};
exports.deletePolicy = deletePolicy;
// --- Roles ---
const createRole = async (req, res) => {
    try {
        const role = await policyService_1.PolicyService.createRole(req.body);
        res.json(role);
    }
    catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'Failed to create role' });
    }
};
exports.createRole = createRole;
const getRoles = async (req, res) => {
    try {
        const roles = await policyService_1.PolicyService.getAllRoles();
        res.json(roles);
    }
    catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
};
exports.getRoles = getRoles;
const assignPolicyToRole = async (req, res) => {
    try {
        const { roleId, policyId } = req.body;
        const role = await policyService_1.PolicyService.assignPolicyToRole(roleId, policyId);
        res.json(role);
    }
    catch (error) {
        console.error('Error assigning policy to role:', error);
        res.status(500).json({ error: 'Failed to assign policy' });
    }
};
exports.assignPolicyToRole = assignPolicyToRole;
const assignRoleToUser = async (req, res) => {
    try {
        const { userId, roleId } = req.body;
        const user = await policyService_1.PolicyService.assignRoleToUser(userId, roleId);
        res.json(user);
    }
    catch (error) {
        console.error('Error assigning role to user:', error);
        res.status(500).json({ error: 'Failed to assign role' });
    }
};
exports.assignRoleToUser = assignRoleToUser;
// --- Exceptions ---
const requestException = async (req, res) => {
    try {
        const exception = await policyService_1.PolicyService.requestException(req.body);
        res.json(exception);
    }
    catch (error) {
        console.error('Error requesting exception:', error);
        res.status(500).json({ error: 'Failed to request exception' });
    }
};
exports.requestException = requestException;
const approveException = async (req, res) => {
    try {
        const { exceptionId, approverId } = req.body;
        const exception = await policyService_1.PolicyService.approveException(exceptionId, approverId);
        res.json(exception);
    }
    catch (error) {
        console.error('Error approving exception:', error);
        res.status(500).json({ error: 'Failed to approve exception' });
    }
};
exports.approveException = approveException;
