import { singleton, inject } from 'tsyringe';
import { AuditService } from '../modules/audit/audit.service';
import * as crypto from 'crypto';

@singleton()
export class TrustControlService {
    constructor(
        @inject(AuditService) private auditService: AuditService
    ) { }

    async logConsumption(integrationId: string, endpoint: string, resourceId: string) {
        await this.auditService.logEvent(
            'DATA_EGRESS',
            { integration: integrationId, endpoint, resource: resourceId },
            'SYSTEM',
            resourceId
        );
    }

    signExport(data: unknown): string {
        return crypto.createHmac('sha256', process.env.EXPORT_SECRET || 'default_secret').update(JSON.stringify(data)).digest('hex');
    }
}
