import { Request, Response } from 'express';
import { autoInjectable } from 'tsyringe';
import prisma from '../../db';

@autoInjectable()
export class GoalController {
    createGoal = async (req: Request, res: Response) => {
        const { title, description, deadline } = req.body;
        const userId = (req as any).user?.userId;
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

    getGoals = async (req: Request, res: Response) => {
        const userId = (req as any).user?.userId;
        if (!userId) return res.sendStatus(401);

        try {
            const goals = await prisma.goal.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' }
            });
            res.json(goals);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };
}
