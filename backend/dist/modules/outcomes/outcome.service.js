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
Object.defineProperty(exports, "__esModule", { value: true });
exports.outcomeService = exports.OutcomeService = void 0;
const tsyringe_1 = require("tsyringe");
const tsyringe_2 = require("tsyringe");
const outcome_repository_1 = require("./outcome.repository");
const outcome_stats_1 = require("./outcome.stats");
const outcome_evaluator_1 = require("./outcome.evaluator");
const indiscipline_calculator_1 = require("./indiscipline.calculator");
let OutcomeService = class OutcomeService {
    constructor(repository, stats, evaluator, calculator) {
        this.repository = repository;
        this.stats = stats;
        this.evaluator = evaluator;
        this.calculator = calculator;
    }
    // Proxy methods to maintain API compatibility during transition, 
    // or expose public members directly if preferred.
    // For this refactor, we expose the sub-services or wrap them.
    // To match the previous 'OutcomeService.getOutcomesForUser' signature:
    async getOutcomesForUser(userId) { return this.repository.getOutcomesForUser(userId); }
    async getOutcomesForTeam(teamId) { return this.repository.getOutcomesForTeam(teamId); }
    async createOutcome(data) { return this.repository.createOutcome(data); }
    async getOrgOutcomeSummary() { return this.stats.getOrgOutcomeSummary(); }
    async generateCSVReport() { return this.stats.generateCSVReport(); }
    async estimateCostOfIndiscipline(userId, rate) { return this.calculator.estimateCostOfIndiscipline(userId, rate); }
    async evaluateUserOutcomes(userId) { return this.evaluator.evaluateUserOutcomes(userId); }
    async computeBaselineComparison(userId) { return this.evaluator.computeBaselineComparison(userId); }
    async getValueRealizationData(userId) { return this.evaluator.getValueRealizationData(userId); }
};
exports.OutcomeService = OutcomeService;
exports.OutcomeService = OutcomeService = __decorate([
    (0, tsyringe_2.singleton)(),
    __param(0, (0, tsyringe_2.inject)(outcome_repository_1.OutcomeRepository)),
    __param(1, (0, tsyringe_2.inject)(outcome_stats_1.OutcomeStats)),
    __param(2, (0, tsyringe_2.inject)(outcome_evaluator_1.OutcomeEvaluator)),
    __param(3, (0, tsyringe_2.inject)(indiscipline_calculator_1.IndisciplineCalculator)),
    __metadata("design:paramtypes", [outcome_repository_1.OutcomeRepository,
        outcome_stats_1.OutcomeStats,
        outcome_evaluator_1.OutcomeEvaluator,
        indiscipline_calculator_1.IndisciplineCalculator])
], OutcomeService);
// Export a singleton instance for backward compatibility with non-DI code (like current controllers)
exports.outcomeService = tsyringe_1.container.resolve(OutcomeService);
