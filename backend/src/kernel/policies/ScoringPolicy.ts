export class ScoringPolicy {
    /**
     * Calculates the discipline score based on instance statuses.
     * Pure function: Input array of statuses -> Output number (0-100).
     */
    static calculateScore(instances: { status: string }[]): number {
        if (!instances || instances.length === 0) return 50; // Neutral start

        const total = instances.filter(i => i.status !== 'PENDING').length;
        if (total === 0) return 50;

        const completed = instances.filter(i => i.status === 'COMPLETED').length;

        const rate = completed / total;
        return Math.round(rate * 100);
    }
}
