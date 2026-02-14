"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoreCalculator = void 0;
const events_1 = require("./domain/events");
class ScoreCalculator {
    async compute(context) {
        const { userId, instances, user } = context;
        if (instances.length === 0)
            return 50; // Neutral start
        const completed = instances.filter(i => i.status === 'COMPLETED').length;
        const total = instances.filter(i => i.status !== 'PENDING').length;
        if (total === 0)
            return 50;
        const rate = completed / total;
        const score = Math.round(rate * 100);
        const oldScore = user?.current_discipline_score || 50;
        if (score !== oldScore) {
            events_1.domainEvents.emit(events_1.DomainEventType.SCORE_UPDATED, {
                type: events_1.DomainEventType.SCORE_UPDATED,
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
exports.ScoreCalculator = ScoreCalculator;
