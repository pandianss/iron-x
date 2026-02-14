"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolicyService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.PolicyService = {
    // --- Policies ---
    async createPolicy(data) {
        return prisma.policy.create({
            data: {
                ...data,
                enforcement_mode: data.enforcement_mode || 'SOFT'
            }
        });
    },
    async getPolicyById(policyId) {
        return prisma.policy.findUnique({
            where: { policy_id: policyId },
            include: { roles: true }
        });
    },
    async getAllPolicies() {
        return prisma.policy.findMany({
            orderBy: { created_at: 'desc' }
        });
    },
    async updatePolicy(policyId, data) {
        return prisma.policy.update({
            where: { policy_id: policyId },
            data
        });
    },
    async deletePolicy(policyId) {
        return prisma.policy.delete({
            where: { policy_id: policyId }
        });
    },
    // --- Roles ---
    async createRole(data) {
        return prisma.role.create({ data });
    },
    async getAllRoles() {
        return prisma.role.findMany({
            include: { policy: true, users: { select: { user_id: true, email: true } } }
        });
    },
    async assignPolicyToRole(roleId, policyId) {
        return prisma.role.update({
            where: { role_id: roleId },
            data: { policy_id: policyId }
        });
    },
    async assignRoleToUser(userId, roleId) {
        return prisma.user.update({
            where: { user_id: userId },
            data: { role_id: roleId }
        });
    },
    // --- Exceptions ---
    async requestException(data) {
        return prisma.disciplineException.create({
            data: {
                ...data,
                approved_by: null // Pending approval
            }
        });
    },
    async approveException(exceptionId, approverId) {
        return prisma.disciplineException.update({
            where: { exception_id: exceptionId },
            data: { approved_by: approverId }
        });
    },
    async getActiveExceptionsForUser(userId) {
        const now = new Date();
        return prisma.disciplineException.findMany({
            where: {
                user_id: userId,
                approved_by: { not: null },
                OR: [
                    { valid_until: null },
                    { valid_until: { gte: now } }
                ]
            }
        });
    },
    async assignDefaultRole(userId) {
        // Find default role, if not exists, pick first or create?
        // For MVP, look for role with name 'USER' or 'DEFAULT'
        const defaultRole = await prisma.role.findFirst({
            where: { name: 'USER' }
        });
        if (defaultRole) {
            await prisma.user.update({
                where: { user_id: userId },
                data: { role_id: defaultRole.role_id }
            });
        }
    },
    async setEnforcementMode(userId, mode) {
        await prisma.user.update({
            where: { user_id: userId },
            data: { enforcement_mode: mode }
        });
    }
};
