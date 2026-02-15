import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { ComplianceService } from '../modules/_experimental/compliance/compliance.service';
import { AuditService } from '../modules/audit/audit.service';

export const getFrameworkStatus = async (req: Request, res: Response) => {
    try {
        const complianceService = container.resolve(ComplianceService);
        const auditService = container.resolve(AuditService);
        const { framework } = req.params;
        const status = await complianceService.getGapAnalysis(framework as string);
        res.json(status);

        if ((req as any).user?.role?.name === 'Auditor') {
            await auditService.logEvent(
                'AUDITOR_ACCESS',
                { resource: 'FRAMEWORK_STATUS', framework },
                (req as any).user?.userId,
                (req as any).user?.userId
            );
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch compliance status' });
    }
};

export const getAllControls = async (req: Request, res: Response) => {
    try {
        const complianceService = container.resolve(ComplianceService);
        const { framework } = req.params;
        const controls = await complianceService.getControlsByFramework(framework as string);
        res.json(controls);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch controls' });
    }
};
