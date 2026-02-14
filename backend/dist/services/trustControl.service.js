"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustControlService = void 0;
const audit_service_1 = require("./audit.service");
exports.TrustControlService = {
    /**
     * Logs every external API access to prove who consumed what data and when.
     * Essential for "Non-Repudiation" of discipline signals.
     */
    async logConsumption(integrationId, endpoint, resourceId) {
        await audit_service_1.AuditService.logEvent('DATA_EGRESS', { integration: integrationId, endpoint, resource: resourceId }, 'SYSTEM', // Actor is the system acting on behalf of integration
        resourceId // Target is the user resource being accessed
        );
    },
    /**
     * Generates a tamper-evident hash of an export package.
     * (Reuses logic from EvidenceService but explicit for exports)
     */
    signExport(data) {
        const crypto = require('crypto');
        return crypto.createHmac('sha256', process.env.EXPORT_SECRET || 'default_secret').update(JSON.stringify(data)).digest('hex');
    }
};
