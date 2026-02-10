
import prisma from '../db';

export const resolveMissedActions = async () => {
    const now = new Date();

    try {
        // Find instances that are about to be marked as MISSED
        const missedInstances = await prisma.actionInstance.findMany({
            where: {
                status: 'PENDING',
                scheduled_end_time: { lt: now }
            },
            select: {
                instance_id: true,
                user_id: true
            }
        });

        if (missedInstances.length === 0) return;

        // Bulk update status
        await prisma.actionInstance.updateMany({
            where: {
                instance_id: { in: missedInstances.map(i => i.instance_id) }
            },
            data: {
                status: 'MISSED'
            }
        });

        console.log(`Marked ${missedInstances.length} instances as MISSED.`);

        // Trigger enforcement for each affected user
        // We use a Set to avoid redundant checks if a user missed multiple actions at once
        const affectedUserIds = new Set(missedInstances.map(i => i.user_id).filter(id => id !== null) as string[]);

        // Dynamic import to avoid circular dependency if any (though currently safe)
        const { EnforcementService } = await import('../services/enforcement.service');

        for (const userId of affectedUserIds) {
            await EnforcementService.handleMissedAction(userId, 'BATCH_JOB');
        }

    } catch (error) {
        console.error('Error in resolveMissedActions', error);
    }
};
