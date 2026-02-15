import { Response } from 'express';
import { autoInjectable } from 'tsyringe';
import { AuthRequest } from '../../middleware/authMiddleware';
import { AnalyticsService } from './analytics.service';
import { OutcomeService } from './outcome.service';
import { SimulationService } from './simulation.service';
import prisma from '../../db';

@autoInjectable()
export class AnalyticsController {
    constructor(
        private analyticsService: AnalyticsService,
        private outcomeService: OutcomeService,
        private simulationService: SimulationService
    ) { }

    getDisciplineData = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);

        try {
            const user = await prisma.user.findUnique({
                where: { user_id: userId },
                select: { current_discipline_score: true }
            });

            const history = await this.analyticsService.getDisciplineHistory(userId, 30); // 30 days history for drift

            // Get today's stats for "Counts" (Move to service later if needed)
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const todayIds = await prisma.actionInstance.groupBy({
                by: ['status'],
                where: {
                    user_id: userId,
                    scheduled_date: today
                },
                _count: {
                    status: true
                }
            });

            // Aggregate counts
            let execCount = 0;
            let missedCount = 0;
            todayIds.forEach((g: any) => {
                if (g.status === 'COMPLETED' || g.status === 'LATE') execCount += g._count.status;
                if (g.status === 'MISSED') missedCount += g._count.status;
            });

            res.json({
                currentScore: user?.current_discipline_score || 0,
                history,
                todayStats: {
                    executed: execCount,
                    missed: missedCount
                }
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };

    getTeamVelocity = async (req: AuthRequest, res: Response) => {
        const { teamId } = req.params;
        // Check permissions (Manager/Owner) - assume handled by route middleware or add check here
        // For MVP, just check if user is in team or is admin.
        // Let's trust the service or add a quick check.

        try {
            const velocity = await this.analyticsService.getTeamVelocity(teamId);
            res.json(velocity);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    }

    getProjections = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);

        try {
            const trajectory = await this.outcomeService.predictFailureTrajectory(userId);
            const success = await this.outcomeService.calculateSuccessProbability(userId);
            res.json({ trajectory, success });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Failed to calculate projections' });
        }
    };

    runSimulation = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        const { type, value } = req.body;
        if (!userId) return res.sendStatus(401);

        try {
            const result = await this.simulationService.runCounterfactual(userId, { type, value });
            res.json(result);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Simulation failed' });
        }
    }
}
