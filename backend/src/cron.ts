import cron from 'node-cron';
import prisma from './db';
import { kernelQueue } from './infrastructure/queue';
import { v4 as uuidv4 } from 'uuid';

export const startCronJobs = () => {
    // Run every hour to check for missed actions and violations
    cron.schedule('0 * * * *', async () => {
        console.log('[Cron] Enqueuing hourly discipline cycle...');

        try {
            const users = await prisma.user.findMany({ select: { user_id: true } });
            const batchId = uuidv4();
            const timestamp = new Date();

            for (const user of users) {
                await kernelQueue.add('KERNEL_CYCLE_JOB', {
                    userId: user.user_id,
                    traceId: `${batchId}-${user.user_id}`,
                    timestamp
                });
            }
        } catch (error) {
            console.error('[Cron] Failed to enqueue discipline cycle:', error);
        }
    });

    console.log('[Cron] Scheduler started.');
};
