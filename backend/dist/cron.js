"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const materializeInstances_1 = require("./jobs/materializeInstances");
const promptScheduler_1 = require("./jobs/promptScheduler");
const resolveMissed_1 = require("./jobs/resolveMissed");
const calculateScore_1 = require("./jobs/calculateScore");
const startCronJobs = () => {
    console.log('Starting cron jobs...');
    // Task B1: Materialize Instances - Daily at midnight
    node_cron_1.default.schedule('0 0 * * *', () => {
        (0, materializeInstances_1.materializeInstances)();
    });
    // Run Task B1 on startup
    (0, materializeInstances_1.materializeInstances)();
    // Task B2: Prompt Scheduler - Every minute
    node_cron_1.default.schedule('* * * * *', () => {
        (0, promptScheduler_1.schedulePrompts)();
    });
    // Task B3: Missed Action Resolution - Every minute
    node_cron_1.default.schedule('* * * * *', () => {
        (0, resolveMissed_1.resolveMissedActions)();
    });
    // Task C1: Discipline Score Batch Job - Daily at 23:59
    node_cron_1.default.schedule('59 23 * * *', () => {
        (0, calculateScore_1.calculateDisciplineScore)();
    });
};
exports.startCronJobs = startCronJobs;
