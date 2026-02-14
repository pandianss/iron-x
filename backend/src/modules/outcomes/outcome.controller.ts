import { Request, Response } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { OutcomeService } from './outcome.service';

@autoInjectable()
export class OutcomeController {
    constructor(
        @inject(OutcomeService) private outcomeService: OutcomeService
    ) { }

    getUserOutcomes = async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId as string;
            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            const outcomes = await this.outcomeService.getOutcomesForUser(userId);
            res.json(outcomes);
        } catch (error) {
            console.error('Error fetching outcomes:', error);
            res.status(500).json({ error: 'Failed to fetch outcomes' });
        }
    };

    triggerEvaluation = async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId as string;
            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            await this.outcomeService.evaluateUserOutcomes(userId);
            res.json({ message: 'Evaluation triggered successfully' });
        } catch (error) {
            console.error('Error triggering evaluation:', error);
            res.status(500).json({ error: 'Failed to trigger evaluation' });
        }
    };

    triggerBaselineComparison = async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId as string;
            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            const result = await this.outcomeService.computeBaselineComparison(userId);
            res.json({ message: 'Baseline comparison computed', result });
        } catch (error) {
            console.error('Error computing baseline:', error);
            res.status(500).json({ error: 'Failed to compute baseline' });
        }
    };

    getTeamOutcomes = async (req: Request, res: Response) => {
        try {
            const teamId = req.params.teamId as string;
            if (!teamId) {
                res.status(400).json({ error: 'Team ID is required' });
                return;
            }
            const outcomes = await this.outcomeService.getOutcomesForTeam(teamId);
            res.json(outcomes);
        } catch (error) {
            console.error('Error fetching team outcomes:', error);
            res.status(500).json({ error: 'Failed to fetch team outcomes' });
        }
    };

    getOrgSummary = async (req: Request, res: Response) => {
        try {
            const summary = await this.outcomeService.getOrgOutcomeSummary();
            res.json(summary);
        } catch (error) {
            console.error('Error fetching org summary:', error);
            res.status(500).json({ error: 'Failed to fetch org summary' });
        }
    };

    getCSVReport = async (req: Request, res: Response) => {
        try {
            const csv = await this.outcomeService.generateCSVReport();
            res.header('Content-Type', 'text/csv');
            res.header('Content-Disposition', 'attachment; filename="outcomes_report.csv"');
            res.send(csv);
        } catch (error) {
            console.error('Error generating CSV report:', error);
            res.status(500).json({ error: 'Failed to generate report' });
        }
    };

    estimateCost = async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId as string;
            const hourlyRate = req.body.hourlyRate ? parseFloat(req.body.hourlyRate) : 50;

            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }

            const estimation = await this.outcomeService.estimateCostOfIndiscipline(userId, hourlyRate);
            res.json(estimation);
        } catch (error) {
            console.error('Error estimating cost:', error);
            res.status(500).json({ error: 'Failed to estimate cost' });
        }
    };

    getValueDashboard = async (req: Request, res: Response) => {
        try {
            const userId = req.params.userId as string;
            if (!userId) {
                res.status(400).json({ error: 'User ID is required' });
                return;
            }
            const data = await this.outcomeService.getValueRealizationData(userId);
            res.json(data);
        } catch (error) {
            console.error('Error fetching value dashboard:', error);
            res.status(500).json({ error: 'Failed to fetch value dashboard' });
        }
    };
}
