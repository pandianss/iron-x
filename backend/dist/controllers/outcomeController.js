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
exports.OutcomeController = void 0;
const tsyringe_1 = require("tsyringe");
const outcomes_1 = require("../services/outcomes");
let OutcomeController = class OutcomeController {
    constructor(outcomeService) {
        this.outcomeService = outcomeService;
        this.getUserOutcomes = async (req, res) => {
            try {
                const userId = req.params.userId;
                if (!userId) {
                    res.status(400).json({ error: 'User ID is required' });
                    return;
                }
                const outcomes = await this.outcomeService.getOutcomesForUser(userId);
                res.json(outcomes);
            }
            catch (error) {
                console.error('Error fetching outcomes:', error);
                res.status(500).json({ error: 'Failed to fetch outcomes' });
            }
        };
        this.triggerEvaluation = async (req, res) => {
            try {
                const userId = req.params.userId;
                if (!userId) {
                    res.status(400).json({ error: 'User ID is required' });
                    return;
                }
                await this.outcomeService.evaluateUserOutcomes(userId);
                res.json({ message: 'Evaluation triggered successfully' });
            }
            catch (error) {
                console.error('Error triggering evaluation:', error);
                res.status(500).json({ error: 'Failed to trigger evaluation' });
            }
        };
        this.triggerBaselineComparison = async (req, res) => {
            try {
                const userId = req.params.userId;
                if (!userId) {
                    res.status(400).json({ error: 'User ID is required' });
                    return;
                }
                const result = await this.outcomeService.computeBaselineComparison(userId);
                res.json({ message: 'Baseline comparison computed', result });
            }
            catch (error) {
                console.error('Error computing baseline:', error);
                res.status(500).json({ error: 'Failed to compute baseline' });
            }
        };
        this.getTeamOutcomes = async (req, res) => {
            try {
                const teamId = req.params.teamId;
                if (!teamId) {
                    res.status(400).json({ error: 'Team ID is required' });
                    return;
                }
                const outcomes = await this.outcomeService.getOutcomesForTeam(teamId);
                res.json(outcomes);
            }
            catch (error) {
                console.error('Error fetching team outcomes:', error);
                res.status(500).json({ error: 'Failed to fetch team outcomes' });
            }
        };
        this.getOrgSummary = async (req, res) => {
            try {
                const summary = await this.outcomeService.getOrgOutcomeSummary();
                res.json(summary);
            }
            catch (error) {
                console.error('Error fetching org summary:', error);
                res.status(500).json({ error: 'Failed to fetch org summary' });
            }
        };
        this.getCSVReport = async (req, res) => {
            try {
                const csv = await this.outcomeService.generateCSVReport();
                res.header('Content-Type', 'text/csv');
                res.header('Content-Disposition', 'attachment; filename="outcomes_report.csv"');
                res.send(csv);
            }
            catch (error) {
                console.error('Error generating CSV report:', error);
                res.status(500).json({ error: 'Failed to generate report' });
            }
        };
        this.estimateCost = async (req, res) => {
            try {
                const userId = req.params.userId;
                const hourlyRate = req.body.hourlyRate ? parseFloat(req.body.hourlyRate) : 50;
                if (!userId) {
                    res.status(400).json({ error: 'User ID is required' });
                    return;
                }
                const estimation = await this.outcomeService.estimateCostOfIndiscipline(userId, hourlyRate);
                res.json(estimation);
            }
            catch (error) {
                console.error('Error estimating cost:', error);
                res.status(500).json({ error: 'Failed to estimate cost' });
            }
        };
        this.getValueDashboard = async (req, res) => {
            try {
                const userId = req.params.userId;
                if (!userId) {
                    res.status(400).json({ error: 'User ID is required' });
                    return;
                }
                const data = await this.outcomeService.getValueRealizationData(userId);
                res.json(data);
            }
            catch (error) {
                console.error('Error fetching value dashboard:', error);
                res.status(500).json({ error: 'Failed to fetch value dashboard' });
            }
        };
    }
};
exports.OutcomeController = OutcomeController;
exports.OutcomeController = OutcomeController = __decorate([
    (0, tsyringe_1.autoInjectable)(),
    __param(0, (0, tsyringe_1.inject)(outcomes_1.OutcomeService)),
    __metadata("design:paramtypes", [outcomes_1.OutcomeService])
], OutcomeController);
