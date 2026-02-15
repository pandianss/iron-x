import { singleton, inject } from 'tsyringe';
import prisma from '../db';
import { AuditService } from '../modules/audit/audit.service';

@singleton()
export class ExceptionService {
    constructor(
        @inject(AuditService) private auditService: AuditService
    ) { }

    async grantException(userId: string, reason: string, validUntil: Date, approverId: string) {
        const exception = await prisma.disciplineException.create({
            data: {
                user_id: userId,
                reason,
                approved_by: approverId,
                valid_until: validUntil,
                valid_from: new Date()
            }
        });

        await this.auditService.logEvent(
            'EXCEPTION_GRANTED',
            { reason, validUntil, exceptionId: exception.exception_id },
            userId,
            approverId
        );

        return exception;
    }

    async hasActiveException(userId: string): Promise<boolean> {
        const now = new Date();
        const activeException = await prisma.disciplineException.findFirst({
            where: {
                user_id: userId,
                valid_from: { lte: now },
                valid_until: { gte: now }
            }
        });

        return !!activeException;
    }
}
