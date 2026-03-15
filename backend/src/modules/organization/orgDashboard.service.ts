import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import { Logger } from '../../core/logger';

@injectable()
export class OrgDashboardService {
    constructor(@inject('PrismaClient') private prisma: PrismaClient) { }

    async getOrgAnalytics(orgId: string) {
        const members = await (this.prisma.user.findMany({
            where: { org_id: orgId },
            select: {
                current_discipline_score: true,
                discipline_classification: true,
                trust_tier: true
            }
        }) as any as any[]);

        if (members.length === 0) {
            return {
                ads: 0,
                memberCount: 0,
                complianceReadiness: 0,
                classificationBreakdown: {}
            };
        }

        const totalScore = members.reduce((sum, m) => sum + m.current_discipline_score, 0);
        const ads = totalScore / members.length;

        const highReliabilityCount = members.filter(m => m.discipline_classification === 'HIGH_RELIABILITY' || m.current_discipline_score >= 85).length;
        const complianceReadiness = (highReliabilityCount / members.length) * 100;

        const classificationBreakdown = members.reduce((acc: any, m) => {
            acc[m.discipline_classification] = (acc[m.discipline_classification] || 0) + 1;
            return acc;
        }, {});

        const tierBreakdown = members.reduce((acc: any, m) => {
            acc[m.trust_tier] = (acc[m.trust_tier] || 0) + 1;
            return acc;
        }, {});

        return {
            ads: Math.round(ads * 100) / 100,
            memberCount: members.length,
            complianceReadiness: Math.round(complianceReadiness * 100) / 100,
            classificationBreakdown,
            tierBreakdown
        };
    }

    async getTopViolations(orgId: string) {
        // Query instances for members of this org that are MISSED or LATE
        const violations = await this.prisma.actionInstance.findMany({
            where: {
                user: { org_id: orgId },
                status: { in: ['MISSED', 'LATE'] }
            },
            include: { action: true },
            orderBy: { scheduled_start_time: 'desc' },
            take: 50
        });

        const actionCounts = violations.reduce((acc: any, v) => {
            const title = v.action?.title || 'Unknown';
            acc[title] = (acc[title] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(actionCounts)
            .map(([title, count]) => ({ title, count }))
            .sort((a, b) => (b as any).count - (a as any).count)
            .slice(0, 5);
    }
}
