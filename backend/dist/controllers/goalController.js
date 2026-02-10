"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGoals = exports.createGoal = void 0;
const db_1 = __importDefault(require("../db"));
const createGoal = async (req, res) => {
    const { title, description, deadline } = req.body;
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        const goal = await db_1.default.goal.create({
            data: {
                user_id: userId,
                title,
                description,
                deadline: deadline ? new Date(deadline) : null,
            },
        });
        res.status(201).json(goal);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createGoal = createGoal;
const getGoals = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        const goals = await db_1.default.goal.findMany({
            where: { user_id: userId, status: 'ACTIVE' },
            orderBy: { created_at: 'desc' },
        });
        res.json(goals);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getGoals = getGoals;
