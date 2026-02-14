"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyService = void 0;
const tsyringe_1 = require("tsyringe");
const db_1 = __importDefault(require("../../db"));
let PolicyService = class PolicyService {
    // --- Policies ---
    async createPolicy(data) {
        return db_1.default.policy.create({
            data: {
                ...data,
                enforcement_mode: data.enforcement_mode || 'SOFT'
            }
        });
    }
    async getPolicyById(policyId) {
        return db_1.default.policy.findUnique({
            where: { policy_id: policyId },
            include: { roles: true }
        });
    }
    async getAllPolicies() {
        return db_1.default.policy.findMany({
            orderBy: { created_at: 'desc' }
        });
    }
    async updatePolicy(policyId, data) {
        return db_1.default.policy.update({
            where: { policy_id: policyId },
            data
        });
    }
    async deletePolicy(policyId) {
        return db_1.default.policy.delete({
            where: { policy_id: policyId }
        });
    }
    // --- Roles ---
    async createRole(data) {
        return db_1.default.role.create({ data });
    }
    async getAllRoles() {
        return db_1.default.role.findMany({
            include: { policy: true, users: { select: { user_id: true, email: true } } }
        });
    }
    async assignPolicyToRole(roleId, policyId) {
        return db_1.default.role.update({
            where: { role_id: roleId },
            data: { policy_id: policyId }
        });
    }
    async assignRoleToUser(userId, roleId) {
        return db_1.default.user.update({
            where: { user_id: userId },
            data: { role_id: roleId }
        });
    }
    // --- Exceptions ---
    async requestException(data) {
        return db_1.default.disciplineException.create({
            data: {
                ...data,
                approved_by: null // Pending approval
            }
        });
    }
    async approveException(exceptionId, approverId) {
        return db_1.default.disciplineException.update({
            where: { exception_id: exceptionId },
            data: { approved_by: approverId }
        });
    }
    async getActiveExceptionsForUser(userId) {
        const now = new Date();
        return db_1.default.disciplineException.findMany({
            where: {
                user_id: userId,
                approved_by: { not: null },
                OR: [
                    { valid_until: null },
                    { valid_until: { gte: now } }
                ]
            }
        });
    }
    async assignDefaultRole(userId) {
        // Find default role, if not exists, pick first or create?
        // For MVP, look for role with name 'USER' or 'DEFAULT'
        const defaultRole = await db_1.default.role.findFirst({
            where: { name: 'USER' }
        });
        if (defaultRole) {
            await db_1.default.user.update({
                where: { user_id: userId },
                data: { role_id: defaultRole.role_id }
            });
        }
    }
    async setEnforcementMode(userId, mode) {
        await db_1.default.user.update({
            where: { user_id: userId },
            data: { enforcement_mode: mode }
        });
    }
};
exports.PolicyService = PolicyService;
exports.PolicyService = PolicyService = __decorate([
    (0, tsyringe_1.singleton)()
], PolicyService);
