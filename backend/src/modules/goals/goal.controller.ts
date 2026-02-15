import { Request, Response, NextFunction } from 'express';
import { autoInjectable } from 'tsyringe';
import prisma from '../../db';
import { UnauthorizedError } from '../../utils/AppError';

@autoInjectable()
export class GoalController {
    createGoal = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { title, description, deadline } = req.body;
            const userId = (req as any).user?.userId;
            if (!userId) throw new UnauthorizedError();
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
            next(error);
        }
    };

    getGoals = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = (req as any).user?.userId;
            if (!userId) throw new UnauthorizedError();
            const goals = await prisma.goal.findMany({
                where: { user_id: userId },
                orderBy: { created_at: 'desc' }
            });
            res.json(goals);
        } catch (error) {
            next(error);
        }
    };
}
