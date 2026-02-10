
import { Request, Response } from 'express';
import prisma from '../db';
import { AuditService } from '../services/audit.service';

/**
 * Creates a new team.
 * User becomes the owner.
 */
export const createTeam = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const ownerId = (req as any).user.userId;

        const team = await prisma.team.create({
            data: {
                name,
                owner_id: ownerId,
            }
        });

        // Add owner as a member? Usually yes.
        await prisma.teamMember.create({
            data: {
                team_id: team.team_id,
                user_id: ownerId,
                role: 'MANAGER'
            }
        });

        res.status(201).json(team);
    } catch (error) {
        console.error('Error creating team', error);
        res.status(500).json({ error: 'Failed to create team' });
    }
};

/**
 * Adds a member to the team.
 * Enforces Seat Limits (G1).
 */
export const addMember = async (req: Request, res: Response) => {
    try {
        const { teamId, email, role } = req.body;
        const requesterId = (req as any).user.userId;

        // Check permissions (Requester must be MANAGER)
        const membership = await prisma.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
        });

        if (!membership || membership.role !== 'MANAGER') {
            return res.status(403).json({ error: 'Not authorized to add members' });
        }

        // Check Seat Limits
        const team = await prisma.team.findUnique({
            where: { team_id: teamId },
            include: { _count: { select: { members: true } } }
        });

        if (!team) return res.status(404).json({ error: 'Team not found' });

        if (team._count.members >= team.max_seats) {
            return res.status(403).json({ error: `Seat limit reached (${team.max_seats} max)` });
        }

        // Find user to add
        const userToAdd = await prisma.user.findUnique({ where: { email } });
        if (!userToAdd) return res.status(404).json({ error: 'User not found' });

        await prisma.teamMember.create({
            data: {
                team_id: teamId,
                user_id: userToAdd.user_id,
                role: role || 'MEMBER'
            }
        });

        await AuditService.logEvent(
            'TEAM_MEMBER_ADDED',
            { teamId, addedUserId: userToAdd.user_id, role },
            userToAdd.user_id,
            requesterId
        );

        res.status(201).json({ message: 'Member added' });
    } catch (error) {
        console.error('Error adding team member', error);
        res.status(500).json({ error: 'Failed to add member' });
    }
};

/**
 * Get Team stats for Manager Dashboard (E1).
 * Includes: Heatmap, Trends, User Status Counts.
 * Privacy: If Private Mode, hide action titles (Not implemented here, but frontend should handle or we strip titles if we returned actions. Here we return stats).
 */
export const getTeamStats = async (req: Request, res: Response) => {
    try {
        const { teamId } = req.params as { teamId: string };
        const requesterId = (req as any).user.userId;

        // Check permissions
        const membership = await prisma.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
        });

        if (!membership || membership.role !== 'MANAGER') {
            // Or allow members to see stats? Usually Manager Dashboard.
            return res.status(403).json({ error: 'Not authorized to view team stats' });
        }

        const members = await prisma.teamMember.findMany({
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
            avgScore: members.reduce((sum, m: any) => sum + (m.user.current_discipline_score || 0), 0) / members.length || 0,
            statusCounts: {
                normal: members.filter((m: any) => !m.user.locked_until).length,
                locked: members.filter((m: any) => m.user.locked_until && m.user.locked_until > new Date()).length,
                // "Warning" could be score < X but not locked.
                warning: members.filter((m: any) => (m.user.current_discipline_score || 100) < 50 && (!m.user.locked_until || m.user.locked_until < new Date())).length
            },
            members: members.map((m: any) => ({
                userId: m.user.user_id,
                email: m.user.email, // Maybe mask if strict privacy?
                score: m.user.current_discipline_score,
                mode: m.user.enforcement_mode,
                isLocked: m.user.locked_until && m.user.locked_until > new Date()
            }))
        };

        res.json(stats);

    } catch (error) {
        console.error('Error fetching team stats', error);
        res.status(500).json({ error: 'Failed to fetch team stats' });
    }
};

export const exportComplianceReport = async (req: Request, res: Response) => {
    try {
        const { ReportService } = await import('../services/report.service');
        const { teamId } = req.params as { teamId: string };
        const requesterId = (req as any).user.userId;

        // Check permissions
        const membership = await prisma.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
        });

        if (!membership || membership.role !== 'MANAGER') {
            return res.status(403).json({ error: 'Not authorized to export report' });
        }

        const csv = await ReportService.generateTeamComplianceReport(teamId);

        res.set('Content-Type', 'text/csv');
        res.set('Content-Disposition', `attachment; filename="compliance_report_${teamId}.csv"`);
        res.send(csv);

    } catch (error) {
        console.error('Error exporting report', error);
        res.status(500).json({ error: 'Failed to export report' });
    }
};

