import cron from 'node-cron';
import prisma from './db';
import { kernelQueue } from './infrastructure/queue';
import { v4 as uuidv4 } from 'uuid';

import { Logger } from './utils/logger';

export const startCronJobs = () => {
    // Run every hour to check for missed actions and violations
    cron.schedule('0 * * * *', async () => {
        Logger.info('[Cron] Enqueuing hourly discipline cycle...');

        try {
            const users = await prisma.user.findMany({ select: { user_id: true } });
            const batchId = uuidv4();
            const timestamp = new Date(); // Use current time

            Logger.info(`[Cron] Enqueuing jobs for ${users.length} users. Batch: ${batchId}`);

            for (const user of users) {
                await kernelQueue.add('KERNEL_CYCLE_JOB', {
                    userId: user.user_id,
                    traceId: `${batchId}-${user.user_id}`,
                    timestamp
                });
            }
        } catch (error) {
            Logger.error('[Cron] Failed to enqueue discipline cycle:', error);
        }
    });

    Logger.info('[Cron] Scheduler started.');
};
