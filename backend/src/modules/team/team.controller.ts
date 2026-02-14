import { Request, Response, NextFunction } from 'express';
import { autoInjectable } from 'tsyringe';
import prisma from '../../db';
import { AuditService } from '../../services/audit.service';
import { sanitizeMemberProfile } from '../../utils/privacy';
import { NotFoundError, ForbiddenError } from '../../utils/AppError';

@autoInjectable()
export class TeamController {
    createTeam = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { name } = req.body;
            const ownerId = req.user!.userId;

            const team = await prisma.team.create({
                data: {
                    name,
                    owner_id: ownerId,
                }
            });

            await prisma.teamMember.create({
                data: {
                    team_id: team.team_id,
                    user_id: ownerId,
                    role: 'MANAGER'
                }
            });

            res.status(201).json(team);
        } catch (error) {
            next(error);
        }
    };

    addMember = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { teamId, email, role } = req.body;
            const requesterId = req.user!.userId;

            const membership = await prisma.teamMember.findUnique({
                where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
            });

            if (!membership || membership.role !== 'MANAGER') {
                throw new ForbiddenError('Not authorized to add members');
            }

            const team = await prisma.team.findUnique({
                where: { team_id: teamId },
                include: { _count: { select: { members: true } } }
            });

            if (!team) throw new NotFoundError('Team not found');

            if (team._count.members >= team.max_seats) {
                throw new ForbiddenError(`Seat limit reached (${team.max_seats} max)`);
            }

            const userToAdd = await prisma.user.findUnique({ where: { email } });
            if (!userToAdd) throw new NotFoundError('User not found');

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
            next(error);
        }
    };

    getTeamStats = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { teamId } = req.params as { teamId: string };
            const requesterId = req.user!.userId;

            const membership = await prisma.teamMember.findUnique({
                where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
            });

            if (!membership || membership.role !== 'MANAGER') {
                throw new ForbiddenError('Not authorized to view team stats');
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
                        }
                    }
                }
            });

            const stats = {
                totalMembers: members.length,
                avgScore: members.reduce((sum, m) => sum + (m.user.current_discipline_score || 0), 0) / members.length || 0,
                statusCounts: {
                    normal: members.filter((m) => !m.user.locked_until).length,
                    locked: members.filter((m) => m.user.locked_until && m.user.locked_until > new Date()).length,
                    warning: members.filter((m) => (m.user.current_discipline_score || 100) < 50 && (!m.user.locked_until || m.user.locked_until < new Date())).length
                },
                members: members.map((m) => sanitizeMemberProfile(m as any, membership.role))
            };

            res.json(stats);

        } catch (error) {
            next(error);
        }
    };

    exportComplianceReport = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { ReportService } = await import('../../services/report.service');
            const { teamId } = req.params as { teamId: string };
            const requesterId = req.user!.userId;

            const membership = await prisma.teamMember.findUnique({
                where: { team_id_user_id: { team_id: teamId, user_id: requesterId } }
            });

            if (!membership || membership.role !== 'MANAGER') {
                throw new ForbiddenError('Not authorized to export report');
            }

            const csv = await ReportService.generateTeamComplianceReport(teamId);

            res.set('Content-Type', 'text/csv');
            res.set('Content-Disposition', `attachment; filename="compliance_report_${teamId}.csv"`);
            res.send(csv);

        } catch (error) {
            next(error);
        }
    };
}
