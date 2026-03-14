import cron from 'node-cron';
import prisma from './db';
import { kernelQueue, redisConnection } from './infrastructure/queue';
import { Logger } from './utils/logger';

const LEADER_KEY = 'ironx:cron:leader';
const LEADER_TTL = 3600; // 1 hour

/**
 * Basic Redis-based leader election.
 * Returns true if this instance successfully claimed the lead for this hour.
 */
async function isLeader(): Promise<boolean> {
    const instanceId = process.env.HOSTNAME || 'local-instance';
    // NX = Only set if not exists, EX = TTL in seconds
    const result = await redisConnection.set(LEADER_KEY, instanceId, 'EX', LEADER_TTL, 'NX');
    return result === 'OK';
}

export const startCronJobs = () => {
    if (process.env.CRON_ENABLED === 'false') {
        Logger.info('[Cron] Scheduler disabled via CRON_ENABLED flag.');
        return;
    }

    Logger.info('[Cron] Initializing scheduler...');

    // Run every hour to check for missed actions and violations
    cron.schedule('0 * * * *', async () => {
        if (!(await isLeader())) {
            Logger.debug('[Cron] Not the leader for this cycle. Skipping.');
            return;
        }

        Logger.info('[Cron] Triggering hourly discipline score recalculation cycle...');

        try {
            // Find users active in the last 7 days or with non-zero scores
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const activeUsers = await prisma.user.findMany({
                where: {
                    OR: [
                        { action_instances: { some: { scheduled_start_time: { gte: sevenDaysAgo } } } },
                        { current_discipline_score: { gt: 0 } }
                    ]
                },
                select: { user_id: true }
            });

            Logger.info(`[Cron] Enqueuing ${activeUsers.length} users for score update.`);

            // Parallelize by pushing individual jobs to BullMQ
            const jobs = activeUsers.map(user => ({
                name: 'KERNEL_CYCLE_JOB',
                data: { userId: user.user_id, timestamp: new Date().toISOString() },
                opts: { removeOnComplete: true, removeOnFail: 1000 }
            }));

            if (jobs.length > 0) {
                await kernelQueue.addBulk(jobs);
                Logger.info(`[Cron] Successfully enqueued ${jobs.length} jobs.`);
            }
        } catch (error) {
            Logger.error('[Cron] Hourly discipline cycle trigger failed:', error);
        }
    });

    // Run every day at 3 AM to cleanup old audit logs
    cron.schedule('0 3 * * *', async () => {
        if (!(await isLeader())) return;

        Logger.info('[Cron] Triggering audit log cleanup...');
        try {
            const retentionDays = parseInt(process.env.AUDIT_RETENTION_DAYS || '90');
            await kernelQueue.add('CLEANUP_LOGS_JOB', { retentionDays });
        } catch (error) {
            Logger.error('[Cron] Failed to trigger audit log cleanup:', error);
        }
    });

    // Run every Sunday at 2 AM for database maintenance
    cron.schedule('0 2 * * 0', async () => {
        if (!(await isLeader())) return;

        Logger.info('[Cron] Triggering weekly database maintenance...');
        try {
            Logger.info('[Cron] Database maintenance skipped (Ops module inactive)');
        } catch (error) {
            Logger.error('[Cron] Weekly maintenance failed:', error);
        }
    });

    Logger.info('[Cron] Scheduler started.');
};
