import { Request, Response } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { AuditService } from './audit.service';

@autoInjectable()
export class AuditController {
    constructor(
        @inject(AuditService) private auditService: AuditService
    ) { }

    getLogs = async (req: Request, res: Response) => {
        try {
            const { userId, action, startDate, endDate, limit, offset } = req.query;

            const logs = await this.auditService.getLogs({
                userId: userId as string,
                action: action as string,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined,
                limit: limit ? parseInt(limit as string) : undefined,
                offset: offset ? parseInt(offset as string) : undefined
            });

            res.json(logs);
        } catch (error) {
            console.error('Audit Fetch Error:', error);
            res.status(500).json({ message: 'Failed to fetch logs' });
        }
    }

    exportLogs = async (req: Request, res: Response) => {
        try {
            const { userId, action, startDate, endDate } = req.query;

            const csv = await this.auditService.exportLogs({
                userId: userId as string,
                action: action as string,
                startDate: startDate ? new Date(startDate as string) : undefined,
                endDate: endDate ? new Date(endDate as string) : undefined
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=audit_logs.csv');
            res.send(csv);
        } catch (error) {
            console.error('Audit Export Error:', error);
            res.status(500).json({ message: 'Failed to export logs' });
        }
    }
}
