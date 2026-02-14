
import prisma from '../db';
import { Logger } from '../utils/logger';

export const schedulePrompts = async () => {
    // Run every minute
    const now = new Date();

    try {
        // 1. First Prompt: At window_start_time
        // Find pending instances that have started but have NO prompts
        const pendingForFirstPrompt = await prisma.actionInstance.findMany({
            where: {
                status: 'PENDING',
                scheduled_start_time: { lte: now },
                scheduled_end_time: { gt: now }, // Still within window
                prompts: {
                    none: {}
                }
            },
            include: { action: true } // to get details if needed
        });

        for (const instance of pendingForFirstPrompt) {
            Logger.info(`Sending FIRST prompt for ${instance.action?.title}`);
            // Mock dispatch
            await prisma.prompt.create({
                data: {
                    instance_id: instance.instance_id,
                    type: 'PUSH', // Default
                    sent_at: now
                }
            });
        }

        // 2. Retry Prompt: At 50% of window duration
        // Find pending instances with EXACTLY 1 prompt
        // And time >= start + 0.5 * duration
        // And now < end
        // Optimization: Fetch potentially relevant instances and filter in JS if complex DB query
        // Or use advanced filtering if Prisma supports it easily.
        // We can find instances with 1 prompt.

        // Let's get instances that are PENDING and capable of receiving a retry
        const pendingForRetry = await prisma.actionInstance.findMany({
            where: {
                status: 'PENDING',
                scheduled_start_time: { lte: now },
                scheduled_end_time: { gt: now },
                prompts: {
                    some: {} // Has prompts
                }
            },
            include: {
                prompts: true,
                action: true
            }
        });

        for (const instance of pendingForRetry) {
            if (instance.prompts.length === 1) {
                // Check if it's time for retry
                // Duration in minutes
                // We need the Action to know duration, but ActionInstance has scheduled_end_time and scheduled_start_time
                const start = new Date(instance.scheduled_start_time);
                const end = new Date(instance.scheduled_end_time);
                const durationMs = end.getTime() - start.getTime();
                const retryTime = new Date(start.getTime() + (durationMs * 0.5));

                if (now >= retryTime) {
                    Logger.info(`Sending RETRY prompt for ${instance.action?.title}`);
                    await prisma.prompt.create({
                        data: {
                            instance_id: instance.instance_id,
                            type: 'PUSH',
                            sent_at: now
                        }
                    });
                }
            }
        }
    } catch (error) {
        Logger.error('Error in schedulePrompts', { error });
    }
};
