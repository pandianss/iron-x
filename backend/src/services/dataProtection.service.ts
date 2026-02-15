import { singleton, inject } from 'tsyringe';
import prisma from '../db';
import { Logger } from '../utils/logger';
import { AuditService } from '../modules/audit/audit.service';

export enum DataClassification {
    PUBLIC = 'PUBLIC',
    INTERNAL = 'INTERNAL',
    SENSITIVE = 'SENSITIVE',
    PERSONAL = 'PERSONAL'
}

export const DataMap = {
    'User': DataClassification.PERSONAL,
    'DisciplineScore': DataClassification.SENSITIVE,
    'AuditLog': DataClassification.SENSITIVE,
    'Policy': DataClassification.INTERNAL
};

@singleton()
export class DataProtectionService {
    constructor(
        @inject(AuditService) private auditService: AuditService
    ) { }

    canAccess(roleName: string, dataType: keyof typeof DataMap): boolean {
        const classification = DataMap[dataType];
        if (roleName === 'Admin') return true;
        if (roleName === 'Auditor') return true;
        if (roleName === 'Employee') return true;
        return false;
    }

    async anonymizeUser(userId: string, reason: string) {
        await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { user_id: userId },
                data: {
                    email: `anonymized-${userId}@deleted.local`,
                    password_hash: 'DELETED',
                }
            });

            await this.auditService.logEvent(
                'DATA_ANONYMIZATION',
                { reason },
                userId,
                'SYSTEM' // Assuming actorId is optional or handled
            );
        });
        Logger.info(`User ${userId} anonymized.`);
    }

    async enforceRetentionPolicy() {
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 7);

        const deleted = await prisma.auditLog.deleteMany({
            where: {
                timestamp: { lt: cutoffDate }
            }
        });

        Logger.info(`Retention Policy Enforced: ${deleted.count} old logs deleted.`);
    }
}
