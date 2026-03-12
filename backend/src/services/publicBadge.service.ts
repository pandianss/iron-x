import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'tsyringe';

@injectable()
export class PublicBadgeService {
    constructor(@inject('PrismaClient') private prisma: PrismaClient) { }

    async getUserBadgeData(userId: string) {
        const user = await (this.prisma.user.findUnique({
            where: { user_id: userId },
            select: {
                current_discipline_score: true,
                discipline_classification: true,
                public_score_enabled: true,
                trust_tier: true
            }
        }) as any);

        if (!user || !user.public_score_enabled) return null;

        return {
            score: user.current_discipline_score,
            classification: user.discipline_classification,
            tier: user.trust_tier
        };
    }

    generateSvgBadge(data: { score: number, classification: string, tier: string }): string {
        const color = this.getBadgeColor(data.classification);
        return `
            <svg width="200" height="40" xmlns="http://www.w3.org/2000/svg">
                <rect width="120" height="40" fill="#333" rx="5"/>
                <rect x="120" width="80" height="40" fill="${color}" rx="5"/>
                <text x="10" y="25" fill="#fff" font-family="Arial" font-size="14">Iron-X Score</text>
                <text x="135" y="25" fill="#fff" font-family="Arial" font-size="20" font-weight="bold">${data.score}</text>
            </svg>
        `.trim();
    }

    private getBadgeColor(classification: string): string {
        switch (classification) {
            case 'HIGH_RELIABILITY': return '#4CAF50';
            case 'STABLE': return '#2196F3';
            case 'DRIFTING': return '#FFC107';
            case 'BREACH': return '#F44336';
            default: return '#9E9E9E';
        }
    }
}
