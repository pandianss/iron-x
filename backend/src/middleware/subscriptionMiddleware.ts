import { Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { AuthRequest } from './authMiddleware';
import { QuotaService, ResourceType } from '../modules/subscription/quota.service';
import { SubscriptionService } from '../modules/subscription/subscription.service';
import { SubscriptionTier } from '@prisma/client';

export const checkAccountStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const subscriptionService = container.resolve(SubscriptionService);
        const status = await subscriptionService.getAccountStatus(userId);
        if (status.status === 'HARD_LOCKED') {
            return res.status(403).json({
                message: status.message,
                code: 'ACCOUNT_HARD_LOCKED'
            });
        }
        next();
    } catch (error) {
        console.error('Account status check error', error);
        res.status(500).json({ message: 'Server error during status check' });
    }
};

const validateQuota = (resource: ResourceType) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);

        try {
            const quotaService = container.resolve(QuotaService);
            const check = await quotaService.checkQuota(userId, resource);
            if (!check.allowed) {
                return res.status(403).json({
                    message: check.message || 'Plan limit exceeded',
                    code: 'PLAN_LIMIT_EXCEEDED'
                });
            }
            next();
        } catch (error) {
            console.error(`Quota check error for ${resource}`, error);
            res.status(500).json({ message: 'Server error during quota check' });
        }
    };
};

export const checkActionLimit = validateQuota('ACTIONS');
export const checkGoalLimit = validateQuota('GOALS');
export const checkTeamLimit = validateQuota('TEAMS');


export const checkStrictModeAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const { is_strict } = req.body;
        if (is_strict !== true) return next();

        const subscriptionService = container.resolve(SubscriptionService);
        const sub = await subscriptionService.getSubscription(userId);
        const tier = sub?.plan_tier || SubscriptionTier.FREE;

        if (tier === SubscriptionTier.FREE) {
            return res.status(403).json({
                message: 'PLAN_LIMIT_EXCEEDED: Strict Mode is a PRO feature.',
                code: 'PLAN_LIMIT_EXCEEDED_FEATURE'
            });
        }
        next();
    } catch (error) {
        console.error('Subscription check error', error);
        res.status(500).json({ message: 'Server error during plan check' });
    }
};
