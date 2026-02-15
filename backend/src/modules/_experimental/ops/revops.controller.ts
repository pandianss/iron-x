
import { Request, Response } from 'express';
import prisma from '../../db';
import { SubscriptionTier } from '@prisma/client';

export class RevOpsController {
    static async getCommercialMetrics(req: Request, res: Response) {
        try {
            const now = new Date();
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // 1. Plan Distribution
            const distribution = await prisma.subscription.groupBy({
                by: ['plan_tier'],
                _count: { _all: true },
                where: { is_active: true }
            });

            // 2. MRR Calculation (Simulated rates)
            const rates = {
                [SubscriptionTier.FREE]: 0,
                [SubscriptionTier.INDIVIDUAL_PRO]: 20,
                [SubscriptionTier.TEAM_ENTERPRISE]: 200
            };

            let mrr = 0;
            distribution.forEach(d => {
                mrr += (rates[d.plan_tier] || 0) * d._count._all;
            });

            // 3. Churn Rate (Canceled in last 30 days)
            const churnedCount = await prisma.subscription.count({
                where: {
                    is_active: false,
                    end_date: { gte: thirtyDaysAgo }
                }
            });

            const totalActive = await prisma.subscription.count({
                where: { is_active: true }
            });

            const churnRate = totalActive > 0 ? (churnedCount / (totalActive + churnedCount)) * 100 : 0;

            res.json({
                mrr,
                churnRate: parseFloat(churnRate.toFixed(2)),
                distribution: distribution.reduce((acc, curr) => ({
                    ...acc,
                    [curr.plan_tier]: curr._count._all
                }), {}),
                activeTotal: totalActive,
                churnedLast30Days: churnedCount
            });
        } catch (error) {
            console.error('RevOps metrics error', error);
            res.status(500).json({ message: 'Error fetching commercial metrics' });
        }
    }
}
