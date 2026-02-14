"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./utils/logger");
const registerObservers_1 = require("./bootstrap/registerObservers");
const dotenv_1 = __importDefault(require("dotenv"));
const bullmq_1 = require("bullmq");
const DisciplineEngine_1 = require("./kernel/DisciplineEngine");
const queue_1 = require("./infrastructure/queue");
// Load environment variables
dotenv_1.default.config();
logger_1.Logger.info('[Worker] Starting Iron Kernel Worker...');
// Register Observers (Essential for Domain Events to work in the worker process)
(0, registerObservers_1.registerObservers)();
const worker = new bullmq_1.Worker('kernel-operations', async (job) => {
    // Logger.info(`[Worker] Processing Cycle: ${job.name} for user ${job.data.userId}`);
    // Instantiate Kernel per job for isolation (or use Singleton if stateless enough)
    const engine = new DisciplineEngine_1.DisciplineEngine();
    const result = await engine.runCycle(job.data.userId);
    return result;
}, {
    connection: queue_1.redisConnection
});
worker.on('ready', () => {
    logger_1.Logger.info('[Worker] Ready and listening for jobs.');
});
worker.on('failed', (job, err) => {
    logger_1.Logger.error(`[Worker] Job ${job?.id} failed:`, err);
});
// Listen for completion to log success/score
worker.on('completed', (job, result) => {
    // The result comes from engine.runCycle()
    // We can assume it returns the event payload or we catch the domain event separately.
    // For now, let's just log completion.
    logger_1.Logger.info(`[Worker] Cycle complete for ${job.data.userId}.`);
});
// Listen to Domain Events locally in this process to log them?
// The DisciplineEngine emits to `domainEvents`. 
// We already registered observers in `registerObservers()`.
// If we want to log specifically here:
const events_1 = require("./kernel/domain/events");
events_1.domainEvents.on(events_1.DomainEventType.KERNEL_CYCLE_COMPLETED, (event) => {
    logger_1.Logger.info(`[Worker] Success! Cycle complete for ${event.userId}. Score: ${event.payload.score}`);
});
