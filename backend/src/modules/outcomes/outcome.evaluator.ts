import { singleton, inject } from 'tsyringe';
import prisma from '../../db';
import { Logger } from '../../utils/logger';
import { OutcomeRepository } from './outcome.repository';
import { IndisciplineCalculator } from './indiscipline.calculator';

@singleton()
export class OutcomeEvaluator {
    constructor(
        @inject(OutcomeRepository) private outcomeRepository: OutcomeRepository,
        @inject(IndisciplineCalculator) private indisciplineCalculator: IndisciplineCalculator
    ) { }

    async evaluateUserOutcomes(userId: string) {
        Logger.info(`Evaluating outcomes for user ${userId}`);

        // 1. Fetch recent discipline data
        const scores = await prisma.disciplineScore.findMany({
            where: { user_id: userId },
            orderBy: { date: 'desc' },
            take: 30
        });

        if (scores.length < 7) {
            Logger.info(`Not enough data to evaluate outcomes for user ${userId}`);
            return;
        }

        // Rule 1: High Reliability (Consistent scores > 80 for 7 days)
        const recentScores = scores.slice(0, 7);
        const isReliable = recentScores.every(s => s.score >= 80);

        if (isReliable) {
            await this.ensureOutcomeExists(userId, 'RELIABILITY', 'High Reliability Streak', 'User has maintained >80 system score for 7 days', 'TRUE', 0.9);
        }

        // Rule 2: Compliance (No missed actions in last 3 days)
        const recentInstances = await prisma.actionInstance.findMany({
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

    async ensureOutcomeExists(
        userId: string,
        type: string,
        title: string,
        description: string,
        value: string,
        confidence: number
    ) {
        const existing = await prisma.outcome.findFirst({
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

    async computeBaselineComparison(userId: string) {
        Logger.info(`Computing baseline comparison for user ${userId}`);

        const allScores = await prisma.disciplineScore.findMany({
            where: { user_id: userId },
            orderBy: { date: 'asc' }
        });

        if (allScores.length < 14) {
            Logger.info(`Not enough data for baseline comparison (need 14+ days)`);
            return null;
        }

        const baselinePeriod = allScores.slice(0, 14);
        const currentPeriod = allScores.slice(-14);

        const avg = (arr: any[]) => arr.reduce((sum, item) => sum + item.score, 0) / arr.length;

        const baselineAvg = avg(baselinePeriod);
        const currentAvg = avg(currentPeriod);
        const delta = currentAvg - baselineAvg;

        Logger.info(`Baseline: ${baselineAvg}, Current: ${currentAvg}, Delta: ${delta}`);

        if (delta > 10) {
            const confidence = Math.min(1.0, 0.5 + (allScores.length / 100));

            await this.ensureOutcomeExists(
                userId,
                'PRODUCTIVITY',
                'Discipline Improvement',
                `User improved average discipline score by ${delta.toFixed(1)} points vs baseline.`,
                `+${delta.toFixed(1)}`,
                confidence
            );

            return { baselineAvg, currentAvg, delta, improvement: true };
        }

        return { baselineAvg, currentAvg, delta, improvement: false };
    }

    async getValueRealizationData(userId: string) {
        // 1. Discipline Trend
        const scores = await prisma.disciplineScore.findMany({
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
}
