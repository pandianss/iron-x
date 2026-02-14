import { PrismaClient, Policy, Role, DisciplineException } from '@prisma/client';

const prisma = new PrismaClient();

export const PolicyService = {
    // --- Policies ---
    async createPolicy(data: {
        name: string;
        description?: string;
        scope: string; // 'ORG', 'DEPARTMENT', 'TEAM', 'ROLE', 'USER'
        rules: string; // JSON string
        enforcement_mode?: string; // 'SOFT', 'HARD'
    }): Promise<Policy> {
        return prisma.policy.create({
            data: {
                ...data,
                enforcement_mode: data.enforcement_mode || 'SOFT'
            }
        });
    },

    async getPolicyById(policyId: string): Promise<Policy | null> {
        return prisma.policy.findUnique({
            where: { policy_id: policyId },
            include: { roles: true }
        });
    },

    async getAllPolicies(): Promise<Policy[]> {
        return prisma.policy.findMany({
            orderBy: { created_at: 'desc' }
        });
    },

    async updatePolicy(policyId: string, data: Partial<Policy>): Promise<Policy> {
        return prisma.policy.update({
            where: { policy_id: policyId },
            data
        });
    },

    async deletePolicy(policyId: string): Promise<Policy> {
        return prisma.policy.delete({
            where: { policy_id: policyId }
        });
    },

    // --- Roles ---
    async createRole(data: { name: string; description?: string; policy_id?: string }): Promise<Role> {
        return prisma.role.create({ data });
    },

    async getAllRoles(): Promise<Role[]> {
        return prisma.role.findMany({
            include: { policy: true, users: { select: { user_id: true, email: true } } }
        });
    },

    async assignPolicyToRole(roleId: string, policyId: string | null): Promise<Role> {
        return prisma.role.update({
            where: { role_id: roleId },
            data: { policy_id: policyId }
        });
    },

    async assignRoleToUser(userId: string, roleId: string | null): Promise<any> { // Returns User
        return prisma.user.update({
            where: { user_id: userId },
            data: { role_id: roleId }
        });
    },

    // --- Exceptions ---
    async requestException(data: {
        user_id: string;
        policy_id?: string;
        reason: string;
        valid_until?: Date;
    }): Promise<DisciplineException> {
        return prisma.disciplineException.create({
            data: {
                ...data,
                approved_by: null // Pending approval
            }
        });
    },

    async approveException(exceptionId: string, approverId: string): Promise<DisciplineException> {
        return prisma.disciplineException.update({
            where: { exception_id: exceptionId },
            data: { approved_by: approverId }
        });
    },

    async getActiveExceptionsForUser(userId: string): Promise<DisciplineException[]> {
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

    async assignDefaultRole(userId: string): Promise<void> {
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

    async setEnforcementMode(userId: string, mode: string): Promise<void> {
        await prisma.user.update({
            where: { user_id: userId },
            data: { enforcement_mode: mode }
        });
    }
};
