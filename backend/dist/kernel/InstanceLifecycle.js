"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstanceLifecycle = void 0;
const db_1 = __importDefault(require("../db"));
class InstanceLifecycle {
    async loadContext(userId) {
        // 1. Fetch User & Policy
        const user = await db_1.default.user.findUnique({
            where: { user_id: userId },
            include: {
                role: {
                    include: { policy: true }
                }
            }
        });
        if (!user)
            throw new Error(`User ${userId} not found`);
        // 2. Resolve Policy
        let policyData = user.role?.policy;
        if (!policyData) {
            policyData = await db_1.default.policy.findFirst({
                where: { scope: 'ORG', name: 'DEFAULT' }
            });
        }
        const SYSTEM_DEFAULTS = {
            max_misses: 3,
            score_threshold: 50,
            lockout_hours: 24
        };
        let rules = SYSTEM_DEFAULTS;
        if (policyData?.rules) {
            try {
                rules = { ...SYSTEM_DEFAULTS, ...JSON.parse(policyData.rules) };
            }
            catch (e) {
                console.error(`Failed to parse policy rules`, e);
            }
        }
        const mode = (policyData?.enforcement_mode || user.enforcement_mode || 'NONE');
        // 3. Fetch Instances (Window: Start of Month to Now + Buffer?)
        // For scoring we need month data. For execution we need today.
        // Let's load Start of Month -> End of Today
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);
        const instances = await db_1.default.actionInstance.findMany({
            where: {
                user_id: userId,
                scheduled_date: {
                    gte: startOfMonth,
                    lte: endOfToday
                }
            }
        });
        return {
            userId,
            traceId: 'pending',
            timestamp: new Date(),
            user: {
                current_discipline_score: user.current_discipline_score
            },
            instances: instances.map(i => ({
                instance_id: i.instance_id,
                action_id: i.action_id || '',
                status: i.status || 'PENDING',
                scheduled_date: i.scheduled_date,
                scheduled_start_time: i.scheduled_start_time,
                scheduled_end_time: i.scheduled_end_time
            })),
            policy: {
                rules,
                mode
            },
            violations: []
        };
    }
    async materialize(context) {
        const { userId, timestamp } = context;
        const startOfDay = new Date(timestamp);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(timestamp);
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
        const existingActionIds = new Set(existingInstances.map((i) => i.action_id));
        const newInstances = [];
        for (const action of actions) {
            if (action.action_id && existingActionIds.has(action.action_id))
                continue;
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
    }
    async detectMissed(context) {
        const now = context.timestamp;
        // Find instances that are about to be marked as MISSED
        // We only check for the specific user in the context to keep it kernel-centric
        // Bulk checks should be done by iterating users and calling this engine method
        const missedInstances = await db_1.default.actionInstance.findMany({
            where: {
                user_id: context.userId,
                status: 'PENDING',
                scheduled_end_time: { lt: now }
            },
            select: {
                instance_id: true
            }
        });
        if (missedInstances.length === 0)
            return [];
        const instanceIds = missedInstances.map((i) => i.instance_id);
        // Bulk update status
        await db_1.default.actionInstance.updateMany({
            where: {
                instance_id: { in: instanceIds }
            },
            data: {
                status: 'MISSED'
            }
        });
        return instanceIds;
    }
}
exports.InstanceLifecycle = InstanceLifecycle;
