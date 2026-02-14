import cron from 'node-cron';
import prisma from './db';
import { kernel } from './kernel/DisciplineEngine';
import { v4 as uuidv4 } from 'uuid';

export const startCronJobs = () => {
    // Run every hour to check for missed actions and violations
    cron.schedule('0 * * * *', async () => {
        console.log('[Cron] Starting hourly discipline cycle...');

        try {
            const users = await prisma.user.findMany({ select: { user_id: true } });

            for (const user of users) {
                const traceId = uuidv4();
                await kernel.runCycle({
                    userId: user.user_id,
                    traceId,
                    timestamp: new Date()
                });
            }
        } catch (error) {
            console.error('[Cron] Discipline cycle failed:', error);
        }
    });

    console.log('[Cron] Scheduler started.');
};
