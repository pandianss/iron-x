import prisma from '../db';

export class DisciplineService {
    async getState(userId: string) {
        // Pure read-model adapter
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            select: { current_discipline_score: true, discipline_classification: true }
        });

        if (!user) throw new Error('User not found');

        return {
            score: user.current_discipline_score,
            status: user.discipline_classification || 'STABLE',
            // Mock data for UI - eventually comes from Read Model / Audit Log
            timeSinceLastViolation: '00:00:00',
            countdownToNextCheck: '00:00:00',
            decayRate: 0
        };
    }

    // ... other read methods remain as simple queries ...
    async getPressure(userId: string) { return {}; }
    async getPredictions(userId: string) { return []; }
    async getConstraints(userId: string) { return {}; }
    async getHistory(userId: string) { return []; }
}

export const disciplineService = new DisciplineService();
