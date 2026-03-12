import { Request, Response, NextFunction } from 'express';
import { autoInjectable } from 'tsyringe';
import { PublicBadgeService } from '../services/publicBadge.service';
import { OrgDashboardService } from '../services/orgDashboard.service';
import { container } from 'tsyringe';

@autoInjectable()
export class GrowthController {
    async getPublicBadge(req: Request, res: Response) {
        const userId = req.params.userId as string;
        const badgeService = container.resolve(PublicBadgeService);
        const data = await badgeService.getUserBadgeData(userId);

        if (!data) return res.status(404).send('Badge not found or private');

        const svg = badgeService.generateSvgBadge(data);
        res.setHeader('Content-Type', 'image/svg+xml');
        res.send(svg);
    }

    async getOrgAnalytics(req: Request, res: Response) {
        const orgId = req.params.orgId as string;
        const orgService = container.resolve(OrgDashboardService);
        const analytics = await orgService.getOrgAnalytics(orgId);
        const topViolations = await orgService.getTopViolations(orgId);

        res.json({ ...analytics, topViolations });
    }
}
