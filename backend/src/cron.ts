import cron from 'node-cron';
import prisma from './db';
import { kernelQueue } from './infrastructure/queue';
import { v4 as uuidv4 } from 'uuid';

import { Logger } from './utils/logger';

export const startCronJobs = () => {
    if (process.env.CRON_ENABLED === 'false') {
        Logger.info('[Cron] Scheduler disabled via CRON_ENABLED flag.');
        return;
    }

    // Leader-election hook: In a multi-instance env, only one should run cron.
    // Future: Add Redis-based lock check here.

    Logger.info('[Cron] Initializing scheduler...');

    // Run every hour to check for missed actions and violations
    cron.schedule('0 * * * *', async () => {
        Logger.info('[Cron] Triggering hourly discipline score recalculation cycle...');

        try {
            const { container } = await import('tsyringe');
            const { DisciplineStateService } = await import('./services/disciplineState.service');
            const disciplineService = container.resolve(DisciplineStateService);

            // Find users active in the last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const activeUsers = await prisma.user.findMany({
                where: {
                    OR: [
                        { action_instances: { some: { scheduled_start_time: { gte: sevenDaysAgo } } } },
                        { current_discipline_score: { gt: 0 } }
                    ]
                },
                select: { user_id: true, current_discipline_score: true }
            });

            Logger.info(`[Cron] Processing ${activeUsers.length} users for score update.`);

            for (const user of activeUsers) {
                try {
                    const oldScore = user.current_discipline_score;
                    const newScore = await disciplineService.updateDisciplineScore(user.user_id);
                    const delta = Math.round((newScore - oldScore) * 10) / 10;

                    Logger.info(`[Cron] User ${user.user_id}: ${oldScore} -> ${newScore} (delta: ${delta})`);

                    // Task 04: Evaluate Trust Tier
                    const { TrustTierService } = await import('./services/trustTier.service');
                    const trustService = container.resolve(TrustTierService);
                    await trustService.evaluateTierUpdate(user.user_id);

                    // Task 05: Anticipatory Notifications
                    const { NotificationService } = await import('./services/notification.service');
                    const notifService = container.resolve(NotificationService);
                    await notifService.checkAndNotify(user.user_id);

                    // Check for lockout triggers
                    // If DS hits breach threshold (< 20 as per item 01)
                    if (newScore < 20) {
                        const lockoutHours = 24; // Default
                        const lockedUntil = new Date();
                        lockedUntil.setHours(lockedUntil.getHours() + lockoutHours);

                        await prisma.user.update({
                            where: { user_id: user.user_id },
                            data: {
                                locked_until: lockedUntil,
                                enforcement_mode: 'HARD'
                            }
                        });
                        Logger.warn(`[Cron] User ${user.user_id} BREACHED. HARD Lockout applied until ${lockedUntil.toISOString()}`);
                    }
                } catch (userError) {
                    Logger.error(`[Cron] Failed to update score for user ${user.user_id}:`, userError);
                }
            }
        } catch (error) {
            Logger.error('[Cron] Hourly discipline cycle failed:', error);
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
