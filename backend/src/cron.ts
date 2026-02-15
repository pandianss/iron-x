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

    // Run every day at 3 AM to cleanup old audit logs
    cron.schedule('0 3 * * *', async () => {
        Logger.info('[Cron] Triggering audit log cleanup...');
        try {
            // Default to 90 days retention if not specified
            const retentionDays = parseInt(process.env.AUDIT_RETENTION_DAYS || '90');
            await kernelQueue.add('CLEANUP_LOGS_JOB', { retentionDays });
        } catch (error) {
            Logger.error('[Cron] Failed to trigger audit log cleanup:', error);
        }
    });

    // Run every Sunday at 2 AM for database maintenance
    // Run every Sunday at 2 AM for database maintenance
    cron.schedule('0 2 * * 0', async () => {
        Logger.info('[Cron] Triggering weekly database maintenance...');
        try {
            // const { container } = await import('tsyringe');
            // const { OpsService } = await import('./modules/_experimental/ops/ops.service');
            // const opsService = container.resolve(OpsService);
            // await opsService.runDatabaseMaintenance();
            Logger.info('[Cron] Database maintenance skipped (Ops module inactive)');
        } catch (error) {
            Logger.error('[Cron] Weekly maintenance failed:', error);
        }
    });

    Logger.info('[Cron] Scheduler started.');
};
