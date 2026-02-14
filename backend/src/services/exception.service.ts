
import prisma from '../db';
import { AuditService } from './audit.service';

export const ExceptionService = {
    /**
     * Grants a discipline exception/waiver to a user.
     */
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

        await AuditService.logEvent(
            'EXCEPTION_GRANTED',
            { reason, validUntil, exceptionId: exception.exception_id },
            userId,
            approverId
        );

        return exception;
    },

    /**
     * Checks if a user has an active exception that prevents enforcement.
     */
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
};
