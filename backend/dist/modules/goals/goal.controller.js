"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalController = void 0;
const tsyringe_1 = require("tsyringe");
const db_1 = __importDefault(require("../../db"));
let GoalController = class GoalController {
    constructor() {
        this.createGoal = async (req, res) => {
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
        this.getGoals = async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                return res.sendStatus(401);
            try {
                const goals = await db_1.default.goal.findMany({
                    where: { user_id: userId },
                    orderBy: { created_at: 'desc' }
                });
                res.json(goals);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Server error' });
            }
        };
    }
};
exports.GoalController = GoalController;
exports.GoalController = GoalController = __decorate([
    (0, tsyringe_1.autoInjectable)()
], GoalController);
