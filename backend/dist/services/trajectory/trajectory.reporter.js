"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trajectoryReporter = void 0;
const db_1 = __importDefault(require("../../db"));
exports.trajectoryReporter = {
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
        // Reduced Supervision Check
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
        // Score Delta (Mock for now)
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
