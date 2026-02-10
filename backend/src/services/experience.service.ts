import prisma from '../db';
import { calculateUserScore } from '../jobs/calculateScore';

export type DisciplineClassification = 'UNRELIABLE' | 'RECOVERING' | 'STABLE' | 'HIGH_RELIABILITY';

export const ExperienceService = {
    /**
     * Calculates and updates the user's discipline classification.
     * Rules:
     * - UNRELIABLE: Score < 50
     * - RECOVERING: Score >= 50 AND < 80
     * - STABLE: Score >= 80 AND < 95
     * - HIGH_RELIABILITY: Score >= 95
     * 
     * Hysteresis/Stability:
     * - To upgrade: Must hold score for X days? (Simpler for now: Instant based on current score, 
     *   but "Days at current classification" will handle the stability aspect visually).
     * - Actually, let's just derive it from the score for now to be deterministic as per specs.
     */
    async calculateClassification(userId: string): Promise<DisciplineClassification> {
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            select: { current_discipline_score: true }
        });

        if (!user) return 'UNRELIABLE';

        const score = user.current_discipline_score;

        if (score >= 95) return 'HIGH_RELIABILITY';
        if (score >= 80) return 'STABLE';
        if (score >= 50) return 'RECOVERING';
        return 'UNRELIABLE';
    },

    async updateClassification(userId: string) {
        const newClass = await this.calculateClassification(userId);
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            select: { discipline_classification: true, classification_last_updated: true }
        });

        if (!user) return;

        if (user.discipline_classification !== newClass) {
            await prisma.user.update({
                where: { user_id: userId },
                data: {
                    discipline_classification: newClass,
                    classification_last_updated: new Date()
                }
            });
            // We could log this to audit log if needed
        }
    },

    /**
     * Returns identity data for the card.
     */
    async getIdentityData(userId: string) {
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            select: {
                current_discipline_score: true,
                discipline_classification: true,
                classification_last_updated: true
            }
        });

        if (!user) throw new Error('User not found');

        const daysAtCurrent = Math.floor((new Date().getTime() - new Date(user.classification_last_updated).getTime()) / (1000 * 60 * 60 * 24));

        // Next threshold
        let nextThreshold = 0;
        const score = user.current_discipline_score;
        if (score < 50) nextThreshold = 50;
        else if (score < 80) nextThreshold = 80;
        else if (score < 95) nextThreshold = 95;
        else nextThreshold = 100; // Maxed out

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
    async getTrajectory(userId: string, days: number = 30) {
        const now = new Date();
        const past = new Date();
        past.setDate(now.getDate() - days);

        const history = await prisma.disciplineScore.findMany({
            where: {
                user_id: userId,
                date: { gte: past }
            },
            orderBy: { date: 'asc' }
        });

        // Get annotated events (misses, etc.)
        const events = await prisma.actionInstance.findMany({
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
     * Get tomorrow's preview.
     */
    async getTomorrowPreview(userId: string) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const nextDayEnd = new Date(tomorrow);
        nextDayEnd.setHours(23, 59, 59, 999);

        const instances = await prisma.actionInstance.count({
            where: {
                user_id: userId,
                scheduled_date: {
                    gte: tomorrow,
                    lte: nextDayEnd
                }
            }
        });

        // Determine Window Tightness / Risk
        // Simple heuristic for now: > 5 actions = High, > 2 = Medium, else Low
        let risk = 'Low Risk';
        if (instances > 5) risk = 'High Risk';
        else if (instances > 2) risk = 'Medium Risk';

        return {
            scheduledCount: instances,
            riskLevel: risk,
            date: tomorrow
        };
    },
    async getWeeklyReport(userId: string) {
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);

        const instances = await prisma.actionInstance.findMany({
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
