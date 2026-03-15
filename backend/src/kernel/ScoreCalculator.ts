import { DisciplineContext } from './domain/types';
import { domainEvents, DomainEventType } from './domain/events';
import { ScoringEngine } from '../domain/discipline/ScoringEngine';
import prisma from '../infrastructure/db';

export class ScoreCalculator {
    async compute(context: DisciplineContext): Promise<number> {
        const { userId, instances, user } = context;

        // Pure calculation
        const score = ScoringEngine.calculateScore(instances as any);

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

        // Persist score
        const now = new Date();
        const dateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let executionRate = 0;
        let onTimeRate = 0;

        if (instances && instances.length > 0) {
            const total = instances.filter(i => i.status !== 'PENDING').length;
            if (total > 0) {
                const completed = instances.filter(i => i.status === 'COMPLETED').length;
                executionRate = completed / total;

                // Compute on-time rate: COMPLETED before or at scheduled_end_time
                const completedOnTime = instances.filter(i => {
                    if (i.status !== 'COMPLETED') return false;
                    if (!i.executed_at || !i.scheduled_end_time) return true; // no timing data → assume on time
                    return new Date(i.executed_at) <= new Date(i.scheduled_end_time);
                }).length;
                onTimeRate = completedOnTime / total;
            }
        }

        await prisma.disciplineScore.upsert({
            where: {
                user_id_date: {
                    user_id: userId,
                    date: dateOnly
                }
            },
            update: {
                score,
                execution_rate: executionRate,
                on_time_rate: onTimeRate,
                calculated_at: now
            },
            create: {
                user_id: userId,
                date: dateOnly,
                score,
                execution_rate: executionRate,
                on_time_rate: onTimeRate,
                calculated_at: now
            }
        });

        await prisma.user.update({
            where: { user_id: userId },
            data: { current_discipline_score: score }
        });

        return score;
    }
}
