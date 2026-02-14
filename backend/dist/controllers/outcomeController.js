"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getValueDashboard = exports.estimateCost = exports.getCSVReport = exports.getOrgSummary = exports.getTeamOutcomes = exports.triggerBaselineComparison = exports.triggerEvaluation = exports.getUserOutcomes = void 0;
const outcomeService_1 = require("../services/outcomeService");
const getUserOutcomes = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const outcomes = await outcomeService_1.OutcomeService.getOutcomesForUser(userId);
        res.json(outcomes);
    }
    catch (error) {
        console.error('Error fetching outcomes:', error);
        res.status(500).json({ error: 'Failed to fetch outcomes' });
    }
};
exports.getUserOutcomes = getUserOutcomes;
const triggerEvaluation = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        await outcomeService_1.OutcomeService.evaluateUserOutcomes(userId);
        res.json({ message: 'Evaluation triggered successfully' });
    }
    catch (error) {
        console.error('Error triggering evaluation:', error);
        res.status(500).json({ error: 'Failed to trigger evaluation' });
    }
};
exports.triggerEvaluation = triggerEvaluation;
const triggerBaselineComparison = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const result = await outcomeService_1.OutcomeService.computeBaselineComparison(userId);
        res.json({ message: 'Baseline comparison computed', result });
    }
    catch (error) {
        console.error('Error computing baseline:', error);
        res.status(500).json({ error: 'Failed to compute baseline' });
    }
};
exports.triggerBaselineComparison = triggerBaselineComparison;
const getTeamOutcomes = async (req, res) => {
    try {
        const teamId = req.params.teamId;
        if (!teamId) {
            res.status(400).json({ error: 'Team ID is required' });
            return;
        }
        const outcomes = await outcomeService_1.OutcomeService.getOutcomesForTeam(teamId);
        res.json(outcomes);
    }
    catch (error) {
        console.error('Error fetching team outcomes:', error);
        res.status(500).json({ error: 'Failed to fetch team outcomes' });
    }
};
exports.getTeamOutcomes = getTeamOutcomes;
const getOrgSummary = async (req, res) => {
    try {
        const summary = await outcomeService_1.OutcomeService.getOrgOutcomeSummary();
        res.json(summary);
    }
    catch (error) {
        console.error('Error fetching org summary:', error);
        res.status(500).json({ error: 'Failed to fetch org summary' });
    }
};
exports.getOrgSummary = getOrgSummary;
const getCSVReport = async (req, res) => {
    try {
        const csv = await outcomeService_1.OutcomeService.generateCSVReport();
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="outcomes_report.csv"');
        res.send(csv);
    }
    catch (error) {
        console.error('Error generating CSV report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};
exports.getCSVReport = getCSVReport;
const estimateCost = async (req, res) => {
    try {
        const userId = req.params.userId;
        const hourlyRate = req.body.hourlyRate ? parseFloat(req.body.hourlyRate) : 50;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const estimation = await outcomeService_1.OutcomeService.estimateCostOfIndiscipline(userId, hourlyRate);
        res.json(estimation);
    }
    catch (error) {
        console.error('Error estimating cost:', error);
        res.status(500).json({ error: 'Failed to estimate cost' });
    }
};
exports.estimateCost = estimateCost;
const getValueDashboard = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const data = await outcomeService_1.OutcomeService.getValueRealizationData(userId);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching value dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch value dashboard' });
    }
};
exports.getValueDashboard = getValueDashboard;
