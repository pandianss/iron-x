
import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../db';

export const getDisciplineData = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            select: { current_discipline_score: true }
        });

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const history = await prisma.disciplineScore.findMany({
            where: {
                user_id: userId,
                date: { gte: sevenDaysAgo }
            },
            orderBy: { date: 'asc' }
        });

        // Get today's stats for "Counts"
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayIds = await prisma.actionInstance.groupBy({
            by: ['status'],
            where: {
                user_id: userId,
                scheduled_date: today
            },
            _count: {
                status: true
            }
        });

        // Aggregate counts
        let execCount = 0;
        let missedCount = 0;
        todayIds.forEach(g => {
            if (g.status === 'COMPLETED' || g.status === 'LATE') execCount += g._count.status;
            if (g.status === 'MISSED') missedCount += g._count.status;
        });

        res.json({
            currentScore: user?.current_discipline_score || 0,
            history,
            todayStats: {
                executed: execCount,
                missed: missedCount
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
