import { PrismaClient } from '@prisma/client';
import { kernelQueue } from '../infrastructure/queue';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../core/logger';

const prisma = new PrismaClient();

export const runKernelCycle = async () => {
    Logger.info('[Job] Dispatching Kernel Cycles to Queue...');
    const users = await prisma.user.findMany({ select: { user_id: true } });

    for (const user of users) {
        try {
            await kernelQueue.add('KERNEL_CYCLE_JOB', {
                userId: user.user_id,
                traceId: uuidv4(),
                timestamp: new Date().toISOString()
            }, {
                jobId: `kernel-${user.user_id}-${new Date().toISOString().split('T')[0]}` // Prevent multiple runs per day per user if desired, or just use user-id
            });
        } catch (error) {
            Logger.error(`[Job] Error dispatching cycle for user ${user.user_id}:`, { error });
        }
    }
    Logger.info('[Job] All Kernel Cycles Dispatched.');
};
