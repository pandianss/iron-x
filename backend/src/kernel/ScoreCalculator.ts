
import prisma from '../db';
import { UserId } from './domain/types';
import { domainEvents, DomainEventType } from './domain/events';

export class ScoreCalculator {
    async compute(userId: UserId): Promise<number> {
        // Simple scoring logic for MVP
        // In real implementation, this would be more complex

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const instances = await prisma.actionInstance.findMany({
            where: {
                user_id: userId,
                scheduled_date: { gte: startOfMonth }
            }
        });

        if (instances.length === 0) return 50; // Neutral start

        const completed = instances.filter((i: { status: string | null }) => i.status === 'COMPLETED').length;
        const total = instances.filter((i: { status: string | null }) => i.status !== 'PENDING').length;

        if (total === 0) return 50;

        const rate = completed / total;
        const score = Math.round(rate * 100);

        // Fetch old score to compare (optional but good for event payload)
        const user = await prisma.user.findUnique({ where: { user_id: userId }, select: { current_discipline_score: true } });
        const oldScore = user?.current_discipline_score || 50;

        if (score !== oldScore) {
            domainEvents.emit(DomainEventType.SCORE_UPDATED, {
                type: DomainEventType.SCORE_UPDATED,
                timestamp: new Date(),
                userId,
                payload: {
                    oldScore,
                    newScore: score,
                    reason: 'DAILY_CALCULATION'
                }
            });
        }

        return score;
    }
}
