
import prisma from '../db';
import { Logger } from '../utils/logger';
import { AuditService } from './audit.service';

export enum DataClassification {
    PUBLIC = 'PUBLIC',
    INTERNAL = 'INTERNAL',
    SENSITIVE = 'SENSITIVE', // Discipline scores, patterns
    PERSONAL = 'PERSONAL'    // Email, specific log entries
}

export const DataMap = {
    'User': DataClassification.PERSONAL,
    'DisciplineScore': DataClassification.SENSITIVE,
    'AuditLog': DataClassification.SENSITIVE, // Contains behavior
    'Policy': DataClassification.INTERNAL
};

export const DataProtectionService = {
    /**
     * Checks if a role can access a specific data type.
     */
    canAccess(roleName: string, dataType: keyof typeof DataMap): boolean {
        const classification = DataMap[dataType];

        if (roleName === 'Admin') return true;
        if (roleName === 'Auditor') {
            // Auditors can see Internal and Sensitive (for verification) but maybe not Personal identifiers?
            // Phase 7 requirement: "Auditor Access Mode" - "Read-only access", "Scope-limited views".
            // We'll allow access but maybe mask fields in the controller.
            return true;
        }
        if (roleName === 'Employee') {
            // Employees see their own data, usually handled by "where user_id = me"
            // This service checks *general* access to the *type*.
            return true;
        }

        return false;
    },

    /**
     * Anonymizes a user's data instead of deleting it, to preserve discipline integrity.
     * "Right to Erasure" implementation.
     */
    async anonymizeUser(userId: string, reason: string) {
        // 1. Check retention policy (if any)

        // 2. Transaction to anonymize
        await prisma.$transaction(async (tx) => {
            // Delete PII
            await tx.user.update({
                where: { user_id: userId },
                data: {
                    email: `anonymized-${userId}@deleted.local`,
                    password_hash: 'DELETED',
                    // We keep usage data but sever the link to the real identity
                }
            });

            // Log the action
            // We use the 'system' actor or the admin who triggered it
            /* 
            await AuditService.logEvent(
                'DATA_ANONYMIZATION',
                { reason },
                'SYSTEM',
                userId
            );
            */
            // Can't easily use AuditService inside transaction if it uses different context, 
            // but assuming standard usage it's fine.
        });

        // 3. Log outside transaction to ensure it persists even if user row is locked/etc? 
        // No, transaction is better.

        console.log(`User ${userId} anonymized.`);
    },

    /**
     * Retention Job Logic
     */
    async enforceRetentionPolicy() {
        // Example: Delete audit logs older than 7 years (GDPR/Compliance standard)
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 7);

        const deleted = await prisma.auditLog.deleteMany({
            where: {
                timestamp: { lt: cutoffDate }
            }
        });

        Logger.info(`Retention Policy Enforced: ${deleted.count} old logs deleted.`);
    }
};
