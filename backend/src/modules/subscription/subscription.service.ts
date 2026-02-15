import { singleton } from 'tsyringe';
import prisma from '../../db';
import { SubscriptionTier } from '@prisma/client';

export const SUBSCRIPTION_LIMITS = {
    [SubscriptionTier.FREE]: {
        max_actions: 3,
        max_goals: 3,
        max_teams: 1,
        max_webhooks: 0,
        max_api_keys: 0,
        enforcement_mode: 'SOFT_ONLY'
    },
    [SubscriptionTier.INDIVIDUAL_PRO]: {
        max_actions: Infinity,
        max_goals: Infinity,
        max_teams: 1,
        max_webhooks: 5,
        max_api_keys: 1,
        enforcement_mode: 'HARD'
    },
    [SubscriptionTier.TEAM_ENTERPRISE]: {
        max_actions: Infinity,
        max_goals: Infinity,
        max_teams: Infinity,
        max_webhooks: 20,
        max_api_keys: 10,
        enforcement_mode: 'CUSTOM'
    }
};

@singleton()
export class SubscriptionService {
    async getSubscription(userId: string) {
        return prisma.subscription.findUnique({
            where: { user_id: userId }
        });
    }

    async assignTier(userId: string, tier: SubscriptionTier) {
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

    async checkActionLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
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

    async checkGoalLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
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

    async checkTeamLimit(userId: string): Promise<{ allowed: boolean; message?: string }> {
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
    async lockAccount(userId: string, gracePeriodDays: number = 7) {
        const graceUntil = new Date();
        graceUntil.setDate(graceUntil.getDate() + gracePeriodDays);

        return (prisma as any).subscription.update({
            where: { user_id: userId },
            data: {
                is_locked: true,
                grace_period_until: graceUntil
            }
        });
    }

    async unlockAccount(userId: string) {
        return (prisma as any).subscription.update({
            where: { user_id: userId },
            data: {
                is_locked: false,
                grace_period_until: null
            }
        });
    }

    async getAccountStatus(userId: string) {
        const sub = await this.getSubscription(userId);
        if (!sub) return { status: 'OK' };

        if ((sub as any).is_locked) {
            const now = new Date();
            if ((sub as any).grace_period_until && now > (sub as any).grace_period_until) {
                return { status: 'HARD_LOCKED', message: 'Account hard-locked due to non-payment.' };
            }
            return { status: 'GRACE_PERIOD', message: 'Account in grace period. Please update payment method.', until: (sub as any).grace_period_until };
        }

        return { status: 'OK' };
    }
}
