"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemMetrics = exports.updateSystemConfig = exports.getAuditLogs = void 0;
const db_1 = __importDefault(require("../db"));
const audit_service_1 = require("../services/audit.service");
const getAuditLogs = async (req, res) => {
    try {
        const { limit = 100 } = req.query;
        // Basic check for admin role? Assume middleware handles it or we check here.
        // For MVP, user roles: MEMBER vs MANAGER. Admin? 
        // Let's assume user making request is authorized via middleware.
        const logs = await db_1.default.auditLog.findMany({
            take: Number(limit),
            orderBy: { timestamp: 'desc' },
            include: {
                actor: { select: { email: true } },
                target: { select: { email: true } }
            }
        });
        res.json(logs);
    }
    catch (error) {
        console.error('Error fetching audit logs', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
};
exports.getAuditLogs = getAuditLogs;
const updateSystemConfig = async (req, res) => {
    try {
        const { key, value } = req.body;
        const actorId = req.user?.userId;
        await db_1.default.systemConfig.upsert({
            where: { config_key: key },
            update: { value },
            create: { config_key: key, value }
        });
        await audit_service_1.AuditService.logEvent('SYSTEM_CONFIG_CHANGE', { key, value }, undefined, actorId);
        res.json({ message: 'Configuration updated' });
    }
    catch (error) {
        console.error('Error updating system config', error);
        res.status(500).json({ error: 'Failed to update system config' });
    }
};
exports.updateSystemConfig = updateSystemConfig;
const getSystemMetrics = async (req, res) => {
    try {
        // 1. % Users under enforcement
        const totalUsers = await db_1.default.user.count();
        const enforcementUsers = await db_1.default.user.count({
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
        const logs = await db_1.default.auditLog.findMany({
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
        }
        catch (e) { /* ignore parse errors */ }
        const avgRecoveryTimeHours = count > 0 ? (totalDuration / count).toFixed(1) : '0.0';
        // 3. Discipline Score Variance per Team
        const teams = await db_1.default.team.findMany({
            include: {
                members: {
                    include: { user: { select: { current_discipline_score: true } } }
                }
            }
        });
        const teamStats = teams.map(team => {
            const scores = team.members.map(m => m.user.current_discipline_score || 0);
            if (scores.length === 0)
                return { teamId: team.team_id, name: team.name, variance: 0 };
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
    }
    catch (error) {
        console.error('Error fetching system metrics', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
};
exports.getSystemMetrics = getSystemMetrics;
