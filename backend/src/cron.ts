
import cron from 'node-cron';
import { materializeInstances } from './jobs/materializeInstances';
import { schedulePrompts } from './jobs/promptScheduler';
import { resolveMissedActions } from './jobs/resolveMissed';
import { calculateDisciplineScore } from './jobs/calculateScore';

export const startCronJobs = () => {
    console.log('Starting cron jobs...');

    // Task B1: Materialize Instances - Daily at midnight
    cron.schedule('0 0 * * *', () => {
        materializeInstances();
    });

    // Run Task B1 on startup
    materializeInstances();

    // Task B2: Prompt Scheduler - Every minute
    cron.schedule('* * * * *', () => {
        schedulePrompts();
    });

    // Task B3: Missed Action Resolution - Every minute
    cron.schedule('* * * * *', () => {
        resolveMissedActions();
    });

    // Task C1: Discipline Score Batch Job - Daily at 23:59
    cron.schedule('59 23 * * *', () => {
        calculateDisciplineScore();
    });
};

