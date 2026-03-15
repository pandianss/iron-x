import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import { Logger } from '../../core/logger';

export enum TrustTier {
    PROVISIONAL = 'PROVISIONAL',
    STANDARD = 'STANDARD',
    TRUSTED = 'TRUSTED',
    AUTONOMOUS = 'AUTONOMOUS'
}

@injectable()
export class TrustTierService {
    constructor(@inject('PrismaClient') private prisma: PrismaClient) { }

    async evaluateTierUpdate(userId: string): Promise<string> {
        const user = await (this.prisma.user.findUnique({
            where: { user_id: userId },
            select: {
                trust_tier: true,
                current_discipline_score: true,
                created_at: true
            }
        }) as any);

        if (!user) return TrustTier.PROVISIONAL;

        const currentTier = user.trust_tier as TrustTier;
        const currentScore = user.current_discipline_score;

        // 1. Demotion check: DS < 50
        if (currentScore < 50 && currentTier !== TrustTier.PROVISIONAL) {
            const newTier = this.getLowerTier(currentTier);
            await this.updateUserTier(userId, newTier);
            Logger.warn(`[TrustTier] User ${userId} demoted to ${newTier} due to low DS (${currentScore})`);
            return newTier;
        }

        // 2. Promotion checks
        // We need score history for sustained checks
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

        if (currentTier === TrustTier.PROVISIONAL || currentTier === TrustTier.STANDARD) {
            // Check for TRUSTED promotion: DS >= 85 for 30 days
            const sustained85 = await this.hasSustainedScore(userId, thirtyDaysAgo, 85);
            if (sustained85) {
                await this.updateUserTier(userId, TrustTier.TRUSTED);
                return TrustTier.TRUSTED;
            }
        }

        if (currentTier === TrustTier.TRUSTED) {
            // Check for AUTONOMOUS promotion: DS >= 90 for 60 days
            const sustained90 = await this.hasSustainedScore(userId, sixtyDaysAgo, 90);
            if (sustained90) {
                await this.updateUserTier(userId, TrustTier.AUTONOMOUS);
                return TrustTier.AUTONOMOUS;
            }
        }

        // Promotion from PROVISIONAL to STANDARD (simple threshold, e.g. score > 70 for 7 days)
        if (currentTier === TrustTier.PROVISIONAL && currentScore >= 70) {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sustained70 = await this.hasSustainedScore(userId, sevenDaysAgo, 70);
            if (sustained70) {
                await this.updateUserTier(userId, TrustTier.STANDARD);
                return TrustTier.STANDARD;
            }
        }

        return currentTier;
    }

    private async hasSustainedScore(userId: string, since: Date, threshold: number): Promise<boolean> {
        const scores = await this.prisma.disciplineScore.findMany({
            where: {
                user_id: userId,
                date: { gte: since }
            },
            select: { score: true }
        });

        // Must have at least some data points
        if (scores.length < 5) return false;

        return scores.every(s => s.score >= threshold);
    }

    private getLowerTier(tier: TrustTier): TrustTier {
        const tiers = [TrustTier.PROVISIONAL, TrustTier.STANDARD, TrustTier.TRUSTED, TrustTier.AUTONOMOUS];
        const index = tiers.indexOf(tier);
        return index > 0 ? tiers[index - 1] : TrustTier.PROVISIONAL;
    }

    private async updateUserTier(userId: string, tier: TrustTier) {
        await (this.prisma.user.update({
            where: { user_id: userId },
            data: { trust_tier: tier } as any
        }) as any);
        Logger.info(`[TrustTier] User ${userId} tier updated to ${tier}`);
    }

    async getTierRequirements(userId: string): Promise<any> {
        const user = await (this.prisma.user.findUnique({
            where: { user_id: userId },
            select: { trust_tier: true }
        }) as any);

        const tier = user?.trust_tier || TrustTier.PROVISIONAL;

        const requirements: Record<string, any> = {
            [TrustTier.PROVISIONAL]: { next: TrustTier.STANDARD, requirement: 'Maintain DS >= 70 for 7 days' },
            [TrustTier.STANDARD]: { next: TrustTier.TRUSTED, requirement: 'Maintain DS >= 85 for 30 days' },
            [TrustTier.TRUSTED]: { next: TrustTier.AUTONOMOUS, requirement: 'Maintain DS >= 90 for 60 days' },
            [TrustTier.AUTONOMOUS]: { next: null, requirement: 'Top Tier Reached' }
        };

        return {
            currentTier: tier,
            ...requirements[tier]
        };
    }
}
