import { Request, Response } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { ComplianceService } from './compliance.service';

@autoInjectable()
export class ComplianceController {
    constructor(
        @inject(ComplianceService) private complianceService: ComplianceService
    ) { }

    getReport = async (req: Request, res: Response) => {
        try {
            const framework = req.params.framework as string;
            const report = await this.complianceService.generateReport(framework);
            res.json(report);
        } catch (error) {
            console.error('Compliance report error', error);
            res.status(500).json({ message: 'Failed to generate report' });
        }
    }

    exportEvidence = async (req: Request, res: Response) => {
        try {
            const framework = req.params.framework as string;
            const evidence = await this.complianceService.generateEvidencePack(framework);

            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Disposition', `attachment; filename=${framework}_evidence.txt`);
            res.send(evidence);
        } catch (error) {
            console.error('Compliance export error', error);
            res.status(500).json({ message: 'Failed to export evidence' });
        }
    }
}
