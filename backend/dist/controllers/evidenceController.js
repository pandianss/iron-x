"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateEvidence = void 0;
const evidence_service_1 = require("../services/evidence.service");
const audit_service_1 = require("../services/audit.service");
const generateEvidence = async (req, res) => {
    try {
        const { targetUserId } = req.body;
        // Verify permission: requester must be 'Auditor' or 'Admin'
        // (Middleware should handle auth, but explicit check here for safety)
        const requesterRole = req.user?.role?.name;
        if (requesterRole !== 'Auditor' && requesterRole !== 'Admin') {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        const pack = await evidence_service_1.EvidenceService.generateEvidencePack('USER', targetUserId);
        // Log the access
        await audit_service_1.AuditService.logEvent('EVIDENCE_GENERATED', { packId: pack.packId, integrity: pack.integrity }, req.user.user_id, targetUserId);
        res.json(pack);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate evidence' });
    }
};
exports.generateEvidence = generateEvidence;
