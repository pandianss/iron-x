"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrajectoryService = void 0;
const db_1 = __importDefault(require("../db"));
exports.TrajectoryService = {
    /**
     * Calculates and updates the user's discipline classification.
     * Rules:
     * - UNRELIABLE: Score < 50
     * - RECOVERING: Score >= 50 AND < 80
     * - STABLE: Score >= 80 AND < 95
     * - HIGH_RELIABILITY: Score >= 95
     */
    async calculateClassification(userId) {
        const user = await db_1.default.user.findUnique({
            where: { user_id: userId },
            select: { current_discipline_score: true }
        });
        if (!user)
            return 'UNRELIABLE';
        const score = user.current_discipline_score;
        if (score >= 95)
            return 'HIGH_RELIABILITY';
        if (score >= 80)
            return 'STABLE';
        if (score >= 50)
            return 'RECOVERING';
        return 'UNRELIABLE';
    },
    async updateClassification(userId) {
        const newClass = await this.calculateClassification(userId);
        const user = await db_1.default.user.findUnique({
            where: { user_id: userId },
            select: { discipline_classification: true, classification_last_updated: true }
        });
        if (!user)
            return;
        if (user.discipline_classification !== newClass) {
            await db_1.default.user.update({
                where: { user_id: userId },
                data: {
                    discipline_classification: newClass,
                    classification_last_updated: new Date()
                }
            });
        }
    },
    /**
     * Returns identity data for the card.
     */
    async getIdentityData(userId) {
        const user = await db_1.default.user.findUnique({
            where: { user_id: userId },
            select: {
                current_discipline_score: true,
                discipline_classification: true,
                classification_last_updated: true
            }
        });
        if (!user)
            throw new Error('User not found');
        const daysAtCurrent = Math.floor((new Date().getTime() - new Date(user.classification_last_updated).getTime()) / (1000 * 60 * 60 * 24));
        // Next threshold
        let nextThreshold = 0;
        const score = user.current_discipline_score;
        if (score < 50)
            nextThreshold = 50;
        else if (score < 80)
            nextThreshold = 80;
        else if (score < 95)
            nextThreshold = 95;
        else
            nextThreshold = 100; // Maxed out
        // Reduced Supervision Check (Simple Mock for now, real logic would query HabitStates)
        const supervisionMode = score >= 80 ? 'LOW_SUPERVISION' : 'NORMAL_SUPERVISION';
        return {
            score: user.current_discipline_score,
            classification: user.discipline_classification,
            daysAtCurrent,
            nextThreshold,
            supervisionMode
        };
    },
    /**
     * Get trajectory history (30/60/90 days).
     */
    async getTrajectory(userId, days = 30) {
        const now = new Date();
        const past = new Date();
        past.setDate(now.getDate() - days);
        const history = await db_1.default.disciplineScore.findMany({
            where: {
                user_id: userId,
                date: { gte: past }
            },
            orderBy: { date: 'asc' }
        });
        // Get annotated events (misses, etc.)
        const events = await db_1.default.actionInstance.findMany({
            where: {
                user_id: userId,
                scheduled_date: { gte: past },
                status: 'MISSED'
            },
            select: {
                scheduled_date: true,
                action: { select: { title: true } }
            }
        });
        return {
            history,
            events: events.map(e => ({
                date: e.scheduled_date,
                type: 'MISS',
                cause: `Missed: ${e.action?.title}`
            }))
        };
    },
    /**
     * Projects the user's score 7 days into the future based on current behavior.
     * Naive projection: assumes current "miss rate" continues.
     */
    async getProjectedScore(userId) {
        // 1. Get last 7 days of data
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        const instances = await db_1.default.actionInstance.findMany({
            where: {
                user_id: userId,
                scheduled_date: { gte: weekAgo }
            },
            select: { status: true }
        });
        if (instances.length === 0)
            return { projectedScore: 50, trend: 'FLAT' };
        const misses = instances.filter(i => i.status === 'MISSED').length;
        // Simple penalty model: -5 per miss, +1 per day of perfect execution?
        // Let's reuse a simplified version of ScoreCalculator logic:
        // Current score - (misses * 5) + (days_perfect * 1)
        // This is a rough heuristic for projection.
        const user = await db_1.default.user.findUnique({
            where: { user_id: userId },
            select: { current_discipline_score: true }
        });
        const currentScore = user?.current_discipline_score || 50;
        // Extrapolate: If they miss at the same rate next week...
        // misses per week = current misses 
        const projectedChange = -(misses * 2); // Assume -2 score impact per miss roughly
        let projectedScore = currentScore + projectedChange;
        if (projectedScore > 100)
            projectedScore = 100;
        if (projectedScore < 0)
            projectedScore = 0;
        const trend = projectedChange > 0 ? 'UP' : (projectedChange < 0 ? 'DOWN' : 'FLAT');
        return { projectedScore, trend };
    },
    /**
     * Get tomorrow's preview and Risk Analysis.
     */
    async getTomorrowPreview(userId) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const nextDayEnd = new Date(tomorrow);
        nextDayEnd.setHours(23, 59, 59, 999);
        const instances = await db_1.default.actionInstance.count({
            where: {
                user_id: userId,
                scheduled_date: {
                    gte: tomorrow,
                    lte: nextDayEnd
                }
            }
        });
        // Determine Window Tightness / Risk
        let risk = 'Low Risk';
        let warning = '';
        if (instances > 8) {
            risk = 'High Risk';
            warning = 'Heavy load detected. High chance of failure due to fatigue.';
        }
        else if (instances > 5) {
            risk = 'Medium Risk';
            warning = 'Moderate load. Ensure breaks between actions.';
        }
        return {
            scheduledCount: instances,
            riskLevel: risk,
            warning,
            date: tomorrow
        };
    },
    /**
     * Generates anticipatory warnings about status changes.
     */
    async getAnticipatoryWarnings(userId) {
        const user = await db_1.default.user.findUnique({
            where: { user_id: userId },
            select: { current_discipline_score: true, discipline_classification: true }
        });
        if (!user)
            return [];
        const warnings = [];
        const score = user.current_discipline_score;
        // Warning thresholds (buffer zones)
        if (score > 50 && score < 55) {
            warnings.push({
                type: 'STATUS_RISK',
                severity: 'HIGH',
                message: 'Danger Zone: You are 1-2 misses away from dropping to UNRELIABLE.'
            });
        }
        if (score > 80 && score < 85) {
            warnings.push({
                type: 'STATUS_RISK',
                severity: 'MEDIUM',
                message: 'Warning: You are close to losing STABLE status.'
            });
        }
        return warnings;
    },
    async getWeeklyReport(userId) {
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        const instances = await db_1.default.actionInstance.findMany({
            where: {
                user_id: userId,
                scheduled_date: { gte: weekAgo }
            },
            select: {
                status: true,
                scheduled_start_time: true
            }
        });
        const total = instances.length;
        const missed = instances.filter(i => i.status === 'MISSED').length;
        const executed = instances.filter(i => i.status === 'COMPLETED' || i.status === 'LATE').length;
        // Score Delta (Mock for now, would need snapshot)
        const scoreDelta = 0;
        // Pattern Insight
        let insight = "No specific pattern detected.";
        if (missed > 0) {
            // Check time of day
            const morningMisses = instances.filter(i => i.status === 'MISSED' && new Date(i.scheduled_start_time).getHours() < 12).length;
            if (morningMisses > missed / 2) {
                insight = "Most misses occurred in the morning (before 12 PM).";
            }
        }
        return {
            period: { start: weekAgo, end: now },
            total,
            executed,
            missed,
            scoreDelta,
            insight
        };
    }
};
