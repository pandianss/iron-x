
import { SubscriptionTier } from '@prisma/client';

export interface ActionPerformance {
    status: string;
    scheduled_start_time: Date;
    scheduled_end_time: Date;
    executed_at?: Date | null;
}

export class ScoringEngine {
    /**
     * Standardized discipline score calculation (0-100).
     * This is the absolute source of truth for all modules.
     */
    static calculateScore(instances: ActionPerformance[]): number {
        if (!instances || instances.length === 0) return 75; // Default healthy start

        const processed = instances.filter(i => i.status !== 'PENDING');
        if (processed.length === 0) return 75;

        const completedOnTime = processed.filter(i => {
            if (i.status !== 'COMPLETED') return false;
            // No timing data → assume on time for legacy support
            if (!i.executed_at || !i.scheduled_end_time) return true;
            return new Date(i.executed_at) <= new Date(i.scheduled_end_time);
        }).length;

        const completedLate = processed.filter(i => {
            if (i.status !== 'COMPLETED') return false;
            if (!i.executed_at || !i.scheduled_end_time) return false;
            return new Date(i.executed_at) > new Date(i.scheduled_end_time);
        }).length;

        const missed = processed.filter(i => i.status === 'MISSED').length;

        const total = processed.length;
        const onTimeRate = completedOnTime / total;
        const lateRate = completedLate / total;
        const missRate = missed / total;

        // Formula: (On-Time * 100) + (Late * 70) - (Missed * 30)
        let score = (onTimeRate * 100) + (lateRate * 70) - (missRate * 30);
        
        return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
    }

    /**
     * Calculates daily performance delta for trajectory tracking.
     */
    static calculateDailyPerformance(stats: { completed: number; late: number; missed: number }): number {
        const total = stats.completed + stats.late + stats.missed;
        if (total === 0) return 0;

        return (stats.completed / total) * 100 + 
               (stats.late / total) * 70 - 
               (stats.missed / total) * 30;
    }

    /**
     * Classifies discipline level based on score and history.
     */
    static classifyDiscipline(score: number, totalInstances: number): string {
        if (totalInstances < 10) return 'ONBOARDING';
        if (score >= 90) return 'HIGH_RELIABILITY';
        if (score >= 70) return 'STABLE';
        return 'RECOVERING';
    }
}
