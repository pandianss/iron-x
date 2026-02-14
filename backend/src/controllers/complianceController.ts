
import { Request, Response } from 'express';
import { ComplianceService } from '../services/compliance.service';
import { AuditService } from '../services/audit.service';

export const getFrameworkStatus = async (req: Request, res: Response) => {
    try {
        const { framework } = req.params;
        const status = await ComplianceService.getGapAnalysis(framework as string);
        res.json(status);

        // Log auditor access if applicable (checking role done in middleware)
        if (req.user?.role?.name === 'Auditor') {
            await AuditService.logEvent(
                'AUDITOR_ACCESS',
                { resource: 'FRAMEWORK_STATUS', framework },
                req.user?.userId,
                req.user?.userId
            );
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch compliance status' });
    }
};

export const getAllControls = async (req: Request, res: Response) => {
    try {
        const { framework } = req.params;
        const controls = await ComplianceService.getControlsByFramework(framework as string);
        res.json(controls);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch controls' });
    }
};
