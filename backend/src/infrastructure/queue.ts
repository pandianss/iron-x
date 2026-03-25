import { Queue, Worker, Job } from 'bullmq';

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://iron_redis:6379';

// Shared Redis connection for reuse
export const redisConnection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null
});
redisConnection.on('error', (err) => console.warn('[Redis Queue] Connection Error:', err.message));

export const QUEUE_NAME = 'kernel-operations';

// Producer
export const kernelQueue = new Queue(QUEUE_NAME, { 
    connection: redisConnection as any,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
        removeOnComplete: true,
        removeOnFail: false,
    }
});

// Consumer (Worker)
export const createKernelWorker = () => {
    return new Worker(QUEUE_NAME, async (job: Job) => {
        if (job.name === 'KERNEL_CYCLE_JOB') {
            const { userId, traceId, timestamp } = job.data;
            // Dynamic import to avoid circular dependency issues at module top-level if any
            const { kernel } = await import('../kernel/DisciplineEngine');

            console.log(`[Worker] Processing Cycle: ${job.id} for user ${userId}`);
            await kernel.runCycle({
                userId,
                traceId,
                timestamp: new Date(timestamp)
            });
        }

        if (job.name === 'CLEANUP_LOGS_JOB') {
            const { retentionDays } = job.data;
            const { AuditService } = await import('../modules/audit/audit.service');
            const { container } = await import('tsyringe');
            const auditService = container.resolve(AuditService);
            console.log(`[Worker] Running Audit Log Cleanup. Retention: ${retentionDays} days`);
            const deletedCount = await auditService.cleanupLogs(retentionDays);
            console.log(`[Worker] Audit Log Cleanup Complete. Deleted ${deletedCount} logs.`);
        }

        if (job.name === 'WEBHOOK_JOB') {
            const { url, payload, secret } = job.data;
            const { WebhookService } = await import('./webhook.service');
            const { container } = await import('tsyringe');
            const webhookService = container.resolve(WebhookService);

            console.log(`[Worker] Delivering Webhook to: ${url}`);
            await webhookService.sendWebhook(url, payload, secret);
            console.log(`[Worker] Webhook delivered successfully to ${url}`);
        }
    }, { connection: redisConnection as any });
};
