
import { autoInjectable } from 'tsyringe';
import prisma from '../../db';

@autoInjectable()
export class OutcomeService {
    /**
     * Calculates probability of system collapse (score < 20) based on 30-day trend.
     */
    async predictFailureTrajectory(userId: string) {
        const history = await prisma.disciplineScore.findMany({
            where: { user_id: userId },
            orderBy: { date: 'asc' },
            take: 30
        });

        if (history.length < 5) return { probability: 0, trend: 'STABLE', projectedCollapseDate: null };

        // Simple linear regression proxy
        const scores = history.map(h => h.score);
        const n = scores.length;
        const x = Array.from({ length: n }, (_, i) => i);
        const y = scores;

        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((a, b, i) => a + b * y[i], 0);
        const sumXX = x.reduce((a, b) => a + b * b, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        const currentScore = scores[n - 1];
        let projectedCollapseDate: Date | null = null;

        if (slope < 0) {
            // How many days until score < 20? 20 = slope * (n + days) + intercept
            const daysToCollapse = (20 - intercept) / slope - n;
            if (daysToCollapse > 0 && daysToCollapse < 365) {
                projectedCollapseDate = new Date();
                projectedCollapseDate.setDate(projectedCollapseDate.getDate() + Math.ceil(daysToCollapse));
            }
        }

        return {
            probability: slope < 0 ? Math.min(Math.abs(slope) * 10, 100) : 0,
            trend: slope < -1 ? 'COLLAPSING' : slope < 0 ? 'DECLINING' : 'IMPROVING',
            slope: parseFloat(slope.toFixed(2)),
            projectedCollapseDate
        };
    }

    async calculateSuccessProbability(userId: string) {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);

        const adherence = await prisma.actionInstance.count({
            where: {
                user_id: userId,
                status: 'COMPLETED',
                executed_at: { gte: last7Days }
            }
        });

        const totalScheduled = await prisma.actionInstance.count({
            where: {
                user_id: userId,
                scheduled_start_time: { gte: last7Days }
            }
        });

        const rate = totalScheduled > 0 ? (adherence / totalScheduled) : 0;

        return {
            rate: parseFloat((rate * 100).toFixed(2)),
            probability: Math.pow(rate, 2) * 100, // Non-linear confidence
            message: rate > 0.9 ? 'High Determinism' : rate > 0.7 ? 'Moderate Stability' : 'Critical Instability'
        };
    }
}
