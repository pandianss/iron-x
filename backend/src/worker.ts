import { Logger } from './utils/logger';
import { registerObservers } from './bootstrap/registerObservers';
import dotenv from 'dotenv';
import { Worker, Job } from 'bullmq';
import { DisciplineEngine } from './kernel/DisciplineEngine';
import { redisConnection } from './infrastructure/queue';

// Load environment variables
dotenv.config();

Logger.info('[Worker] Starting Iron Kernel Worker...');

// Register Observers (Essential for Domain Events to work in the worker process)
registerObservers();

const worker = new Worker('kernel-operations', async (job: Job) => {
    // Logger.info(`[Worker] Processing Cycle: ${job.name} for user ${job.data.userId}`);

    // Instantiate Kernel per job for isolation (or use Singleton if stateless enough)
    const engine = new DisciplineEngine();
    const result = await engine.runCycle(job.data.userId);

    return result;
}, {
    connection: redisConnection
});

worker.on('ready', () => {
    Logger.info('[Worker] Ready and listening for jobs.');
});

worker.on('failed', (job, err: Error) => {
    Logger.error(`[Worker] Job ${job?.id} failed:`, err);
});

// Listen for completion to log success/score
worker.on('completed', (job, result) => {
    // The result comes from engine.runCycle()
    // We can assume it returns the event payload or we catch the domain event separately.
    // For now, let's just log completion.
    Logger.info(`[Worker] Cycle complete for ${job.data.userId}.`);
});

// Listen to Domain Events locally in this process to log them?
// The DisciplineEngine emits to `domainEvents`. 
// We already registered observers in `registerObservers()`.
// If we want to log specifically here:
import { domainEvents, DomainEventType, KernelCycleCompletedEvent } from './kernel/domain/events';
domainEvents.on(DomainEventType.KERNEL_CYCLE_COMPLETED, (event: KernelCycleCompletedEvent) => {
    Logger.info(`[Worker] Success! Cycle complete for ${event.userId}. Score: ${event.payload.score}`);
});
