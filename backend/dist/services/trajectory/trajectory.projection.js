"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trajectoryProjection = void 0;
const db_1 = __importDefault(require("../../db"));
exports.trajectoryProjection = {
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
        const user = await db_1.default.user.findUnique({
            where: { user_id: userId },
            select: { current_discipline_score: true }
        });
        const currentScore = user?.current_discipline_score || 50;
        // Extrapolate: If they miss at the same rate next week...
        const projectedChange = -(misses * 2);
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
    }
};
