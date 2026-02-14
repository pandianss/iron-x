
import cron from 'node-cron';
import { runKernelCycle } from './jobs/runKernelCycle';

export const startCronJobs = () => {
    console.log('Starting cron jobs...');

    // Unified Kernel Cycle - Runs every minute
    // This orchestrates materialization, violation detection, and scoring
    cron.schedule('* * * * *', () => {
        runKernelCycle();
    });

    // Run once on startup
    runKernelCycle();
};

