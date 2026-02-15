
import { autoInjectable } from 'tsyringe';
import prisma from '../../db';

@autoInjectable()
export class AnalyticsService {
    async getDisciplineHistory(userId: string, days: number = 30) {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return await prisma.disciplineScore.findMany({
            where: {
                user_id: userId,
                date: { gte: startDate }
            },
            orderBy: { date: 'asc' }
        });
    }

    async getTeamVelocity(teamId: string) {
        // Get all members of the team
        const members = await prisma.teamMember.findMany({
            where: { team_id: teamId },
            include: {
                user: {
                    select: {
                        user_id: true,
                        email: true,
                        current_discipline_score: true
                    }
                }
            }
        });

        // Calculate stats
        // Velocity = Average Score (Simple MVP definition)
        // Advanced: We could calculate "Tasks completed per week" if we had that history easily accessible.
        // For now, let's use Current Discipline Score as the velocity proxy + completion rate if available.

        const velocityData = members.map(m => ({
            userId: m.user_id,
            email: m.user.email,
            score: m.user.current_discipline_score || 0
        })).sort((a, b) => b.score - a.score);

        return velocityData;
    }

    async getOrganizationVelocity(orgId: string) {
        const teams = await (prisma as any).team.findMany({
            where: { org_id: orgId },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                user_id: true,
                                email: true,
                                current_discipline_score: true
                            }
                        }
                    }
                }
            }
        });

        const orgStats: any[] = [];
        teams.forEach((team: any) => {
            team.members.forEach((m: any) => {
                orgStats.push({
                    teamName: team.name,
                    email: m.user.email,
                    score: m.user.current_discipline_score || 0
                });
            });
        });

        return orgStats.sort((a, b) => b.score - a.score);
    }
}
