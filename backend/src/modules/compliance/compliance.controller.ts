
import { Request, Response } from 'express';
import { ComplianceService } from './compliance.service';

export class ComplianceController {
    static async getReport(req: Request, res: Response) {
        try {
            const framework = req.params.framework as string;
            const report = await ComplianceService.generateReport(framework);
            res.json(report);
        } catch (error) {
            console.error('Compliance report error', error);
            res.status(500).json({ message: 'Failed to generate report' });
        }
    }

    static async exportEvidence(req: Request, res: Response) {
        try {
            const framework = req.params.framework as string;
            const evidence = await ComplianceService.generateEvidencePack(framework);

            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename=${framework}_evidence.txt`);
            res.send(evidence);
        } catch (error) {
            console.error('Compliance export error', error);
            res.status(500).json({ message: 'Failed to export evidence' });
        }
    }
}
