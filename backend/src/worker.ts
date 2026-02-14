import { createKernelWorker } from './infrastructure/queue';
import { registerObservers } from './bootstrap/registerObservers';
import dotenv from 'dotenv';
import { domainEvents } from './kernel/domain/events';

dotenv.config();

console.log('[Worker] Starting Iron Kernel Worker...');

// 1. Register Observers (Essential for side effects!)
registerObservers();

// 2. Start Worker
const worker = createKernelWorker();

worker.on('ready', () => {
    console.log('[Worker] Ready and listening for jobs.');
});

worker.on('failed', (job: any, err: any) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err);
});

// Listener for logging confirmation
domainEvents.on('KERNEL_CYCLE_COMPLETED' as any, (event: any) => {
    console.log(`[Worker] Success! Cycle complete for ${event.userId}. Score: ${event.payload.score}`);
});
