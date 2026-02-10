
import prisma from '../db';

export const calculateUserScore = async (userId: string) => {
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const instances = await prisma.actionInstance.findMany({
        where: {
            user_id: userId,
            scheduled_date: {
                gte: sevenDaysAgo,
                lte: today
            },
            status: {
                in: ['COMPLETED', 'LATE', 'MISSED']
            }
        }
    });

    if (instances.length === 0) return;

    let totalScheduled = instances.length;
    let executionCount = instances.filter(i => i.status === 'COMPLETED' || i.status === 'LATE').length;
    let onTimeCount = instances.filter(i => i.status === 'COMPLETED').length;

    let executionRate = totalScheduled > 0 ? executionCount / totalScheduled : 0;
    let onTimeRate = executionCount > 0 ? onTimeCount / executionCount : 0; // onTime / Executed actions? Or scheduled? Usually onTime / Scheduled or Executed. Logic previously: totalOnTime / totalExecuted. That seems odd if totalExecuted is 0.

    // Let's stick to previous logic: totalOnTime / totalExecuted
    // But calculateScore used: totalOnTime / totalExecuted. If executed is 0, onTimeRate is 0.

    let rawScore = (executionRate * 0.7) + (onTimeRate * 0.3);
    let score = Math.round(rawScore * 100);

    score = Math.max(0, Math.min(100, score));

    await prisma.disciplineScore.upsert({
        where: {
            user_id_date: {
                user_id: userId,
                date: today
            }
        },
        update: {
            score: score,
            execution_rate: executionRate,
            on_time_rate: onTimeRate,
            calculated_at: now
        },
        create: {
            user_id: userId,
            date: today,
            score: score,
            execution_rate: executionRate,
            on_time_rate: onTimeRate
        }
    });

    await prisma.user.update({
        where: { user_id: userId },
        data: { current_discipline_score: score }
    });

    // console.log(`Updated score for user ${userId}: ${score}`);
};

export const calculateDisciplineScore = async () => {
    console.log('Running calculateDisciplineScore job...');
    try {
        const users = await prisma.user.findMany({ select: { user_id: true } });
        for (const user of users) {
            await calculateUserScore(user.user_id);
        }
    } catch (error) {
        console.error('Error calculating discipline scores', error);
    }
};
