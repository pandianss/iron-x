import prisma from '../../db';
import { SubscriptionTier } from '@prisma/client';
import { SUBSCRIPTION_LIMITS, SubscriptionService } from './subscription.service';

export type ResourceType = 'ACTIONS' | 'GOALS' | 'TEAMS' | 'WEBHOOKS' | 'API_KEYS';

export class QuotaService {
    static async checkQuota(userId: string, resource: ResourceType): Promise<{ allowed: boolean; message?: string }> {
        const sub = await SubscriptionService.getSubscription(userId);
        const tier = sub?.plan_tier || SubscriptionTier.FREE;
        const limits = (SUBSCRIPTION_LIMITS as any)[tier];

        // Ensure account is not hard-locked
        const accountStatus = await SubscriptionService.getAccountStatus(userId);
        if (accountStatus.status === 'HARD_LOCKED') {
            return { allowed: false, message: accountStatus.message };
        }

        let count = 0;
        let limit = Infinity;

        switch (resource) {
            case 'ACTIONS':
                count = await prisma.action.count({ where: { user_id: userId } });
                limit = limits.max_actions;
                break;
            case 'GOALS':
                count = await prisma.goal.count({ where: { user_id: userId } });
                limit = limits.max_goals;
                break;
            case 'TEAMS':
                count = await prisma.team.count({ where: { owner_id: userId } });
                limit = limits.max_teams;
                break;
            case 'WEBHOOKS':
                // Check Org level if user tied to org
                const user = await (prisma as any).user.findUnique({ where: { user_id: userId } });
                if (user?.org_id) {
                    count = await (prisma as any).webhook.count({ where: { org_id: user.org_id } });
                }
                limit = limits.max_webhooks || 5; // Default for webhooks if not in limits
                break;
            case 'API_KEYS':
                const userKey = await (prisma as any).user.findUnique({ where: { user_id: userId } });
                if (userKey?.org_id) {
                    count = await (prisma as any).apiKey.count({ where: { org_id: userKey.org_id } });
                }
                limit = limits.max_api_keys || 3;
                break;
        }

        if (count >= limit) {
            return {
                allowed: false,
                message: `Resource limit reached for ${resource}. Current tier: ${tier} (Limit: ${limit}).`
            };
        }

        return { allowed: true };
    }
}
