"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.materializeInstances = void 0;
const db_1 = __importDefault(require("../db"));
const materializeInstances = async () => {
    console.log('Running materializeInstances job...');
    const now = new Date();
    // Normalize "today" to midnight local time (or UTC depending on design, spec says "Once per day per timezone", assuming server local for MVP or user timezone)
    // For MVP, lets assume server time for simplicity or user timezone if we had it per user.
    // The spec says "Frequency: Once per day per timezone".
    // Since we don't have a complex timezone scheduler yet, we'll iterate all users/actions and use their timezone if stored, or default to server time.
    // User model has `timezone`.
    // Strategy:
    // 1. Get all users.
    // 2. For each user, determine "today" in their timezone. (Skipping complex timezone logic for MVP, using server time as baseline or simple offset).
    // Actually, `Action` has `window_start_time` stored as a Date.
    // We'll simplify: Run for "today" based on server time.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
        const actions = await db_1.default.action.findMany({
            include: { user: true }
        });
        for (const action of actions) {
            // Check frequency
            const rule = action.frequency_rule;
            if (rule.type !== 'daily') {
                // TODO: Handle other frequencies
                continue;
            }
            // Check if instance already exists for today
            const existing = await db_1.default.actionInstance.findFirst({
                where: {
                    action_id: action.action_id,
                    scheduled_date: today
                }
            });
            if (existing) {
                continue;
            }
            // Create instance
            // Calculate scheduled_start_time
            // taking the time from action.window_start_time and applying it to "today"
            const start = new Date(today);
            const actionTime = new Date(action.window_start_time);
            start.setHours(actionTime.getHours(), actionTime.getMinutes(), 0, 0);
            const end = new Date(start);
            end.setMinutes(end.getMinutes() + action.window_duration_minutes);
            await db_1.default.actionInstance.create({
                data: {
                    action_id: action.action_id,
                    user_id: action.user_id,
                    scheduled_date: today,
                    scheduled_start_time: start,
                    scheduled_end_time: end,
                    status: 'PENDING'
                }
            });
            console.log(`Created instance for action ${action.title}`);
        }
        console.log('materializeInstances job complete.');
    }
    catch (error) {
        console.error('Error in materializeInstances:', error);
    }
};
exports.materializeInstances = materializeInstances;
