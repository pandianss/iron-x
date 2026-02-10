import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../db';

export const createGoal = async (req: AuthRequest, res: Response) => {
    const { title, description, deadline } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.sendStatus(401);

    try {
        const goal = await prisma.goal.create({
            data: {
                user_id: userId,
                title,
                description,
                deadline: deadline ? new Date(deadline) : null,
            },
        });
        res.status(201).json(goal);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getGoals = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) return res.sendStatus(401);

    try {
        const goals = await prisma.goal.findMany({
            where: { user_id: userId, status: 'ACTIVE' },
            orderBy: { created_at: 'desc' },
        });
        res.json(goals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
