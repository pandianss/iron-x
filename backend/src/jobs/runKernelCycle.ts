
import { PrismaClient } from '@prisma/client';
import { kernel } from '../kernel/DisciplineEngine';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger';

const prisma = new PrismaClient();

export const runKernelCycle = async () => {
    Logger.info('[Job] Starting Kernel Cycle...');
    const users = await prisma.user.findMany({ select: { user_id: true } });

    for (const user of users) {
        try {
            await kernel.runCycle({
                userId: user.user_id,
                traceId: uuidv4(),
                timestamp: new Date()
            });
        } catch (error) {
            Logger.error(`[Job] Error running cycle for user ${user.user_id}:`, { error });
        }
    }
    Logger.info('[Job] Kernel Cycle Completed.');
};
