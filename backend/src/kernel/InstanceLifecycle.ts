
import prisma from '../../db';
import { UserId, DisciplineContext } from './domain/types';

export class InstanceLifecycle {
    async materialize(context: DisciplineContext) {
        const { userId, timestamp } = context;
        const startOfDay = new Date(timestamp);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(timestamp);
        endOfDay.setHours(23, 59, 59, 999);

        // Get all active actions for the user
        const actions = await prisma.action.findMany({
            where: { user_id: userId },
        });

        // Get existing instances for today
        const existingInstances = await prisma.actionInstance.findMany({
            where: {
                user_id: userId,
                scheduled_date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        const existingActionIds = new Set(existingInstances.map((i: { action_id: string | null }) => i.action_id));
        const newInstances = [];

        for (const action of actions) {
            if (action.action_id && existingActionIds.has(action.action_id)) continue;

            const windowStart = new Date(action.window_start_time);
            const scheduledStart = new Date(startOfDay);
            scheduledStart.setHours(windowStart.getHours(), windowStart.getMinutes(), 0, 0);

            const scheduledEnd = new Date(scheduledStart);
            scheduledEnd.setMinutes(scheduledEnd.getMinutes() + action.window_duration_minutes);

            newInstances.push({
                action_id: action.action_id!,
                user_id: userId,
                scheduled_date: startOfDay,
                scheduled_start_time: scheduledStart,
                scheduled_end_time: scheduledEnd,
                status: 'PENDING',
            });
        }

        if (newInstances.length > 0) {
            await prisma.actionInstance.createMany({
                data: newInstances,
            });
        }
    }

    async detectMissed(context: DisciplineContext): Promise<string[]> {
        const now = context.timestamp;

        // Find instances that are about to be marked as MISSED
        // We only check for the specific user in the context to keep it kernel-centric
        // Bulk checks should be done by iterating users and calling this engine method
        const missedInstances = await prisma.actionInstance.findMany({
            where: {
                user_id: context.userId,
                status: 'PENDING',
                scheduled_end_time: { lt: now }
            },
            select: {
                instance_id: true
            }
        });

        if (missedInstances.length === 0) return [];

        const instanceIds = missedInstances.map((i: { instance_id: string }) => i.instance_id);

        // Bulk update status
        await prisma.actionInstance.updateMany({
            where: {
                instance_id: { in: instanceIds }
            },
            data: {
                status: 'MISSED'
            }
        });

        return instanceIds;
    }
}
