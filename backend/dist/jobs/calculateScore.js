"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDisciplineScore = void 0;
const db_1 = __importDefault(require("../db"));
const calculateDisciplineScore = async () => {
    console.log('Running calculateDisciplineScore job...');
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    try {
        const users = await db_1.default.user.findMany();
        for (const user of users) {
            // Fetch stats for last 7 days (inclusive of today? Spec says "trailing 7 days". Usually means last 7 completed days or including today. Let's include today if it's running at 23:59).
            // Trigger is 23:59 local. So include today.
            const instances = await db_1.default.actionInstance.findMany({
                where: {
                    user_id: user.user_id,
                    scheduled_date: {
                        gte: sevenDaysAgo,
                        lte: today
                    },
                    status: {
                        in: ['COMPLETED', 'LATE', 'MISSED'] // Ignore PENDING as they should be resolved by resolving job if window passed, or they are future. But at 23:59 all pending for today should be missed.
                    }
                }
            });
            if (instances.length === 0) {
                // No scheduled actions, score? Maintain previous or set to 0?
                // Or maybe 100 if perfect discipline of doing nothing?
                // Let's bias towards 0 or neutral if no data. Spec doesn't say.
                // Let's skip update if no data.
                continue;
            }
            let totalScheduled = instances.length;
            let totalExecuted = instances.filter(i => i.status === 'COMPLETED' || i.status === 'LATE').length;
            let totalOnTime = instances.filter(i => i.status === 'COMPLETED').length;
            let executionRate = totalScheduled > 0 ? totalExecuted / totalScheduled : 0;
            let onTimeRate = totalExecuted > 0 ? totalOnTime / totalExecuted : 0;
            let rawScore = (executionRate * 0.7) + (onTimeRate * 0.3);
            let score = Math.round(rawScore * 100);
            // Clamp just in case
            score = Math.max(0, Math.min(100, score));
            // Persist
            await db_1.default.disciplineScore.upsert({
                where: {
                    user_id_date: {
                        user_id: user.user_id,
                        date: today
                    }
                },
                update: {
                    score: score,
                    execution_rate: executionRate, // decimal
                    on_time_rate: onTimeRate, // decimal
                    calculated_at: now
                },
                create: {
                    user_id: user.user_id,
                    date: today,
                    score: score,
                    execution_rate: executionRate,
                    on_time_rate: onTimeRate
                }
            });
            // Update User current score
            await db_1.default.user.update({
                where: { user_id: user.user_id },
                data: { current_discipline_score: score }
            });
            console.log(`Updated score for user ${user.email}: ${score}`);
        }
    }
    catch (error) {
        console.error('Error calculating discipline scores', error);
    }
};
exports.calculateDisciplineScore = calculateDisciplineScore;
