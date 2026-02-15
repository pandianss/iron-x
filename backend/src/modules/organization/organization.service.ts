
import { singleton } from 'tsyringe';
import prisma from '../../db';

@singleton()
export class OrganizationService {
    async createOrganization(data: { name: string; slug: string }) {
        return await (prisma as any).organization.create({
            data: {
                name: data.name,
                slug: data.slug
            }
        });
    }

    async getOrganizationBySlug(slug: string) {
        return await (prisma as any).organization.findUnique({
            where: { slug },
            include: {
                teams: true,
                users: {
                    select: {
                        user_id: true,
                        email: true,
                        current_discipline_score: true
                    }
                },
                policies: true,
                subscription: true
            }
        });
    }

    async addUserToOrganization(orgId: string, userId: string) {
        return await prisma.user.update({
            where: { user_id: userId },
            data: { org_id: orgId } as any
        });
    }

    async addTeamToOrganization(orgId: string, teamId: string) {
        return await prisma.team.update({
            where: { team_id: teamId },
            data: { org_id: orgId } as any
        });
    }

    async getOrganizationStats(orgId: string) {
        const teams = await prisma.team.findMany({
            where: { org_id: orgId } as any,
            include: {
                members: {
                    include: {
                        user: {
                            select: { current_discipline_score: true }
                        }
                    }
                }
            } as any
        }) as any[];

        let totalScore = 0;
        let totalMembers = 0;

        teams.forEach((team: any) => {
            team.members.forEach((member: any) => {
                if (member.user) {
                    totalScore += member.user.current_discipline_score;
                    totalMembers++;
                }
            });
        });

        return {
            teamCount: teams.length,
            memberCount: totalMembers,
            averageDisciplineScore: totalMembers > 0 ? totalScore / totalMembers : 0,
            disciplineState: this.calculateDisciplineState(totalMembers > 0 ? totalScore / totalMembers : 0)
        };
    }

    private calculateDisciplineState(avgScore: number) {
        if (avgScore >= 80) return 'ELITE';
        if (avgScore >= 60) return 'STABLE';
        if (avgScore >= 40) return 'RECOVERING';
        return 'UNRELIABLE';
    }
}
