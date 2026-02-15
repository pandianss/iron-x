
import prisma from '../../db';
import { Prisma } from '@prisma/client';

export interface AuditFilter {
    userId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}

export class AuditService {
    private static buildWhere(filter: AuditFilter): Prisma.AuditLogWhereInput {
        const where: Prisma.AuditLogWhereInput = {};

        if (filter.userId) {
            where.OR = [
                { actor_id: filter.userId },
                { target_user_id: filter.userId }
            ];
        }
        if (filter.action) {
            where.action = { contains: filter.action, mode: 'insensitive' };
        }
        if (filter.startDate || filter.endDate) {
            where.timestamp = {
                gte: filter.startDate,
                lte: filter.endDate
            };
        }
        return where;
    }

    static async getLogs(filter: AuditFilter) {
        const where = this.buildWhere(filter);
        const limit = filter.limit || 50;
        const offset = filter.offset || 0;

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                take: limit,
                skip: offset,
                include: {
                    actor: { select: { email: true } },
                    target: { select: { email: true } }
                }
            }),
            prisma.auditLog.count({ where })
        ]);

        return {
            logs,
            pagination: {
                total,
                limit,
                offset
            }
        };
    }

    static async exportLogs(filter: AuditFilter): Promise<string> {
        const where = this.buildWhere(filter);

        const logs = await prisma.auditLog.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: 5000 // Increased limit for enterprise export
        });

        // Convert to CSV
        const header = 'LogID,Timestamp,ActorID,TargetID,Action,Details\n';
        const rows = logs.map(log => {
            const details = log.details ? log.details.replace(/"/g, '""') : ''; // Escape quotes
            return `${log.log_id},${log.timestamp.toISOString()},${log.actor_id || ''},${log.target_user_id || ''},${log.action},"${details}"`;
        }).join('\n');

        return header + rows;
    }

    static async cleanupLogs(retentionDays: number): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

        const result = await prisma.auditLog.deleteMany({
            where: {
                timestamp: {
                    lt: cutoffDate
                }
            }
        });

        return result.count;
    }
}
