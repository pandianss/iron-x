import { Request, Response } from 'express';
import { OutcomeService } from '../services/outcomeService';

export const getUserOutcomes = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const outcomes = await OutcomeService.getOutcomesForUser(userId);
        res.json(outcomes);
    } catch (error) {
        console.error('Error fetching outcomes:', error);
        res.status(500).json({ error: 'Failed to fetch outcomes' });
    }
};

export const triggerEvaluation = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        await OutcomeService.evaluateUserOutcomes(userId);
        res.json({ message: 'Evaluation triggered successfully' });
    } catch (error) {
        console.error('Error triggering evaluation:', error);
        res.status(500).json({ error: 'Failed to trigger evaluation' });
    }
};

export const triggerBaselineComparison = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const result = await OutcomeService.computeBaselineComparison(userId);
        res.json({ message: 'Baseline comparison computed', result });
    } catch (error) {
        console.error('Error computing baseline:', error);
        res.status(500).json({ error: 'Failed to compute baseline' });
    }
};

export const getTeamOutcomes = async (req: Request, res: Response) => {
    try {
        const teamId = req.params.teamId as string;
        if (!teamId) {
            res.status(400).json({ error: 'Team ID is required' });
            return;
        }
        const outcomes = await OutcomeService.getOutcomesForTeam(teamId);
        res.json(outcomes);
    } catch (error) {
        console.error('Error fetching team outcomes:', error);
        res.status(500).json({ error: 'Failed to fetch team outcomes' });
    }
};

export const getOrgSummary = async (req: Request, res: Response) => {
    try {
        const summary = await OutcomeService.getOrgOutcomeSummary();
        res.json(summary);
    } catch (error) {
        console.error('Error fetching org summary:', error);
        res.status(500).json({ error: 'Failed to fetch org summary' });
    }
};

export const getCSVReport = async (req: Request, res: Response) => {
    try {
        const csv = await OutcomeService.generateCSVReport();
        res.header('Content-Type', 'text/csv');
        res.header('Content-Disposition', 'attachment; filename="outcomes_report.csv"');
        res.send(csv);
    } catch (error) {
        console.error('Error generating CSV report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

export const estimateCost = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        const hourlyRate = req.body.hourlyRate ? parseFloat(req.body.hourlyRate) : 50;

        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }

        const estimation = await OutcomeService.estimateCostOfIndiscipline(userId, hourlyRate);
        res.json(estimation);
    } catch (error) {
        console.error('Error estimating cost:', error);
        res.status(500).json({ error: 'Failed to estimate cost' });
    }
};

export const getValueDashboard = async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId as string;
        if (!userId) {
            res.status(400).json({ error: 'User ID is required' });
            return;
        }
        const data = await OutcomeService.getValueRealizationData(userId);
        res.json(data);
    } catch (error) {
        console.error('Error fetching value dashboard:', error);
        res.status(500).json({ error: 'Failed to fetch value dashboard' });
    }
};
