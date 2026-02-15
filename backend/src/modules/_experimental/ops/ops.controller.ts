
import { Request, Response } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { OpsService } from './ops.service';

@autoInjectable()
export class OpsController {
    constructor(
        @inject(OpsService) private opsService: OpsService
    ) { }

    healthCheck = async (req: Request, res: Response) => {
        const health = await this.opsService.getSystemHealth();
        const statusCode = health.status === 'HEALTHY' ? 200 : 503;
        res.status(statusCode).json(health);
    };

    triggerMaintenance = async (req: Request, res: Response) => {
        const result = await this.opsService.runDatabaseMaintenance();
        res.json(result);
    };
}
