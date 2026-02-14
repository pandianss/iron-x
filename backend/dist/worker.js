"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const queue_1 = require("./infrastructure/queue");
const registerObservers_1 = require("./bootstrap/registerObservers");
const dotenv_1 = __importDefault(require("dotenv"));
const events_1 = require("./kernel/domain/events");
dotenv_1.default.config();
console.log('[Worker] Starting Iron Kernel Worker...');
// 1. Register Observers (Essential for side effects!)
(0, registerObservers_1.registerObservers)();
// 2. Start Worker
const worker = (0, queue_1.createKernelWorker)();
worker.on('ready', () => {
    console.log('[Worker] Ready and listening for jobs.');
});
worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err);
});
// Listener for logging confirmation
events_1.domainEvents.on('KERNEL_CYCLE_COMPLETED', (event) => {
    console.log(`[Worker] Success! Cycle complete for ${event.userId}. Score: ${event.payload.score}`);
});
