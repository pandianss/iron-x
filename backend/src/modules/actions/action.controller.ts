import { Response, NextFunction } from 'express';
import { autoInjectable } from 'tsyringe';
import prisma from '../../db';
import { AuthRequest } from '../../middleware/authMiddleware';
import { NotFoundError } from '../../utils/AppError';
import { kernelEvents, DomainEventType } from '../../kernel/events/bus';

@autoInjectable()
export class ActionController {
    createAction = async (req: AuthRequest, res: Response, next: NextFunction) => {
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

            kernelEvents.emitEvent(DomainEventType.ACTION_CREATED, {
                actionId: action.action_id,
                title: action.title
            }, userId);

            res.status(201).json(action);
        } catch (error) {
            next(error);
        }
    };

    getActions = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
            next(error);
        }
    };

    getActionById = async (req: AuthRequest, res: Response, next: NextFunction) => {
        const { actionId } = req.params;
        const userId = req.user?.userId;

        try {
            const action = await prisma.action.findFirst({
                where: {
                    action_id: actionId,
                    user_id: userId
                },
                include: { goal: true }
            });

            if (!action) {
                throw new NotFoundError('Action not found');
            }

            res.json(action);
        } catch (error) {
            next(error);
        }
    };
}
