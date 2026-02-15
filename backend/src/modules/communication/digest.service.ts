
import { singleton, inject } from 'tsyringe';
import prisma from '../../db';
import { EmailService } from './email.service';

@singleton()
export class DigestService {
    constructor(
        @inject(EmailService) private emailService: EmailService
    ) { }

    async sendWeeklyDigests() {
        const users = await prisma.user.findMany({
            select: {
                user_id: true,
                email: true,
                current_discipline_score: true
            }
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const results = [];

        for (const user of users) {
            // Get stats for the week
            const weeklyActions = await prisma.actionInstance.groupBy({
                by: ['status'],
                where: {
                    user_id: user.user_id,
                    scheduled_date: { gte: sevenDaysAgo }
                },
                _count: {
                    status: true
                }
            });

            let completed = 0;
            let total = 0;
            weeklyActions.forEach((g: any) => {
                if (g.status === 'COMPLETED' || g.status === 'LATE') completed += g._count.status;
                total += g._count.status;
            });

            const stats = {
                score: user.current_discipline_score,
                completed,
                total,
                missed: total - completed
            };

            await this.emailService.sendWeeklyDigest(user.email, stats);
            results.push({ email: user.email, success: true });
        }

        return results;
    }
}
