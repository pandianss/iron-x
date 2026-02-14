import { singleton } from 'tsyringe';
import prisma from '../../db';
import { Logger } from '../../utils/logger';

@singleton()
export class IndisciplineCalculator {
    async estimateCostOfIndiscipline(userId: string, hourlyRate: number = 50) {
        Logger.info(`Estimating cost for user ${userId} at rate ${hourlyRate}`);

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // 1. Missed Actions
        const missedActions = await prisma.actionInstance.count({
            where: {
                user_id: userId,
                status: 'MISSED',
                scheduled_date: { gte: thirtyDaysAgo }
            }
        });

        // 2. Execution Lag (Late actions)
        const completedActions = await prisma.actionInstance.findMany({
            where: {
                user_id: userId,
                status: 'COMPLETED',
                executed_at: { not: null },
                scheduled_date: { gte: thirtyDaysAgo }
            },
            select: {
                scheduled_start_time: true,
                executed_at: true
            }
        });

        let totalLagMinutes = 0;
        for (const action of completedActions) {
            if (action.executed_at && action.executed_at > action.scheduled_start_time) {
                const diff = (action.executed_at.getTime() - action.scheduled_start_time.getTime()) / (1000 * 60);
                totalLagMinutes += diff;
            }
        }

        const missedActionCostTime = missedActions * 15;
        const totalTimeLostMinutes = totalLagMinutes + missedActionCostTime;
        const estimatedCost = (totalTimeLostMinutes / 60) * hourlyRate;

        return {
            hourlyRate,
            missedActions,
            missedActionCostTime,
            totalLagMinutes,
            totalTimeLostMinutes,
            estimatedCost: parseFloat(estimatedCost.toFixed(2)),
            currency: 'USD',
            disclaimer: 'This is an estimate based on missed actions and execution lag. Not binding.'
        };
    }
}
