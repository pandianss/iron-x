"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDailyInstances = void 0;
const db_1 = __importDefault(require("../db"));
const generateDailyInstances = async (userId, date = new Date()) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    // Get all active actions for the user
    const actions = await db_1.default.action.findMany({
        where: { user_id: userId },
    });
    // Get existing instances for today
    const existingInstances = await db_1.default.actionInstance.findMany({
        where: {
            user_id: userId,
            scheduled_date: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });
    const existingActionIds = new Set(existingInstances.map(i => i.action_id));
    const newInstances = [];
    for (const action of actions) {
        if (existingActionIds.has(action.action_id))
            continue;
        // TODO: proper frequency check. For MVP, assume DAILY for all.
        // parse frequency_rule if strict logic needed
        // Create instance
        // Scheduled start time: combine date with action.window_start_time (Time)
        const windowStart = new Date(action.window_start_time);
        const scheduledStart = new Date(startOfDay);
        scheduledStart.setHours(windowStart.getHours(), windowStart.getMinutes(), 0, 0);
        const scheduledEnd = new Date(scheduledStart);
        scheduledEnd.setMinutes(scheduledEnd.getMinutes() + action.window_duration_minutes);
        newInstances.push({
            action_id: action.action_id,
            user_id: userId,
            scheduled_date: startOfDay,
            scheduled_start_time: scheduledStart,
            scheduled_end_time: scheduledEnd,
            status: 'PENDING',
        });
    }
    if (newInstances.length > 0) {
        await db_1.default.actionInstance.createMany({
            data: newInstances,
        });
    }
};
exports.generateDailyInstances = generateDailyInstances;
