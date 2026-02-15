
import prisma from '../../db';
import { SubscriptionTier } from '@prisma/client';

export const SUBSCRIPTION_LIMITS = {
    [SubscriptionTier.FREE]: {
        max_actions: 3,
        max_goals: 3,
        max_teams: 1,
        enforcement_mode: 'SOFT_ONLY'
    },
    [SubscriptionTier.INDIVIDUAL_PRO]: {
        max_actions: Infinity,
        max_goals: Infinity,
        max_teams: 1,
        enforcement_mode: 'HARD'
    },
    [SubscriptionTier.TEAM_ENTERPRISE]: {
        max_actions: Infinity,
        max_goals: Infinity,
        max_teams: Infinity,
        enforcement_mode: 'CUSTOM'
    }
};

export class SubscriptionService {
    static async getSubscription(userId: string) {
        return prisma.subscription.findUnique({
            where: { user_id: userId }
        });
    }

    static async assignTier(userId: string, tier: SubscriptionTier) {
        // Upsert subscription
        return prisma.subscription.upsert({
            where: { user_id: userId },
            update: { plan_tier: tier, updated_at: new Date() },
            create: {
                user_id: userId,
                plan_tier: tier,
                start_date: new Date()
            }
        });
    }

    static async checkActionLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
        const sub = await this.getSubscription(userId);
        const tier = sub?.plan_tier || SubscriptionTier.FREE;
        const limit = SUBSCRIPTION_LIMITS[tier].max_actions;

        if (limit === Infinity) return { allowed: true };

        const count = await prisma.action.count({
            where: { user_id: userId }
        });

        if (count >= limit) {
            return {
                allowed: false,
                message: `Plan limit reached. ${tier} tier allows max ${limit} actions.`
            };
        }

        return { allowed: true };
    }

    static async checkGoalLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
        const sub = await this.getSubscription(userId);
        const tier = sub?.plan_tier || SubscriptionTier.FREE;
        const limit = SUBSCRIPTION_LIMITS[tier].max_goals;

        if (limit === Infinity) return { allowed: true };

        const count = await prisma.goal.count({
            where: { user_id: userId }
        });

        if (count >= limit) {
            return {
                allowed: false,
                message: `Plan limit reached. ${tier} tier allows max ${limit} goals.`
            };
        }

        return { allowed: true };
    }

    static async checkTeamLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
        const sub = await this.getSubscription(userId);
        const tier = sub?.plan_tier || SubscriptionTier.FREE;
        const limit = SUBSCRIPTION_LIMITS[tier].max_teams;

        if (limit === Infinity) return { allowed: true };

        const count = await prisma.team.count({
            where: { owner_id: userId }
        });

        if (count >= limit) {
            return {
                allowed: false,
                message: `Plan limit reached. ${tier} tier allows max ${limit} teams.`
            };
        }

        return { allowed: true };
    }
}
