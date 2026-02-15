import { singleton } from 'tsyringe';
import prisma from '../db';
import { CanonicalTransformer } from '../domain/canonical/transformer';
import { DisciplineScoreV1, PolicyV1 } from '../domain/canonical/models.v1';

@singleton()
export class ExternalApiService {
    async validateApiKey(key: string): Promise<boolean> {
        return key === 'sk_test_discipline_ecosystem';
    }

    async getUserMetrics(userId: string): Promise<DisciplineScoreV1 | null> {
        const score = await prisma.disciplineScore.findFirst({
            where: { user_id: userId },
            orderBy: { date: 'desc' }
        });

        if (!score) return null;

        return CanonicalTransformer.toScoreV1(score);
    }

    async getActivePolicy(userId: string): Promise<PolicyV1 | null> {
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: { role: { include: { policy: true } } }
        });

        if (!user?.role?.policy) return null;

        return CanonicalTransformer.toPolicyV1(user.role.policy);
    }
}
