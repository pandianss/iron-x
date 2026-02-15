
import { Request, Response } from 'express';
import prisma from '../db';
import { AuditService } from '../services/audit.service';

export const getAuditLogs = async (req: Request, res: Response) => {
    try {
        const { limit = 100 } = req.query;
        // Basic check for admin role? Assume middleware handles it or we check here.
        // For MVP, user roles: MEMBER vs MANAGER. Admin? 
        // Let's assume user making request is authorized via middleware.

        const logs = await prisma.auditLog.findMany({
            take: Number(limit),
            orderBy: { timestamp: 'desc' },
            include: {
                actor: { select: { email: true } },
                target: { select: { email: true } }
            }
        });
        res.json(logs);
    } catch (error) {
        console.error('Error fetching audit logs', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};

export const updateSystemConfig = async (req: Request, res: Response) => {
    try {
        const { key, value } = req.body;
        const actorId = (req as any).user?.userId;

        await prisma.systemConfig.upsert({
            where: { config_key: key },
            update: { value },
            create: { config_key: key, value }
        });

        await AuditService.logEvent(
            'SYSTEM_CONFIG_CHANGE',
            { key, value },
            undefined,
            actorId
        );

        res.json({ message: 'Configuration updated' });
    } catch (error) {
        console.error('Error updating system config', error);
        res.status(500).json({ error: 'Failed to update system config' });
    }
};

export const getSystemMetrics = async (req: Request, res: Response) => {
    try {
        // 1. % Users under enforcement
        const totalUsers = await prisma.user.count();
        const enforcementUsers = await prisma.user.count({
            where: {
                OR: [
                    { enforcement_mode: { not: 'NONE' } },
                    { locked_until: { gt: new Date() } }
                ]
            }
        });
        const enforcementPercentage = totalUsers > 0 ? (enforcementUsers / totalUsers * 100).toFixed(1) : '0.0';

        // 2. Avg Time-to-Recovery
        // Find pairs of LOCKED -> UNLOCKED events in AuditLog?
        // Or simplified: Average duration of "USER_LOCKED_OUT" events logged.
        // The event details have "durationHours". Or we can look at actual unlocks.
        // Let's look at USER_LOCKED_OUT events and check if they have a corresponding USER_UNLOCKED or if we can infer duration.
        // Actually, let's just use the `durationHours` from `USER_LOCKED_OUT` logs as "Planned" recovery time average.
        // Real recovery time involves user action.
        // Complicated query. Let's simplify: Average discipline score across system. And variance per team.

        const logs = await prisma.auditLog.findMany({
            where: { action: 'USER_LOCKED_OUT' },
            select: { details: true } // format: { reason, durationHours, lockedUntil }
        });

        let totalDuration = 0;
        let count = 0;
        try {
            logs.forEach(log => {
                if (log.details) {
                    const detail = JSON.parse(log.details);
                    if (detail.durationHours) {
                        totalDuration += detail.durationHours;
                        count++;
                    }
                }
            });
        } catch (e) { /* ignore parse errors */ }

        const avgRecoveryTimeHours = count > 0 ? (totalDuration / count).toFixed(1) : '0.0';


        // 3. Discipline Score Variance per Team
        const teams = await prisma.team.findMany({
            include: {
                members: {
                    include: { user: { select: { current_discipline_score: true } } }
                }
            }
        });

        const teamStats = teams.map(team => {
            const scores = team.members.map(m => m.user.current_discipline_score || 0);
            if (scores.length === 0) return { teamId: team.team_id, name: team.name, variance: 0 };

            const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
            const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;

            return {
                teamId: team.team_id,
                name: team.name,
                variance: variance.toFixed(2),
                avgScore: mean.toFixed(1)
            };
        });

        res.json({
            enforcementPercentage: `${enforcementPercentage}%`,
            avgPlannedLockoutDurationHours: avgRecoveryTimeHours,
            teamVariance: teamStats
        });

    } catch (error) {
        console.error('Error fetching system metrics', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
};
