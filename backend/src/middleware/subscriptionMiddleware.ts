
import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware'; // Ensure this path is correct relative to middleware folder
import { SubscriptionService } from '../modules/subscription/subscription.service';
import { SubscriptionTier } from '@prisma/client';

export const checkActionLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const check = await SubscriptionService.checkActionLimit(userId);
        if (!check.allowed) {
            return res.status(403).json({
                message: check.message || 'Plan limit exceeded',
                code: 'PLAN_LIMIT_EXCEEDED'
            });
        }
        next();
    } catch (error) {
        console.error('Subscription check error', error);
        res.status(500).json({ message: 'Server error during plan check' });
    }
};

export const checkGoalLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const check = await SubscriptionService.checkGoalLimit(userId);
        if (!check.allowed) {
            return res.status(403).json({
                message: check.message || 'Plan limit exceeded',
                code: 'PLAN_LIMIT_EXCEEDED'
            });
        }
        next();
    } catch (error) {
        console.error('Subscription check error', error);
        res.status(500).json({ message: 'Server error during plan check' });
    }
};

export const checkTeamLimit = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const check = await SubscriptionService.checkTeamLimit(userId);
        if (!check.allowed) {
            return res.status(403).json({
                message: check.message || 'Plan limit exceeded',
                code: 'PLAN_LIMIT_EXCEEDED'
            });
        }
        next();
    } catch (error) {
        console.error('Subscription check error', error);
        res.status(500).json({ message: 'Server error during plan check' });
    }
};


export const checkStrictModeAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const { is_strict } = req.body;
        if (is_strict !== true) return next();

        const sub = await SubscriptionService.getSubscription(userId);
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
