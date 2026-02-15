import { Queue, Worker, Job } from 'bullmq';

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://iron_redis:6379';

// Shared Redis connection for reuse
export const redisConnection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null
});

export const QUEUE_NAME = 'kernel-operations';

// Producer
export const kernelQueue = new Queue(QUEUE_NAME, { connection: redisConnection });

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
            console.log(`[Worker] Running Audit Log Cleanup. Retention: ${retentionDays} days`);
            const deletedCount = await AuditService.cleanupLogs(retentionDays);
            console.log(`[Worker] Audit Log Cleanup Complete. Deleted ${deletedCount} logs.`);
        }

        if (job.name === 'WEBHOOK_JOB') {
            const { url, payload, secret } = job.data;
            const axios = (await import('axios')).default;
            const crypto = await import('crypto');

            console.log(`[Worker] Delivering Webhook to: ${url}`);

            const headers: any = { 'Content-Type': 'application/json' };
            if (secret) {
                const signature = crypto
                    .createHmac('sha256', secret)
                    .update(JSON.stringify(payload))
                    .digest('hex');
                headers['X-Iron-X-Signature'] = signature;
            }

            try {
                await axios.post(url, payload, { headers, timeout: 5000 });
                console.log(`[Worker] Webhook delivered successfully to ${url}`);
            } catch (error: any) {
                console.error(`[Worker] Webhook delivery failed to ${url}:`, error.message);
                throw error; // Let BullMQ handle retries
            }
        }
    }, { connection: redisConnection });
};
