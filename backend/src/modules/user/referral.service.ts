
import { PrismaClient } from '@prisma/client';
import { container } from 'tsyringe';
import { nanoid } from 'nanoid';

export class ReferralService {
    private prisma: PrismaClient;

    constructor() {
        this.prisma = container.resolve<PrismaClient>('PrismaClient');
    }

    async getReferralCode(userId: string) {
        let user = await this.prisma.user.findUnique({
            where: { user_id: userId },
            select: { referral_code: true }
        });

        if (!user?.referral_code) {
            const newCode = `IRON-${nanoid(8).toUpperCase()}`;
            user = await this.prisma.user.update({
                where: { user_id: userId },
                data: { referral_code: newCode },
                select: { referral_code: true }
            });
        }

        return user?.referral_code;
    }

    async applyReferral(userId: string, code: string) {
        // 1. Validate code
        const referrer = await this.prisma.user.findUnique({
            where: { referral_code: code }
        });

        if (!referrer) {
            throw new Error('Invalid referral code');
        }

        if (referrer.user_id === userId) {
            throw new Error('Cannot refer yourself');
        }

        // 2. Check if user already has a referrer
        const user = await this.prisma.user.findUnique({
            where: { user_id: userId }
        });

        if (user?.referred_by) {
            throw new Error('Referral already applied');
        }

        // 3. Update user
        await this.prisma.user.update({
            where: { user_id: userId },
            data: { referred_by: referrer.user_id }
        });

        return { success: true, referrerName: referrer.name };
    }

    async getReferralStats(userId: string) {
        const referral_code = await this.getReferralCode(userId);
        const count = await this.prisma.user.count({
            where: { referred_by: userId }
        });

        // Get referred users who reached OPERATOR+ (dummy logic for now, could be based on subscription)
        const activeReferrals = await this.prisma.user.findMany({
            where: { referred_by: userId, role: { name: 'OPERATOR' } },
            select: { name: true, created_at: true }
        });

        return {
            referral_code,
            referral_count: count,
            active_referrals: activeReferrals.length,
            reward_points: activeReferrals.length * 100 // Example: 100 points per operator referred
        };
    }
}
