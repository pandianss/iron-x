
import { DisciplineContext } from './domain/types';
import { domainEvents, DomainEventType } from './domain/events';

export class ScoreCalculator {
    async compute(context: DisciplineContext): Promise<number> {
        const { userId, instances, user } = context;

        if (instances.length === 0) return 50; // Neutral start

        const completed = instances.filter(i => i.status === 'COMPLETED').length;
        const total = instances.filter(i => i.status !== 'PENDING').length;

        if (total === 0) return 50;

        const rate = completed / total;
        const score = Math.round(rate * 100);

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
