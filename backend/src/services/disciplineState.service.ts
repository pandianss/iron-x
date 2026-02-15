
import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'tsyringe';

interface DisciplineMetrics {
    score: number;
    classification: 'STRICT' | 'STABLE' | 'DRIFTING' | 'BREACH';
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
        exceptions: Array<{ id: string; title: string; expiry: string }>;
    };
    performanceMetrics: {
        weeklyCompletionRate: number;
        averageLatency: number;
        habitStrength: Record<string, number>;
    };
}

@injectable()
export class DisciplineStateService {
    constructor(@inject('PrismaClient') private prisma: PrismaClient) { }

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
                user_id: userId,
                scheduled_start_time: { gte: thirtyDaysAgo }
            },
            include: {
                action: true
            },
            orderBy: { scheduled_start_time: 'desc' }
        });

        // Calculate metrics
        const score = await this.calculateDisciplineScore(userId, instances);
        const classification = this.classifyDiscipline(score, instances);
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
        // Base score from user record
        const user = await this.prisma.user.findUnique({
            where: { user_id: userId },
            select: { current_discipline_score: true }
        });

        let score = user?.current_discipline_score ?? 75;

        // Calculate based on recent performance
        const completedOnTime = instances.filter(
            i => i.status === 'COMPLETED' // simplified check
        ).length;

        const completedLate = instances.filter(
            i => i.status === 'LATE' // simplified check
        ).length;

        const missed = instances.filter(i => i.status === 'MISSED').length;

        const total = instances.length;

        if (total > 0) {
            const onTimeRate = completedOnTime / total;
            const lateRate = completedLate / total;
            const missRate = missed / total;

            // Weighted score calculation
            score = (onTimeRate * 100) + (lateRate * 70) - (missRate * 30);

            // Clamp between 0-100
            score = Math.max(0, Math.min(100, score));
        }

        return Math.round(score * 10) / 10; // Round to 1 decimal
    }

    private classifyDiscipline(
        score: number,
        instances: any[]
    ): 'STRICT' | 'STABLE' | 'DRIFTING' | 'BREACH' {
        if (score >= 90) return 'STRICT';
        if (score >= 70) return 'STABLE';
        if (score >= 50) return 'DRIFTING';
        return 'BREACH';
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
            const key = inst.action?.action_id || 'unknown';
            if (!acc[key]) {
                acc[key] = {
                    title: inst.action?.title || 'Unknown Action',
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
            const late = recent.filter((i: any) => i.status === 'LATE').length;

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

        const avgDailyChange = recentScores.length > 0 ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : 0;

        let daysUntilBreach: number | null = null;
        if (avgDailyChange < 0) {
            const pointsToBreach = score - 50; // Breach threshold
            daysUntilBreach = Math.max(1, Math.ceil(pointsToBreach / Math.abs(avgDailyChange)));
        }

        // Find critical actions (most frequently missed)
        const actionMissCount: Record<string, number> = {};
        instances.forEach(inst => {
            if (inst.status === 'MISSED') {
                const key = inst.action?.title || 'Unknown';
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
        exceptions: Array<{ id: string; title: string; expiry: string }>;
    }> {
        const policiesActive = user.role?.policy ? 1 : 0;
        const lockedUntil = user.locked_until && new Date(user.locked_until) > new Date()
            ? user.locked_until
            : null;

        // Map exceptions
        const exceptions = (user.exceptions || []).map((ex: any) => ({
            id: ex.exception_id.substring(0, 8),
            title: ex.reason || 'Exception',
            expiry: ex.valid_until ? ex.valid_until.toISOString().split('T')[0] : 'Indefinite'
        }));

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
            frozenActions,
            exceptions
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

        // Mock latency calculation since completion_time_offset_minutes might not be on ActionInstance in all schemas
        // Assuming we can calculate from updated_at or if schema has it (schema check says no completion_time_offset_minutes, but executed_at exists)

        const latencies = instances
            .filter(i => i.executed_at && i.scheduled_start_time)
            .map(i => {
                const diff = new Date(i.executed_at).getTime() - new Date(i.scheduled_start_time).getTime();
                return Math.abs(Math.round(diff / 60000)); // minutes
            });

        const averageLatency = latencies.length > 0
            ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
            : 0;

        // Habit strength: consecutive completions per action
        const habitStrength: Record<string, number> = {};
        const actionGroups = instances.reduce((acc: any, inst) => {
            const key = inst.action?.title || 'Unknown';
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
                user_id: userId,
                scheduled_start_time: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            },
            include: { action: true }
        });

        const newScore = await this.calculateDisciplineScore(userId, instances);
        const classification = this.classifyDiscipline(newScore, instances);

        await this.prisma.user.update({
            where: { user_id: userId },
            data: {
                current_discipline_score: newScore,
                discipline_classification: classification
            }
        });

        return newScore;
    }

    // --- New Methods for Audit & Preview ---

    async getAuditLog(userId: string): Promise<any[]> {
        // Fetch from AuditLog table
        const logs = await this.prisma.auditLog.findMany({
            where: {
                OR: [
                    { actor_id: userId },
                    { target_user_id: userId }
                ]
            },
            orderBy: { timestamp: 'desc' },
            take: 20
        });

        // Also fetch negative action instances
        const violations = await this.prisma.actionInstance.findMany({
            where: {
                user_id: userId,
                status: { in: ['MISSED', 'LATE'] }
            },
            include: { action: true },
            orderBy: { scheduled_start_time: 'desc' },
            take: 20
        });

        const auditEntries = logs.map(log => ({
            id: log.log_id,
            timestamp: log.timestamp.toISOString().split('T')[0],
            action: log.action,
            impact: 'Medium', // Default
            severity: 'LOW',
            details: log.details
        }));

        const violationEntries = violations.map(v => ({
            id: v.instance_id.substring(0, 8),
            timestamp: v.scheduled_start_time.toISOString().split('T')[0],
            action: v.action?.title || 'Unknown Action',
            impact: v.status === 'MISSED' ? 'Discipline Score -5' : 'Discipline Score -2',
            severity: v.status === 'MISSED' ? 'HIGH' : 'MEDIUM'
        }));

        // Merge and sort
        return [...auditEntries, ...violationEntries]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 30);
    }

    async getTomorrowPreview(userId: string): Promise<{
        scheduledCount: number;
        riskLevel: string;
        warning: string;
        date: string;
    }> {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dayAfter = new Date(tomorrow);
        dayAfter.setDate(dayAfter.getDate() + 1);

        const instances = await this.prisma.actionInstance.count({
            where: {
                user_id: userId,
                scheduled_start_time: {
                    gte: tomorrow,
                    lt: dayAfter
                }
            }
        });

        let riskLevel = 'Low Risk';
        let warning = 'Light schedule. Focus on quality.';

        if (instances > 8) {
            riskLevel = 'High Risk';
            warning = 'Heavy load detected. Prioritize critical actions.';
        } else if (instances > 5) {
            riskLevel = 'Medium Risk';
            warning = 'Moderate load. Maintain steady pace.';
        }

        return {
            scheduledCount: instances,
            riskLevel,
            warning,
            date: tomorrow.toISOString()
        };
    }

    async getAnticipatoryWarnings(userId: string): Promise<any[]> {
        const warnings = [];
        const state = await this.getUserDisciplineState(userId);

        if (state.classification === 'DRIFTING') {
            warnings.push({
                type: 'DRIFT_ALERT',
                severity: 'HIGH',
                message: 'Drift detected in core habits. Immediate correction recommended.'
            });
        }

        if (state.violationHorizon.daysUntilBreach && state.violationHorizon.daysUntilBreach < 3) {
            warnings.push({
                type: 'BREACH_IMMINENT',
                severity: 'HIGH',
                message: `Breach predicted in ${state.violationHorizon.daysUntilBreach} days.`
            });
        }

        return warnings;
    }
}
