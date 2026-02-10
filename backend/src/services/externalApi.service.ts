
import prisma from '../db';
import { CanonicalTransformer } from '../domain/canonical/transformer';
import { ActionV1, DisciplineScoreV1, PolicyV1 } from '../domain/canonical/models.v1';

export const ExternalApiService = {
    /**
     * Validates API Key (Simple implementation).
     * In production, use hashed keys in DB.
     * For MVP/Phase 8, we check against an env var or config.
     */
    async validateApiKey(key: string): Promise<boolean> {
        // Mock validation for reference integration
        return key === 'sk_test_discipline_ecosystem';
    },

    async getUserMetrics(userId: string): Promise<DisciplineScoreV1 | null> {
        // Get latest score
        const score = await prisma.disciplineScore.findFirst({
            where: { user_id: userId },
            orderBy: { date: 'desc' }
        });

        if (!score) return null;

        // Transform
        return CanonicalTransformer.toScoreV1(score);
    },

    async getActivePolicy(userId: string): Promise<PolicyV1 | null> {
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: { role: { include: { policy: true } } }
        });

        if (!user?.role?.policy) return null;

        return CanonicalTransformer.toPolicyV1(user.role.policy);
    }
};
