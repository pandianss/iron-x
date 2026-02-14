import { Request, Response } from 'express';
import { autoInjectable } from 'tsyringe';
import prisma from '../../db';

@autoInjectable()
export class ActionController {
    createAction = async (req: Request, res: Response) => {
        const {
            goal_id,
            title,
            description,
            frequency_rule, // JSON object
            window_start_time, // "HH:mm" string or ISO
            window_duration_minutes,
            is_strict
        } = req.body;

        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);

        // Convert time string to Date if necessary
        // Assuming window_start_time is "HH:mm"
        let dateObj = new Date();
        if (typeof window_start_time === 'string' && window_start_time.includes(':')) {
            const [hours, minutes] = window_start_time.split(':').map(Number);
            dateObj.setHours(hours, minutes, 0, 0);
        } else {
            dateObj = new Date(window_start_time);
        }

        try {
            const action = await prisma.action.create({
                data: {
                    user_id: userId,
                    goal_id: goal_id || null,
                    title,
                    description,
                    frequency_rule,
                    window_start_time: dateObj,
                    window_duration_minutes: parseInt(window_duration_minutes),
                    is_strict: is_strict ?? true,
                },
            });
            res.status(201).json(action);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };

    getActions = async (req: Request, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);

        try {
            const actions = await prisma.action.findMany({
                where: { user_id: userId },
                include: { goal: true }, // Include related goal details
                orderBy: { created_at: 'desc' },
            });
            res.json(actions);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Server error' });
        }
    };
}
