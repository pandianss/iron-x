"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKernelWorker = exports.kernelQueue = exports.QUEUE_NAME = void 0;
const bullmq_1 = require("bullmq");
const ioredis_1 = __importDefault(require("ioredis"));
const REDIS_URL = process.env.REDIS_URL || 'redis://iron_redis:6379';
// Shared Redis connection for reuse
const connection = new ioredis_1.default(REDIS_URL, {
    maxRetriesPerRequest: null
});
exports.QUEUE_NAME = 'kernel-operations';
// Producer
exports.kernelQueue = new bullmq_1.Queue(exports.QUEUE_NAME, { connection });
// Consumer (Worker)
const createKernelWorker = () => {
    return new bullmq_1.Worker(exports.QUEUE_NAME, async (job) => {
        if (job.name === 'KERNEL_CYCLE_JOB') {
            const { userId, traceId, timestamp } = job.data;
            // Dynamic import to avoid circular dependency issues at module top-level if any
            const { kernel } = await Promise.resolve().then(() => __importStar(require('../kernel/DisciplineEngine')));
            console.log(`[Worker] Processing Cycle: ${job.id} for user ${userId}`);
            await kernel.runCycle({
                userId,
                traceId,
                timestamp: new Date(timestamp)
            });
        }
    }, { connection });
};
exports.createKernelWorker = createKernelWorker;
