import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { disciplineService } from '../services/discipline.service';

export const getState = async (req: AuthRequest, res: Response) => {
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

export const getPressure = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);
    const data = await disciplineService.getPressure(userId);
    res.json(data);
};

export const getPredictions = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);
    const data = await disciplineService.getPredictions(userId);
    res.json(data);
};

export const getConstraints = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);
    const data = await disciplineService.getConstraints(userId);
    res.json(data);
};

export const getHistory = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);
    const data = await disciplineService.getHistory(userId);
    res.json(data);
};
