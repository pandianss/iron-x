"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportComplianceReport = exports.getTeamStats = exports.addMember = exports.createTeam = void 0;
const db_1 = __importDefault(require("../db"));
const audit_service_1 = require("../services/audit.service");
/**
 * Creates a new team.
 * User becomes the owner.
 */
const createTeam = async (req, res) => {
    try {
        const { name } = req.body;
        const ownerId = req.user.userId;
        const team = await db_1.default.team.create({
            data: {
                name,
                owner_id: ownerId,
            }
        });
        // Add owner as a member? Usually yes.
        await db_1.default.teamMember.create({
            data: {
                team_id: team.team_id,
                user_id: ownerId,
                role: 'MANAGER'
            }
        });
        res.status(201).json(team);
    }
    catch (error) {
        console.error('Error creating team', error);
        res.status(500).json({ error: 'Failed to create team' });
    }
};
exports.createTeam = createTeam;
/**
 * Adds a member to the team.
 * Enforces Seat Limits (G1).
 */
const addMember = async (req, res) => {
    try {
        const { teamId, email, role } = req.body;
        const requesterId = req.user.userId;
        // Check permissions (Requester must be MANAGER)
        const membership = await db_1.default.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
        });
        if (!membership || membership.role !== 'MANAGER') {
            return res.status(403).json({ error: 'Not authorized to add members' });
        }
        // Check Seat Limits
        const team = await db_1.default.team.findUnique({
            where: { team_id: teamId },
            include: { _count: { select: { members: true } } }
        });
        if (!team)
            return res.status(404).json({ error: 'Team not found' });
        if (team._count.members >= team.max_seats) {
            return res.status(403).json({ error: `Seat limit reached (${team.max_seats} max)` });
        }
        // Find user to add
        const userToAdd = await db_1.default.user.findUnique({ where: { email } });
        if (!userToAdd)
            return res.status(404).json({ error: 'User not found' });
        await db_1.default.teamMember.create({
            data: {
                team_id: teamId,
                user_id: userToAdd.user_id,
                role: role || 'MEMBER'
            }
        });
        await audit_service_1.AuditService.logEvent('TEAM_MEMBER_ADDED', { teamId, addedUserId: userToAdd.user_id, role }, userToAdd.user_id, requesterId);
        res.status(201).json({ message: 'Member added' });
    }
    catch (error) {
        console.error('Error adding team member', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
};
exports.addMember = addMember;
/**
 * Get Team stats for Manager Dashboard (E1).
 * Includes: Heatmap, Trends, User Status Counts.
 * Privacy: If Private Mode, hide action titles (Not implemented here, but frontend should handle or we strip titles if we returned actions. Here we return stats).
 */
const getTeamStats = async (req, res) => {
    try {
        const { teamId } = req.params;
        const requesterId = req.user.userId;
        // Check permissions
        const membership = await db_1.default.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
        });
        if (!membership || membership.role !== 'MANAGER') {
            // Or allow members to see stats? Usually Manager Dashboard.
            return res.status(403).json({ error: 'Not authorized to view team stats' });
        }
        const members = await db_1.default.teamMember.findMany({
            where: { team_id: teamId },
            include: {
                user: {
                    select: {
                        user_id: true,
                        email: true,
                        current_discipline_score: true,
                        enforcement_mode: true,
                        locked_until: true,
                        // TODO: Privacy check if we return more details
                    }
                }
            }
        });
        // Calculate aggregates
        const stats = {
            totalMembers: members.length,
            avgScore: members.reduce((sum, m) => sum + (m.user.current_discipline_score || 0), 0) / members.length || 0,
            statusCounts: {
                normal: members.filter((m) => !m.user.locked_until).length,
                locked: members.filter((m) => m.user.locked_until && m.user.locked_until > new Date()).length,
                // "Warning" could be score < X but not locked.
                warning: members.filter((m) => (m.user.current_discipline_score || 100) < 50 && (!m.user.locked_until || m.user.locked_until < new Date())).length
            },
            members: members.map((m) => ({
                userId: m.user.user_id,
                email: m.user.email, // Maybe mask if strict privacy?
                score: m.user.current_discipline_score,
                mode: m.user.enforcement_mode,
                isLocked: m.user.locked_until && m.user.locked_until > new Date()
            }))
        };
        res.json(stats);
    }
    catch (error) {
        console.error('Error fetching team stats', error);
        res.status(500).json({ error: 'Failed to fetch team stats' });
    }
};
exports.getTeamStats = getTeamStats;
const exportComplianceReport = async (req, res) => {
    try {
        const { ReportService } = await Promise.resolve().then(() => __importStar(require('../services/report.service')));
        const { teamId } = req.params;
        const requesterId = req.user.userId;
        // Check permissions
        const membership = await db_1.default.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
        });
        if (!membership || membership.role !== 'MANAGER') {
            return res.status(403).json({ error: 'Not authorized to export report' });
        }
        const csv = await ReportService.generateTeamComplianceReport(teamId);
        res.set('Content-Type', 'text/csv');
        res.set('Content-Disposition', `attachment; filename="compliance_report_${teamId}.csv"`);
        res.send(csv);
    }
    catch (error) {
        console.error('Error exporting report', error);
        res.status(500).json({ error: 'Failed to export report' });
    }
};
exports.exportComplianceReport = exportComplianceReport;
