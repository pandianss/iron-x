import { Response } from 'express';
import { container } from 'tsyringe';
import prisma from '../../infrastructure/db';
import { EvidencePackService } from './evidencePack.service';
import { generateEvidencePackPdf } from './evidencePack.pdf';
import { AuthRequest } from '../../middleware/authMiddleware';
import { SubscriptionService } from '../subscription/subscription.service';

export class EvidencePackController {
  private evidenceService: EvidencePackService;
  private subscriptionService: SubscriptionService;

  constructor() {
    this.evidenceService = container.resolve(EvidencePackService);
    this.subscriptionService = container.resolve(SubscriptionService);
  }

  async generateEvidencePack(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;
      const { period, start_date, end_date, format, scope } = req.body;

      // 1. Subscription Tier Gate (TEAM_ENTERPRISE only)
      const sub = await this.subscriptionService.getSubscription(userId);
      if (!sub || sub.plan_tier !== 'TEAM_ENTERPRISE') {
        return res.status(403).json({ 
          error: 'COMPLIANCE ENGINE: Evidence pack generation requires INSTITUTIONAL tier.',
          code: 'TIER_LOCKED'
        });
      }

      // 2. Rate Limit (Max 5 per 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentPacksCount = await prisma.auditLog.count({
        where: {
          actor_id: userId,
          action: 'EVIDENCE_PACK_GENERATED',
          timestamp: { gte: thirtyDaysAgo }
        }
      });

      if (recentPacksCount >= 5) {
        return res.status(429).json({ 
          error: 'RATE_LIMIT: Maximum 5 evidence packs per 30-day period.',
          code: 'RATE_LIMITED'
        });
      }

      // 3. Calculate Date Range
      let startDate = new Date();
      let endDate = new Date();

      if (period === 'LAST_30') startDate.setDate(endDate.getDate() - 30);
      else if (period === 'LAST_90') startDate.setDate(endDate.getDate() - 90);
      else if (period === 'LAST_180') startDate.setDate(endDate.getDate() - 180);
      else if (period === 'CUSTOM' && start_date && end_date) {
        startDate = new Date(start_date);
        endDate = new Date(end_date);
      } else {
        startDate.setDate(endDate.getDate() - 90); // Default
      }

      // 4. Generate Data Pack
      const pack = await this.evidenceService.generatePack({
        userId: scope === 'USER' ? userId : undefined,
        orgId: scope === 'ORG' ? req.user!.orgId || undefined : undefined,
        startDate,
        endDate,
        format
      });

      // 5. Handle Formats
      let pdfBase64: string | undefined;
      if (format === 'PDF' || format === 'BOTH') {
        const pdfBuffer = await generateEvidencePackPdf(pack);
        pdfBase64 = pdfBuffer.toString('base64');
      }

      // 6. Log the event — non-fatal if this fails
      try {
        await prisma.auditLog.create({
          data: {
            actor_id: userId,
            target_user_id: userId, // Self-audit
            action: 'EVIDENCE_PACK_GENERATED',
            details: JSON.stringify({ packId: pack.packId, period, scope, format }),
            timestamp: new Date()
          }
        });
      } catch (auditErr) {
        console.error('[EvidencePack] Audit log write failed (non-fatal):', auditErr);
      }

      return res.json({
        packId: pack.packId,
        signature: pack.signature,
        generated_at: pack.generated_at,
        period: pack.period,
        jsonData: (format === 'JSON' || format === 'BOTH') ? pack.sections : undefined,
        pdfBase64
      });

    } catch (error: any) {
      console.error('Evidence pack generation failed', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }
}
