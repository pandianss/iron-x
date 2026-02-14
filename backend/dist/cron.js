"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const db_1 = __importDefault(require("./db"));
const queue_1 = require("./infrastructure/queue");
const uuid_1 = require("uuid");
const startCronJobs = () => {
    // Run every hour to check for missed actions and violations
    node_cron_1.default.schedule('0 * * * *', async () => {
        console.log('[Cron] Enqueuing hourly discipline cycle...');
        try {
            const users = await db_1.default.user.findMany({ select: { user_id: true } });
            const batchId = (0, uuid_1.v4)();
            const timestamp = new Date();
            for (const user of users) {
                await queue_1.kernelQueue.add('KERNEL_CYCLE_JOB', {
                    userId: user.user_id,
                    traceId: `${batchId}-${user.user_id}`,
                    timestamp
                });
            }
        }
        catch (error) {
            console.error('[Cron] Failed to enqueue discipline cycle:', error);
        }
    });
    console.log('[Cron] Scheduler started.');
};
exports.startCronJobs = startCronJobs;
