
import prisma from '../db';

export const ReportService = {
    /**
     * Generates a CSV compliance report for a team.
     */
    async generateTeamComplianceReport(teamId: string): Promise<string> {
        const members = await prisma.teamMember.findMany({
            where: { team_id: teamId },
            include: {
                user: {
                    select: {
                        user_id: true,
                        email: true,
                        current_discipline_score: true,
                        enforcement_mode: true
                    }
                }
            }
        });

        // Header
        let csv = 'User ID,Email,Score,Enforcement Mode,Execution Rate,Miss Count (7d),Enforcement Actions (7d)\n';

        const now = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);

        for (const member of members) {
            // Stats (Last 7 days)
            const instances = await prisma.actionInstance.findMany({
                where: {
                    user_id: member.user_id,
                    scheduled_date: { gte: sevenDaysAgo }
                }
            });

            const total = instances.length;
            const executed = instances.filter(i => i.status === 'COMPLETED' || i.status === 'LATE').length;
            const missed = instances.filter(i => i.status === 'MISSED').length;
            const executionRate = total > 0 ? (executed / total * 100).toFixed(1) : '0.0';

            // Enforcement Actions from Audit Log
            const auditLogs = await prisma.auditLog.count({
                where: {
                    target_user_id: member.user_id,
                    timestamp: { gte: sevenDaysAgo },
                    action: { in: ['USER_LOCKED_OUT', 'ACTION_MISSED_HARD_MODE'] }
                }
            });

            csv += `${member.user_id},${member.user.email},${member.user.current_discipline_score},${member.user.enforcement_mode},${executionRate}%,${missed},${auditLogs}\n`;
        }

        return csv;
    }
};
