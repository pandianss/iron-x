import { Queue, Worker, Job } from 'bullmq';

import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://iron_redis:6379';

// Shared Redis connection for reuse
const connection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null
});

export const QUEUE_NAME = 'kernel-operations';

// Producer
export const kernelQueue = new Queue(QUEUE_NAME, { connection });

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
    }, { connection });
};
