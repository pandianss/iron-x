export class ScoringPolicy {
    /**
     * Calculates the discipline score based on instance statuses.
     * Pure function: Input array of statuses -> Output number (0-100).
     */
    static calculateScore(instances: { status: string, scheduled_end_time?: Date, executed_at?: Date | null }[]): number {
        if (!instances || instances.length === 0) return 50; // Neutral start

        const total = instances.filter(i => i.status !== 'PENDING').length;
        if (total === 0) return 50;

        const completed = instances.filter(i => i.status === 'COMPLETED').length;
        const executionRate = completed / total;

        const onTime = instances.filter(i => {
            if (i.status !== 'COMPLETED') return false;
            if (!i.executed_at || !i.scheduled_end_time) return true; // Legacy/missing data, assume on time if completed
            return new Date(i.executed_at) <= new Date(i.scheduled_end_time);
        }).length;

        const onTimeRate = completed > 0 ? (onTime / completed) : 0;

        // Weight: 70% Execution, 30% On-Time
        const combinedRate = (executionRate * 0.7) + (onTimeRate * 0.3);

        return Math.round(combinedRate * 100);
    }
}
