"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runKernelCycle = void 0;
const client_1 = require("@prisma/client");
const DisciplineEngine_1 = require("../kernel/DisciplineEngine");
const uuid_1 = require("uuid");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
const runKernelCycle = async () => {
    logger_1.Logger.info('[Job] Starting Kernel Cycle...');
    const users = await prisma.user.findMany({ select: { user_id: true } });
    for (const user of users) {
        try {
            await DisciplineEngine_1.kernel.runCycle({
                userId: user.user_id,
                traceId: (0, uuid_1.v4)(),
                timestamp: new Date()
            });
        }
        catch (error) {
            logger_1.Logger.error(`[Job] Error running cycle for user ${user.user_id}:`, { error });
        }
    }
    logger_1.Logger.info('[Job] Kernel Cycle Completed.');
};
exports.runKernelCycle = runKernelCycle;
