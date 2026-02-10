
import { Request, Response } from 'express';
import { EvidenceService } from '../services/evidence.service';
import { AuditService } from '../services/audit.service';

export const generateEvidence = async (req: Request, res: Response) => {
    try {
        const { targetUserId } = req.body;
        // Verify permission: requester must be 'Auditor' or 'Admin'
        // (Middleware should handle auth, but explicit check here for safety)
        const requesterRole = (req as any).user?.role?.name;
        if (requesterRole !== 'Auditor' && requesterRole !== 'Admin') {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        const pack = await EvidenceService.generateEvidencePack('USER', targetUserId);

        // Log the access
        await AuditService.logEvent(
            'EVIDENCE_GENERATED',
            { packId: pack.packId, integrity: pack.integrity },
            (req as any).user.user_id,
            targetUserId
        );

        res.json(pack);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate evidence' });
    }
};
