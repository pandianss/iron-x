
import prisma from '../../db';
import { UserId } from './domain/types';

export class ScoreCalculator {
    async compute(userId: UserId): Promise<number> {
        // Simple scoring logic for MVP
        // In real implementation, this would be more complex

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const instances = await prisma.actionInstance.findMany({
            where: {
                user_id: userId,
                scheduled_date: { gte: startOfMonth }
            }
        });

        if (instances.length === 0) return 50; // Neutral start

        const completed = instances.filter((i: { status: string }) => i.status === 'COMPLETED').length;
        const total = instances.filter((i: { status: string }) => i.status !== 'PENDING').length;

        if (total === 0) return 50;

        const rate = completed / total;
        const score = Math.round(rate * 100);

        // Persist score
        await prisma.user.update({
            where: { user_id: userId },
            data: { current_discipline_score: score }
        });

        return score;
    }
}
