
import { DisciplineContext } from './domain/types';
import { domainEvents, DomainEventType } from './domain/events';
import { ScoringPolicy } from './policies/ScoringPolicy';

export class ScoreCalculator {
    async compute(context: DisciplineContext): Promise<number> {
        const { userId, instances, user } = context;

        // Pure calculation
        const score = ScoringPolicy.calculateScore(instances);

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
