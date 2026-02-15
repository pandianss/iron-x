
import { Response } from 'express';
import { AuthRequest } from '../../middleware/authMiddleware';
import { SubscriptionService } from './subscription.service';
import { SubscriptionTier } from '@prisma/client';

export const assignTier = async (req: AuthRequest, res: Response) => {
    try {
        const { targetUserId, tier } = req.body;

        // Basic validation
        if (!Object.values(SubscriptionTier).includes(tier)) {
            return res.status(400).json({ message: 'Invalid tier' });
        }

        const subscription = await SubscriptionService.assignTier(targetUserId, tier);
        res.json(subscription);
    } catch (error) {
        console.error('Assign tier error', error);
        res.status(500).json({ message: 'Failed to assign tier' });
    }
};

export const getMySubscription = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.sendStatus(401);

        const subscription = await SubscriptionService.getSubscription(userId);
        res.json(subscription || { plan_tier: SubscriptionTier.FREE });
    } catch (error) {
        console.error('Get subscription error', error);
        res.status(500).json({ message: 'Failed to get subscription' });
    }
};
