// backend/src/modules/discipline/discipline.controller.ts

import { Request, Response } from 'express';
import { container } from 'tsyringe';
import { DisciplineStateService } from './disciplineState.service';
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

            const service = container.resolve(DisciplineStateService);
            const trajectory = await service.getUserTrajectory(userId);

            res.json({ trajectory });
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
     * GET /api/v1/discipline/history
     * Returns historical log of discipline events
     */
    static async getHistory(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const prisma = container.resolve('PrismaClient' as any) as any;
            const history = await prisma.auditLog.findMany({
                where: { target_user_id: userId },
                orderBy: { timestamp: 'desc' },
                take: 50
            });

            res.json(history);
        } catch (error: any) {
            console.error('[Discipline] Error fetching history:', error);
            res.status(500).json({ error: 'Failed to fetch history' });
        }
    }

    /**
     * GET /api/v1/discipline/preview
     * Returns preview of upcoming discipline impacts
     */
    static async getPreview(req: AuthRequest, res: Response) {
        res.json({ message: 'Preview implementation pending' });
    }

    /**
     * GET /api/v1/discipline/warnings
     * Returns active discipline warnings
     */
    static async getWarnings(req: AuthRequest, res: Response) {
        res.json([]);
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
