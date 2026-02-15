
import { Request, Response } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { DigestService } from '../communication/digest.service';

@autoInjectable()
export class AdminController {
    constructor(
        @inject(DigestService) private digestService: DigestService
    ) { }

    triggerWeeklyDigests = async (req: Request, res: Response) => {
        try {
            const results = await this.digestService.sendWeeklyDigests();
            res.json({ message: 'Digests triggered successfully', processed: results.length });
        } catch (error) {
            console.error('Failed to trigger digests:', error);
            res.status(500).json({ error: 'Failed to trigger digests' });
        }
    };
}
