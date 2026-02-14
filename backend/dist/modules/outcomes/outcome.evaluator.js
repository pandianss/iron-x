"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutcomeEvaluator = void 0;
const tsyringe_1 = require("tsyringe");
const db_1 = __importDefault(require("../../db"));
const logger_1 = require("../../utils/logger");
const outcome_repository_1 = require("./outcome.repository");
const indiscipline_calculator_1 = require("./indiscipline.calculator");
let OutcomeEvaluator = class OutcomeEvaluator {
    constructor(outcomeRepository, indisciplineCalculator) {
        this.outcomeRepository = outcomeRepository;
        this.indisciplineCalculator = indisciplineCalculator;
    }
    async evaluateUserOutcomes(userId) {
        logger_1.Logger.info(`Evaluating outcomes for user ${userId}`);
        // 1. Fetch recent discipline data
        const scores = await db_1.default.disciplineScore.findMany({
            where: { user_id: userId },
            orderBy: { date: 'desc' },
            take: 30
        });
        if (scores.length < 7) {
            logger_1.Logger.info(`Not enough data to evaluate outcomes for user ${userId}`);
            return;
        }
        // Rule 1: High Reliability (Consistent scores > 80 for 7 days)
        const recentScores = scores.slice(0, 7);
        const isReliable = recentScores.every(s => s.score >= 80);
        if (isReliable) {
            await this.ensureOutcomeExists(userId, 'RELIABILITY', 'High Reliability Streak', 'User has maintained >80 system score for 7 days', 'TRUE', 0.9);
        }
        // Rule 2: Compliance (No missed actions in last 3 days)
        const recentInstances = await db_1.default.actionInstance.findMany({
            where: {
                user_id: userId,
                scheduled_date: {
                    gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
                }
            }
        });
        const missedCount = recentInstances.filter(i => i.status === 'MISSED').length;
        if (missedCount === 0 && recentInstances.length > 0) {
            await this.ensureOutcomeExists(userId, 'COMPLIANCE', 'Full Compliance', 'Zero missed actions in last 3 days', 'TRUE', 0.85);
        }
    }
    async ensureOutcomeExists(userId, type, title, description, value, confidence) {
        const existing = await db_1.default.outcome.findFirst({
            where: {
                user_id: userId,
                type: type,
                title: title,
                calculated_at: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
            }
        });
        if (!existing) {
            await this.outcomeRepository.createOutcome({
                user_id: userId,
                title,
                description,
                type,
                source: 'SYSTEM_DERIVED',
                value,
                confidence_score: confidence,
                valid_from: new Date()
            });
        }
    }
    async computeBaselineComparison(userId) {
        logger_1.Logger.info(`Computing baseline comparison for user ${userId}`);
        const allScores = await db_1.default.disciplineScore.findMany({
            where: { user_id: userId },
            orderBy: { date: 'asc' }
        });
        if (allScores.length < 14) {
            logger_1.Logger.info(`Not enough data for baseline comparison (need 14+ days)`);
            return null;
        }
        const baselinePeriod = allScores.slice(0, 14);
        const currentPeriod = allScores.slice(-14);
        const avg = (arr) => arr.reduce((sum, item) => sum + item.score, 0) / arr.length;
        const baselineAvg = avg(baselinePeriod);
        const currentAvg = avg(currentPeriod);
        const delta = currentAvg - baselineAvg;
        logger_1.Logger.info(`Baseline: ${baselineAvg}, Current: ${currentAvg}, Delta: ${delta}`);
        if (delta > 10) {
            const confidence = Math.min(1.0, 0.5 + (allScores.length / 100));
            await this.ensureOutcomeExists(userId, 'PRODUCTIVITY', 'Discipline Improvement', `User improved average discipline score by ${delta.toFixed(1)} points vs baseline.`, `+${delta.toFixed(1)}`, confidence);
            return { baselineAvg, currentAvg, delta, improvement: true };
        }
        return { baselineAvg, currentAvg, delta, improvement: false };
    }
    async getValueRealizationData(userId) {
        // 1. Discipline Trend
        const scores = await db_1.default.disciplineScore.findMany({
            where: { user_id: userId },
            orderBy: { date: 'asc' },
            take: 30
        });
        // 2. Outcomes Achieved
        const outcomes = await this.outcomeRepository.getOutcomesForUser(userId);
        // 3. Cost Savings
        const costRisk = await this.indisciplineCalculator.estimateCostOfIndiscipline(userId);
        return {
            disciplineTrend: scores.map(s => ({ date: s.date, score: s.score })),
            outcomesAchieved: outcomes,
            economicRisk: costRisk
        };
    }
};
exports.OutcomeEvaluator = OutcomeEvaluator;
exports.OutcomeEvaluator = OutcomeEvaluator = __decorate([
    (0, tsyringe_1.singleton)(),
    __param(0, (0, tsyringe_1.inject)(outcome_repository_1.OutcomeRepository)),
    __param(1, (0, tsyringe_1.inject)(indiscipline_calculator_1.IndisciplineCalculator)),
    __metadata("design:paramtypes", [outcome_repository_1.OutcomeRepository,
        indiscipline_calculator_1.IndisciplineCalculator])
], OutcomeEvaluator);
