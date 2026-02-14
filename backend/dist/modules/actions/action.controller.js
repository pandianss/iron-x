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
exports.ActionController = void 0;
const tsyringe_1 = require("tsyringe");
const db_1 = __importDefault(require("../../db"));
let ActionController = class ActionController {
    constructor() {
        this.createAction = async (req, res) => {
            const { goal_id, title, description, frequency_rule, // JSON object
            window_start_time, // "HH:mm" string or ISO
            window_duration_minutes, is_strict } = req.body;
            const userId = req.user?.userId;
            if (!userId)
                return res.sendStatus(401);
            // Convert time string to Date if necessary
            // Assuming window_start_time is "HH:mm"
            let dateObj = new Date();
            if (typeof window_start_time === 'string' && window_start_time.includes(':')) {
                const [hours, minutes] = window_start_time.split(':').map(Number);
                dateObj.setHours(hours, minutes, 0, 0);
            }
            else {
                dateObj = new Date(window_start_time);
            }
            try {
                const action = await db_1.default.action.create({
                    data: {
                        user_id: userId,
                        goal_id: goal_id || null,
                        title,
                        description,
                        frequency_rule,
                        window_start_time: dateObj,
                        window_duration_minutes: parseInt(window_duration_minutes),
                        is_strict: is_strict ?? true,
                    },
                });
                res.status(201).json(action);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Server error' });
            }
        };
        this.getActions = async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                return res.sendStatus(401);
            try {
                const actions = await db_1.default.action.findMany({
                    where: { user_id: userId },
                    include: { goal: true }, // Include related goal details
                    orderBy: { created_at: 'desc' },
                });
                res.json(actions);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ message: 'Server error' });
            }
        };
    }
};
exports.ActionController = ActionController;
exports.ActionController = ActionController = __decorate([
    (0, tsyringe_1.autoInjectable)()
], ActionController);
