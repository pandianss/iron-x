import { Request, Response } from 'express';
import { autoInjectable } from 'tsyringe';
import { AuthRequest } from '../../middleware/authMiddleware';
import { disciplineService } from '../../services/discipline.service'; // Static for now
import { kernelQueue } from '../../infrastructure/queue';
import { v4 as uuidv4 } from 'uuid';

@autoInjectable()
export class DisciplineController {
    getState = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);

        try {
            const data = await disciplineService.getState(userId);
            res.json(data);
        } catch (error) {
            if (error instanceof Error && error.message === 'User not found') {
                res.status(404).json({ error: 'User not found' });
            } else {
                res.status(500).json({ error: 'Failed' });
            }
        }
    };

    getPressure = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);
        const data = await disciplineService.getPressure(userId);
        res.json(data);
    };

    getPredictions = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);
        const data = await disciplineService.getPredictions(userId);
        res.json(data);
    };

    getConstraints = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);
        const data = await disciplineService.getConstraints(userId);
        res.json(data);
    };

    getHistory = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);
        const data = await disciplineService.getHistory(userId);
        res.json(data);
    };

    triggerCycle = async (req: Request, res: Response) => {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ error: 'userId required' });

        await kernelQueue.add('KERNEL_CYCLE_JOB', {
            userId,
            traceId: uuidv4(),
            timestamp: new Date()
        });

        res.json({ message: 'Cycle enqueued', userId });
    };
}
