export class ScoringPolicy {
    /**
     * Calculates the discipline score based on instance statuses.
     * Pure function: Input array of statuses -> Output number (0-100).
     */
    static calculateScore(instances: { status: string, scheduled_end_time?: Date, executed_at?: Date | null }[]): number {
        if (!instances || instances.length === 0) return 50; // Neutral start

        const total = instances.filter(i => i.status !== 'PENDING').length;
        if (total === 0) return 50;

        const completedOnTime = instances.filter(i => {
            if (i.status !== 'COMPLETED') return false;
            if (!i.executed_at || !i.scheduled_end_time) return true;
            return new Date(i.executed_at) <= new Date(i.scheduled_end_time);
        }).length;

        const completedLate = instances.filter(i => {
            if (i.status !== 'COMPLETED') return false;
            if (!i.executed_at || !i.scheduled_end_time) return false;
            return new Date(i.executed_at) > new Date(i.scheduled_end_time);
        }).length;

        const missed = instances.filter(i => i.status === 'MISSED').length;

        const onTimeRate = completedOnTime / total;
        const lateRate = completedLate / total;
        const missRate = missed / total;

        const score = (onTimeRate * 100) + (lateRate * 70) - (missRate * 30);
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }
}
