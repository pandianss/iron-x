"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logExecution = exports.getDailySchedule = void 0;
const db_1 = __importDefault(require("../db"));
const DisciplineEngine_1 = require("../kernel/DisciplineEngine");
const uuid_1 = require("uuid");
const getDailySchedule = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        // Ensure instances exist for today
        await DisciplineEngine_1.kernel.runCycle({
            userId,
            traceId: (0, uuid_1.v4)(),
            timestamp: new Date()
        });
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const instances = await db_1.default.actionInstance.findMany({
            where: {
                user_id: userId,
                scheduled_date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: { action: true },
            orderBy: { scheduled_start_time: 'asc' },
        });
        res.json(instances);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getDailySchedule = getDailySchedule;
const logExecution = async (req, res) => {
    const { id } = req.params;
    const { executed_at } = req.body;
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        const instance = await db_1.default.actionInstance.findUnique({
            where: { instance_id: id },
        });
        if (!instance || instance.user_id !== userId) {
            return res.sendStatus(404);
        }
        const timestamp = executed_at ? new Date(executed_at) : new Date();
        // Determine status (Completed, Late, etc.) - simplified for MVP
        let status = 'COMPLETED';
        if (timestamp > instance.scheduled_end_time) {
            status = 'LATE';
        }
        const updated = await db_1.default.actionInstance.update({
            where: { instance_id: id },
            data: {
                executed_at: timestamp,
                status: status,
            },
        });
        res.json(updated);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.logExecution = logExecution;
