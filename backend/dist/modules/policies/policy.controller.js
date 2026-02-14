"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyController = void 0;
const tsyringe_1 = require("tsyringe");
const policy_service_1 = require("./policy.service");
let PolicyController = class PolicyController {
    constructor(policyService) {
        this.policyService = policyService;
        // --- Policies ---
        this.createPolicy = async (req, res) => {
            try {
                const policy = await this.policyService.createPolicy(req.body);
                res.json(policy);
            }
            catch (error) {
                console.error('Error creating policy:', error);
                res.status(500).json({ error: 'Failed to create policy' });
            }
        };
        this.getPolicies = async (req, res) => {
            try {
                const policies = await this.policyService.getAllPolicies();
                res.json(policies);
            }
            catch (error) {
                console.error('Error fetching policies:', error);
                res.status(500).json({ error: 'Failed to fetch policies' });
            }
        };
        this.getPolicyById = async (req, res) => {
            try {
                const policy = await this.policyService.getPolicyById(req.params.id);
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
        this.updatePolicy = async (req, res) => {
            try {
                const policy = await this.policyService.updatePolicy(req.params.id, req.body);
                res.json(policy);
            }
            catch (error) {
                console.error('Error updating policy:', error);
                res.status(500).json({ error: 'Failed to update policy' });
            }
        };
        this.deletePolicy = async (req, res) => {
            try {
                await this.policyService.deletePolicy(req.params.id);
                res.json({ message: 'Policy deleted' });
            }
            catch (error) {
                console.error('Error deleting policy:', error);
                res.status(500).json({ error: 'Failed to delete policy' });
            }
        };
        // --- Roles ---
        this.createRole = async (req, res) => {
            try {
                const role = await this.policyService.createRole(req.body);
                res.json(role);
            }
            catch (error) {
                console.error('Error creating role:', error);
                res.status(500).json({ error: 'Failed to create role' });
            }
        };
        this.getRoles = async (req, res) => {
            try {
                const roles = await this.policyService.getAllRoles();
                res.json(roles);
            }
            catch (error) {
                console.error('Error fetching roles:', error);
                res.status(500).json({ error: 'Failed to fetch roles' });
            }
        };
        this.assignPolicyToRole = async (req, res) => {
            try {
                const { roleId, policyId } = req.body;
                const role = await this.policyService.assignPolicyToRole(roleId, policyId);
                res.json(role);
            }
            catch (error) {
                console.error('Error assigning policy to role:', error);
                res.status(500).json({ error: 'Failed to assign policy' });
            }
        };
        this.assignRoleToUser = async (req, res) => {
            try {
                const { userId, roleId } = req.body;
                const user = await this.policyService.assignRoleToUser(userId, roleId);
                res.json(user);
            }
            catch (error) {
                console.error('Error assigning role to user:', error);
                res.status(500).json({ error: 'Failed to assign role' });
            }
        };
        // --- Exceptions ---
        this.requestException = async (req, res) => {
            try {
                const exception = await this.policyService.requestException(req.body);
                res.json(exception);
            }
            catch (error) {
                console.error('Error requesting exception:', error);
                res.status(500).json({ error: 'Failed to request exception' });
            }
        };
        this.approveException = async (req, res) => {
            try {
                const { exceptionId, approverId } = req.body;
                const exception = await this.policyService.approveException(exceptionId, approverId);
                res.json(exception);
            }
            catch (error) {
                console.error('Error approving exception:', error);
                res.status(500).json({ error: 'Failed to approve exception' });
            }
        };
    }
};
exports.PolicyController = PolicyController;
exports.PolicyController = PolicyController = __decorate([
    (0, tsyringe_1.autoInjectable)(),
    __param(0, (0, tsyringe_1.inject)(policy_service_1.PolicyService)),
    __metadata("design:paramtypes", [policy_service_1.PolicyService])
], PolicyController);
