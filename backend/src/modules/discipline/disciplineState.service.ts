// backend/src/services/disciplineState.service.ts

import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import { ScoringEngine } from '../../domain/discipline/ScoringEngine';

interface DisciplineMetrics {
    score: number;
    classification: 'HIGH_RELIABILITY' | 'STABLE' | 'RECOVERING' | 'ONBOARDING';
    compositePressure: number;
    driftVectors: Array<{
        source: string;
        magnitude: number;
        direction: 'POSITIVE' | 'NEGATIVE';
    }>;
    violationHorizon: {
        daysUntilBreach: number | null;
        criticalActions: string[];
    };
    activeConstraints: {
        policiesActive: number;
        lockedUntil: Date | null;
        reducedPrivileges: string[];
        frozenActions: string[];
    };
    performanceMetrics: {
        weeklyCompletionRate: number;
        averageLatency: number;
        habitStrength: Record<string, number>;
    };
}

@injectable()
export class DisciplineStateService {
    constructor(@inject('PrismaClient') private prisma: PrismaClient) {}

    async getUserDisciplineState(userId: string): Promise<DisciplineMetrics> {
        const user = await this.prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                role: { include: { policy: true } },
                exceptions: {
                    where: {
                        OR: [
                            { valid_until: null },
                            { valid_until: { gte: new Date() } }
                        ],
                        approved_by: { not: null }
                    }
                }
            }
        });

        if (!user) throw new Error('User not found');

        // Get recent action instances (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const instances = await this.prisma.actionInstance.findMany({
            where: {
                action: { user_id: userId },
                scheduled_start_time: { gte: thirtyDaysAgo }
            },
            include: {
                action: true
            },
            orderBy: { scheduled_start_time: 'desc' }
        });

        // Calculate metrics
        const score = await this.calculateDisciplineScore(userId, instances);
        const classification = ScoringEngine.classifyDiscipline(score, instances.length) as any;
        const driftVectors = this.calculateDriftVectors(instances);
        const compositePressure = this.calculateCompositePressure(driftVectors);
        const violationHorizon = this.calculateViolationHorizon(score, instances);
        const activeConstraints = await this.getActiveConstraints(user);
        const performanceMetrics = this.calculatePerformanceMetrics(instances);

        return {
            score,
            classification,
            compositePressure,
            driftVectors,
            violationHorizon,
            activeConstraints,
            performanceMetrics
        };
    }

    private async calculateDisciplineScore(
        userId: string,
        instances: any[]
    ): Promise<number> {
        return ScoringEngine.calculateScore(instances);
    }


    private calculateDriftVectors(instances: any[]): Array<{
        source: string;
        magnitude: number;
        direction: 'POSITIVE' | 'NEGATIVE';
    }> {
        const vectors: Array<{
            source: string;
            magnitude: number;
            direction: 'POSITIVE' | 'NEGATIVE';
        }> = [];

        // Group by action to detect patterns
        const actionGroups = instances.reduce((acc: any, inst) => {
            const key = inst.action.action_id;
            if (!acc[key]) {
                acc[key] = {
                    title: inst.action.title,
                    instances: []
                };
            }
            acc[key].instances.push(inst);
            return acc;
        }, {});

        // Calculate drift for each action
        Object.entries(actionGroups).forEach(([actionId, group]: [string, any]) => {
            const recent = group.instances.slice(0, 7); // Last 7 instances
            const missed = recent.filter((i: any) => i.status === 'MISSED').length;
            const late = recent.filter((i: any) => i.completion_time_offset_minutes).length;

            if (missed > 0 || late > 0) {
                const magnitude = ((missed * 2 + late) / recent.length) * 100;
                vectors.push({
                    source: group.title,
                    magnitude: Math.round(magnitude * 10) / 10,
                    direction: 'NEGATIVE'
                });
            } else if (recent.length >= 5 && missed === 0) {
                // Positive drift for consistent performance
                vectors.push({
                    source: group.title,
                    magnitude: 15,
                    direction: 'POSITIVE'
                });
            }
        });

        return vectors.sort((a, b) => b.magnitude - a.magnitude).slice(0, 5);
    }

    private calculateCompositePressure(driftVectors: any[]): number {
        const negativePressure = driftVectors
            .filter(v => v.direction === 'NEGATIVE')
            .reduce((sum, v) => sum + v.magnitude, 0);

        const positivePressure = driftVectors
            .filter(v => v.direction === 'POSITIVE')
            .reduce((sum, v) => sum + v.magnitude, 0);

        return Math.round((negativePressure - positivePressure) * 10) / 10;
    }

    private calculateViolationHorizon(score: number, instances: any[]): {
        daysUntilBreach: number | null;
        criticalActions: string[];
    } {
        // Calculate trend
        const recentScores = instances.slice(0, 14).map((inst, idx) => {
            const dayScore = inst.status === 'COMPLETED' ? 5 : 
                           inst.status === 'LATE' ? 2 : -3;
            return dayScore;
        });

        const avgDailyChange = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

        let daysUntilBreach: number | null = null;
        if (avgDailyChange < 0) {
            const pointsToBreach = score - 50; // Breach threshold
            daysUntilBreach = Math.ceil(pointsToBreach / Math.abs(avgDailyChange));
        }

        // Find critical actions (most frequently missed)
        const actionMissCount: Record<string, number> = {};
        instances.forEach(inst => {
            if (inst.status === 'MISSED') {
                const key = inst.action.title;
                actionMissCount[key] = (actionMissCount[key] || 0) + 1;
            }
        });

        const criticalActions = Object.entries(actionMissCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([action]) => action);

        return { daysUntilBreach, criticalActions };
    }

    private async getActiveConstraints(user: any): Promise<{
        policiesActive: number;
        lockedUntil: Date | null;
        reducedPrivileges: string[];
        frozenActions: string[];
    }> {
        const policiesActive = user.role?.policy ? 1 : 0;
        const lockedUntil = user.locked_until && user.locked_until > new Date() 
            ? user.locked_until 
            : null;

        // In a real system, these would come from policy rules
        const reducedPrivileges: string[] = [];
        const frozenActions: string[] = [];

        if (user.current_discipline_score < 60) {
            reducedPrivileges.push('Team Admin Access');
            frozenActions.push('New Goal Creation');
        }

        if (lockedUntil) {
            reducedPrivileges.push('All Write Operations');
            frozenActions.push('All Actions');
        }

        return {
            policiesActive,
            lockedUntil,
            reducedPrivileges,
            frozenActions
        };
    }

    private calculatePerformanceMetrics(instances: any[]): {
        weeklyCompletionRate: number;
        averageLatency: number;
        habitStrength: Record<string, number>;
    } {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const weeklyInstances = instances.filter(
            i => new Date(i.scheduled_start_time) >= sevenDaysAgo
        );

        const completed = weeklyInstances.filter(i => i.status === 'COMPLETED').length;
        const weeklyCompletionRate = weeklyInstances.length > 0 
            ? Math.round((completed / weeklyInstances.length) * 100) 
            : 0;

        const latencies = instances
            .filter(i => i.completion_time_offset_minutes !== null)
            .map(i => Math.abs(i.completion_time_offset_minutes));

        const averageLatency = latencies.length > 0
            ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
            : 0;

        // Habit strength: consecutive completions per action
        const habitStrength: Record<string, number> = {};
        const actionGroups = instances.reduce((acc: any, inst) => {
            const key = inst.action.title;
            if (!acc[key]) acc[key] = [];
            acc[key].push(inst);
            return acc;
        }, {});

        Object.entries(actionGroups).forEach(([action, insts]: [string, any]) => {
            let streak = 0;
            for (const inst of insts.slice(0, 10)) {
                if (inst.status === 'COMPLETED') {
                    streak++;
                } else {
                    break;
                }
            }
            habitStrength[action] = Math.min(streak * 10, 100);
        });

        return {
            weeklyCompletionRate,
            averageLatency,
            habitStrength
        };
    }

    async updateDisciplineScore(userId: string): Promise<number> {
        const instances = await this.prisma.actionInstance.findMany({
            where: {
                action: { user_id: userId },
                scheduled_start_time: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            include: { action: true }
        });

        const newScore = await this.calculateDisciplineScore(userId, instances);
        const classification = ScoringEngine.classifyDiscipline(newScore, instances.length) as any;

        await this.prisma.user.update({
            where: { user_id: userId },
            data: {
                current_discipline_score: newScore,
                discipline_classification: classification
            }
        });

        return newScore;
    }

    /**
     * Calculates the discipline score trajectory for the last 30 days.
     * Ported from and consolidated from the controller.
     */
    async getUserTrajectory(userId: string): Promise<Array<{ date: string; score: number }>> {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get starting score
        const latestScoreRecord = await this.prisma.disciplineScore.findFirst({
            where: { user_id: userId },
            orderBy: { date: 'desc' },
            select: { score: true }
        });

        const instances = await this.prisma.actionInstance.findMany({
            where: {
                action: { user_id: userId },
                scheduled_start_time: { gte: thirtyDaysAgo }
            },
            orderBy: { scheduled_start_time: 'asc' },
            select: {
                scheduled_start_time: true,
                scheduled_end_time: true,
                status: true,
                executed_at: true
            }
        });

        const dailyScores: Array<{ date: string; score: number }> = [];
        const dayMap = new Map<string, { completed: number; missed: number; late: number }>();

        instances.forEach((inst: any) => {
            const dateKey = inst.scheduled_start_time.toISOString().split('T')[0];
            if (!dayMap.has(dateKey)) {
                dayMap.set(dateKey, { completed: 0, missed: 0, late: 0 });
            }
            
            const day = dayMap.get(dateKey)!;
            if (inst.status === 'COMPLETED') {
                const isLate = 
                    inst.executed_at && 
                    inst.scheduled_end_time && 
                    new Date(inst.executed_at) > new Date(inst.scheduled_end_time);
                
                if (isLate) {
                    day.late++;
                } else {
                    day.completed++;
                }
            } else if (inst.status === 'MISSED') {
                day.missed++;
            }
        });

        let runningScore = latestScoreRecord?.score ?? 50;
        Array.from(dayMap.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([date, stats]) => {
                const dailyPerformance = ScoringEngine.calculateDailyPerformance(stats);
                runningScore = runningScore * 0.7 + dailyPerformance * 0.3;
                
                dailyScores.push({
                    date,
                    score: Math.round(runningScore * 10) / 10
                });
            });

        return dailyScores;
    }
}
