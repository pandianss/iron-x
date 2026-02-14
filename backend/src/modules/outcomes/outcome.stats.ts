import { singleton } from 'tsyringe';
import prisma from '../../db';

@singleton()
export class OutcomeStats {
    async getOrgOutcomeSummary() {
        const totalOutcomes = await prisma.outcome.count();
        const productivityCount = await prisma.outcome.count({ where: { type: 'PRODUCTIVITY' } });
        const reliabilityCount = await prisma.outcome.count({ where: { type: 'RELIABILITY' } });
        const complianceCount = await prisma.outcome.count({ where: { type: 'COMPLIANCE' } });

        const recentOutcomes = await prisma.outcome.findMany({
            take: 10,
            orderBy: { calculated_at: 'desc' },
            include: { user: { select: { email: true } } }
        });

        return {
            total: totalOutcomes,
            breakdown: {
                productivity: productivityCount,
                reliability: reliabilityCount,
                compliance: complianceCount
            },
            recent: recentOutcomes
        };
    }

    async generateCSVReport() {
        const outcomes = await prisma.outcome.findMany({
            orderBy: { calculated_at: 'desc' },
            include: { user: { select: { email: true } } }
        });

        const header = 'Outcome ID,User,Type,Title,Value,Confidence,Date\n';
        const rows = outcomes.map(o =>
            `${o.outcome_id},${o.user?.email || 'System'},${o.type},"${o.title}",${o.value},${o.confidence_score},${o.calculated_at.toISOString()}`
        ).join('\n');

        return header + rows;
    }
}
