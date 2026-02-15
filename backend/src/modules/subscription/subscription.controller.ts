import { Response, NextFunction } from 'express';
import { container, autoInjectable, inject } from 'tsyringe';
import { AuthRequest } from '../../middleware/authMiddleware';
import { SubscriptionService } from './subscription.service';
import { SubscriptionTier } from '@prisma/client';
import { BadRequestError, UnauthorizedError } from '../../utils/AppError';

@autoInjectable()
export class SubscriptionController {
    constructor(
        @inject(SubscriptionService) private subscriptionService: SubscriptionService
    ) { }

    assignTier = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { targetUserId, tier } = req.body;

            if (!Object.values(SubscriptionTier).includes(tier)) {
                throw new BadRequestError('Invalid tier');
            }

            const subscription = await this.subscriptionService.assignTier(targetUserId, tier);
            res.json(subscription);
        } catch (error) {
            next(error);
        }
    };

    getMySubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
            if (!userId) throw new UnauthorizedError();

            const subscription = await this.subscriptionService.getSubscription(userId);
            res.json(subscription || { plan_tier: SubscriptionTier.FREE });
        } catch (error) {
            next(error);
        }
    };
}
