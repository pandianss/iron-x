// backend/src/modules/discipline/discipline.controller.ts

import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { DisciplineStateService } from '../../services/disciplineState.service';
import { AuthRequest } from '../../middleware/authMiddleware';

export class DisciplineController {
    /**
     * GET /api/v1/discipline/state
     * Returns complete discipline state for the cockpit
     */
    static async getState(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const service = container.resolve(DisciplineStateService);
            const state = await service.getUserDisciplineState(userId);

            res.json(state);
        } catch (error: any) {
            console.error('[Discipline] Error fetching state:', error);
            res.status(500).json({ 
                error: 'Failed to fetch discipline state',
                message: error.message 
            });
        }
    }

    /**
     * GET /api/v1/discipline/pressure
     * Returns drift vectors and pressure analysis
     */
    static async getPressure(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const service = container.resolve(DisciplineStateService);
            const state = await service.getUserDisciplineState(userId);

            res.json({
                compositePressure: state.compositePressure,
                driftVectors: state.driftVectors
            });
        } catch (error: any) {
            console.error('[Discipline] Error fetching pressure:', error);
            res.status(500).json({ 
                error: 'Failed to fetch pressure data',
                message: error.message 
            });
        }
    }

    /**
     * GET /api/v1/discipline/trajectory
     * Returns historical discipline score trajectory
     */
    static async getTrajectory(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const prisma = container.resolve('PrismaClient' as any);
            
            // Get action instances from last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const instances = await prisma.actionInstance.findMany({
                where: {
                    action: { user_id: userId },
                    scheduled_start_time: { gte: thirtyDaysAgo }
                },
                orderBy: { scheduled_start_time: 'asc' },
                select: {
                    scheduled_start_time: true,
                    status: true,
                    completion_time_offset_minutes: true
                }
            });

            // Calculate daily scores
            const dailyScores: Array<{ date: string; score: number }> = [];
            const dayMap = new Map<string, { completed: number; missed: number; late: number }>();

            instances.forEach(inst => {
                const dateKey = inst.scheduled_start_time.toISOString().split('T')[0];
                if (!dayMap.has(dateKey)) {
                    dayMap.set(dateKey, { completed: 0, missed: 0, late: 0 });
                }
                
                const day = dayMap.get(dateKey)!;
                if (inst.status === 'COMPLETED') {
                    if (inst.completion_time_offset_minutes && inst.completion_time_offset_minutes > 0) {
                        day.late++;
                    } else {
                        day.completed++;
                    }
                } else if (inst.status === 'MISSED') {
                    day.missed++;
                }
            });

            // Convert to array and calculate scores
            let runningScore = 75; // Starting baseline
            Array.from(dayMap.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .forEach(([date, stats]) => {
                    const total = stats.completed + stats.late + stats.missed;
                    if (total > 0) {
                        const dailyPerformance = 
                            (stats.completed / total) * 100 + 
                            (stats.late / total) * 70 - 
                            (stats.missed / total) * 30;
                        
                        // Smooth the score changes
                        runningScore = runningScore * 0.7 + dailyPerformance * 0.3;
                    }
                    
                    dailyScores.push({
                        date,
                        score: Math.round(runningScore * 10) / 10
                    });
                });

            res.json({ trajectory: dailyScores });
        } catch (error: any) {
            console.error('[Discipline] Error fetching trajectory:', error);
            res.status(500).json({ 
                error: 'Failed to fetch trajectory',
                message: error.message 
            });
        }
    }

    /**
     * GET /api/v1/discipline/identity
     * Returns discipline identity card data
     */
    static async getIdentity(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const service = container.resolve(DisciplineStateService);
            const state = await service.getUserDisciplineState(userId);

            res.json({
                score: state.score,
                classification: state.classification,
                weeklyCompletionRate: state.performanceMetrics.weeklyCompletionRate,
                averageLatency: state.performanceMetrics.averageLatency,
                activePolicies: state.activeConstraints.policiesActive,
                lockedUntil: state.activeConstraints.lockedUntil
            });
        } catch (error: any) {
            console.error('[Discipline] Error fetching identity:', error);
            res.status(500).json({ 
                error: 'Failed to fetch identity',
                message: error.message 
            });
        }
    }

    /**
     * POST /api/v1/discipline/refresh
     * Manually recalculates discipline score
     */
    static async refreshScore(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const service = container.resolve(DisciplineStateService);
            const newScore = await service.updateDisciplineScore(userId);

            res.json({ 
                success: true, 
                newScore,
                message: 'Discipline score recalculated successfully'
            });
        } catch (error: any) {
            console.error('[Discipline] Error refreshing score:', error);
            res.status(500).json({ 
                error: 'Failed to refresh score',
                message: error.message 
            });
        }
    }
}
