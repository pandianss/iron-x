
import prisma from '../db';
import { AuditService } from './audit.service';

export const TrustControlService = {
    /**
     * Logs every external API access to prove who consumed what data and when.
     * Essential for "Non-Repudiation" of discipline signals.
     */
    async logConsumption(integrationId: string, endpoint: string, resourceId: string) {
        await AuditService.logEvent(
            'DATA_EGRESS',
            { integration: integrationId, endpoint, resource: resourceId },
            'SYSTEM', // Actor is the system acting on behalf of integration
            resourceId // Target is the user resource being accessed
        );
    },

    /**
     * Generates a tamper-evident hash of an export package.
     * (Reuses logic from EvidenceService but explicit for exports)
     */
    signExport(data: any): string {
        const crypto = require('crypto'); // eslint-disable-line @typescript-eslint/no-require-imports
        return crypto.createHmac('sha256', process.env.EXPORT_SECRET || 'default_secret').update(JSON.stringify(data)).digest('hex');
    }
};
