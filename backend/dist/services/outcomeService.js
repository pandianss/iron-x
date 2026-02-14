"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OutcomeService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
exports.OutcomeService = {
    async createOutcome(data) {
        const { linked_instance_ids, ...outcomeData } = data;
        // Default valid_from to now if not provided
        const validFrom = outcomeData.valid_from || new Date();
        const outcome = await prisma.outcome.create({
            data: {
                ...outcomeData,
                valid_from: validFrom,
                linked_actions: linked_instance_ids && linked_instance_ids.length > 0 ? {
                    create: linked_instance_ids.map(id => ({
                        instance: { connect: { instance_id: id } }
                    }))
                } : undefined
            },
            include: {
                linked_actions: true
            }
        });
        console.log(`Created outcome ${outcome.outcome_id} for user ${data.user_id || 'system'}`);
        return outcome;
    },
    async getOutcomesForUser(userId) {
        return prisma.outcome.findMany({
            where: { user_id: userId },
            orderBy: { valid_from: 'desc' },
            include: { linked_actions: true }
        });
    },
    async getOutcomesForTeam(teamId) {
        return prisma.outcome.findMany({
            where: { team_id: teamId }, // Direct team outcomes
            orderBy: { valid_from: 'desc' },
            include: { linked_actions: true }
        });
    },
    async getOrgOutcomeSummary() {
        const totalOutcomes = await prisma.outcome.count();
        const productivityCount = await prisma.outcome.count({ where: { type: 'PRODUCTIVITY' } });
        const reliabilityCount = await prisma.outcome.count({ where: { type: 'RELIABILITY' } });
        const complianceCount = await prisma.outcome.count({ where: { type: 'COMPLIANCE' } });
        const recentOutcomes = await prisma.outcome.findMany({
            take: 10,
            orderBy: { calculated_at: 'desc' },
            include: { user: { select: { email: true } } }
        });
        return {
            total: totalOutcomes,
            breakdown: {
                productivity: productivityCount,
                reliability: reliabilityCount,
                compliance: complianceCount
            },
            recent: recentOutcomes
        };
    },
    async generateCSVReport() {
        const outcomes = await prisma.outcome.findMany({
            orderBy: { calculated_at: 'desc' },
            include: { user: { select: { email: true } } }
        });
        const header = 'Outcome ID,User,Type,Title,Value,Confidence,Date\n';
        const rows = outcomes.map(o => `${o.outcome_id},${o.user?.email || 'System'},${o.type},"${o.title}",${o.value},${o.confidence_score},${o.calculated_at.toISOString()}`).join('\n');
        return header + rows;
    },
    async estimateCostOfIndiscipline(userId, hourlyRate = 50) {
        console.log(`Estimating cost for user ${userId} at rate ${hourlyRate}`);
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        // 1. Missed Actions
        const missedActions = await prisma.actionInstance.count({
            where: {
                user_id: userId,
                status: 'MISSED',
                scheduled_date: { gte: thirtyDaysAgo }
            }
        });
        // 2. Execution Lag (Late actions)
        // Note: checking 'COMPLETED' status only, assuming we track executed_at
        const completedActions = await prisma.actionInstance.findMany({
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
        // Assumptions:
        // - Each missed action costs 15 minutes of "re-planning" or "momentum loss"
        // - Lag is direct time cost
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
    },
    async getValueRealizationData(userId) {
        // 1. Discipline Trend (Last 30 days)
        const scores = await prisma.disciplineScore.findMany({
            where: { user_id: userId },
            orderBy: { date: 'asc' },
            take: 30
        });
        // 2. Outcomes Achieved
        const outcomes = await prisma.outcome.findMany({
            where: { user_id: userId },
            orderBy: { valid_from: 'desc' }
        });
        // 3. Cost Savings (Hypothetical: if current score > baseline, estimate savings)
        // For now, just return the cost of indiscipline as a "Risk" metric
        const costRisk = await this.estimateCostOfIndiscipline(userId);
        return {
            disciplineTrend: scores.map(s => ({ date: s.date, score: s.score })),
            outcomesAchieved: outcomes,
            economicRisk: costRisk
        };
    },
    // Rule Evaluation Logic
    async evaluateUserOutcomes(userId) {
        console.log(`Evaluating outcomes for user ${userId}`);
        // 1. Fetch recent discipline data
        const scores = await prisma.disciplineScore.findMany({
            where: { user_id: userId },
            orderBy: { date: 'desc' },
            take: 30
        });
        if (scores.length < 7) {
            console.log(`Not enough data to evaluate outcomes for user ${userId}`);
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
    },
    async ensureOutcomeExists(userId, type, title, description, value, confidence) {
        // Check if a similar outcome exists recently (e.g. today) to avoid duplicates
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
            await this.createOutcome({
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
    },
    async computeBaselineComparison(userId) {
        console.log(`Computing baseline comparison for user ${userId}`);
        // 1. Fetch all discipline scores sorted by date
        const allScores = await prisma.disciplineScore.findMany({
            where: { user_id: userId },
            orderBy: { date: 'asc' }
        });
        if (allScores.length < 14) {
            console.log(`Not enough data for baseline comparison (need 14+ days)`);
            return null;
        }
        // 2. Define Baseline (First 14 days) vs Current (Last 14 days)
        const baselinePeriod = allScores.slice(0, 14);
        const currentPeriod = allScores.slice(-14);
        const avg = (arr) => arr.reduce((sum, item) => sum + item.score, 0) / arr.length;
        const baselineAvg = avg(baselinePeriod);
        const currentAvg = avg(currentPeriod);
        const delta = currentAvg - baselineAvg;
        console.log(`Baseline: ${baselineAvg}, Current: ${currentAvg}, Delta: ${delta}`);
        // 3. Generate Outcome if improvement is significant (> 10 points)
        if (delta > 10) {
            const confidence = Math.min(1.0, 0.5 + (allScores.length / 100)); // More data = higher confidence
            await this.ensureOutcomeExists(userId, 'PRODUCTIVITY', 'Discipline Improvement', `User improved average discipline score by ${delta.toFixed(1)} points vs baseline.`, `+${delta.toFixed(1)}`, confidence);
            return { baselineAvg, currentAvg, delta, improvement: true };
        }
        return { baselineAvg, currentAvg, delta, improvement: false };
    }
};
