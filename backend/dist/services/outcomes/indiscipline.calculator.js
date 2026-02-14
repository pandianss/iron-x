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
exports.IndisciplineCalculator = void 0;
const tsyringe_1 = require("tsyringe");
const db_1 = __importDefault(require("../../db"));
const logger_1 = require("../../utils/logger");
let IndisciplineCalculator = class IndisciplineCalculator {
    async estimateCostOfIndiscipline(userId, hourlyRate = 50) {
        logger_1.logger.info(`Estimating cost for user ${userId} at rate ${hourlyRate}`);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        // 1. Missed Actions
        const missedActions = await db_1.default.actionInstance.count({
            where: {
                user_id: userId,
                status: 'MISSED',
                scheduled_date: { gte: thirtyDaysAgo }
            }
        });
        // 2. Execution Lag (Late actions)
        const completedActions = await db_1.default.actionInstance.findMany({
            where: {
                user_id: userId,
                status: 'COMPLETED',
                executed_at: { not: null },
                scheduled_date: { gte: thirtyDaysAgo }
            },
            select: {
                scheduled_start_time: true,
                executed_at: true
            }
        });
        let totalLagMinutes = 0;
        for (const action of completedActions) {
            if (action.executed_at && action.executed_at > action.scheduled_start_time) {
                const diff = (action.executed_at.getTime() - action.scheduled_start_time.getTime()) / (1000 * 60);
                totalLagMinutes += diff;
            }
        }
        const missedActionCostTime = missedActions * 15;
        const totalTimeLostMinutes = totalLagMinutes + missedActionCostTime;
        const estimatedCost = (totalTimeLostMinutes / 60) * hourlyRate;
        return {
            hourlyRate,
            missedActions,
            missedActionCostTime,
            totalLagMinutes,
            totalTimeLostMinutes,
            estimatedCost: parseFloat(estimatedCost.toFixed(2)),
            currency: 'USD',
            disclaimer: 'This is an estimate based on missed actions and execution lag. Not binding.'
        };
    }
};
exports.IndisciplineCalculator = IndisciplineCalculator;
exports.IndisciplineCalculator = IndisciplineCalculator = __decorate([
    (0, tsyringe_1.singleton)()
], IndisciplineCalculator);
