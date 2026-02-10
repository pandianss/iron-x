import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../db';
import { generateDailyInstances } from '../services/scheduler';

export const getDailySchedule = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        // Ensure instances exist for today
        await generateDailyInstances(userId);

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const instances = await prisma.actionInstance.findMany({
            where: {
                user_id: userId,
                scheduled_date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: { action: true },
            orderBy: { scheduled_start_time: 'asc' },
        });

        res.json(instances);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const logExecution = async (req: AuthRequest, res: Response) => {
    const { id } = req.params as { id: string };
    const { executed_at } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.sendStatus(401);

    try {
        const instance = await prisma.actionInstance.findUnique({
            where: { instance_id: id },
        });

        if (!instance || instance.user_id !== userId) {
            return res.sendStatus(404);
        }

        const timestamp = executed_at ? new Date(executed_at) : new Date();

        // Determine status (Completed, Late, etc.) - simplified for MVP
        let status = 'COMPLETED';
        if (timestamp > instance.scheduled_end_time) {
            status = 'LATE';
        }

        const updated = await prisma.actionInstance.update({
            where: { instance_id: id },
            data: {
                executed_at: timestamp,
                status: status,
            },
        });

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
