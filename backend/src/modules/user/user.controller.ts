import { Response, NextFunction } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { PolicyService } from '../policies/policy.service';
import prisma from '../../infrastructure/db';
import { AuthRequest } from '../../middleware/authMiddleware';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../utils/AppError';
import { SubscriptionService } from '../subscription/subscription.service';
import { container } from 'tsyringe';

@autoInjectable()
export class UserController {
    constructor(
        @inject(PolicyService) private policyService: PolicyService
    ) { }

    updateEnforcementMode = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const { mode } = req.body;
            const userId = req.user!.userId;

            if (!['NONE', 'SOFT', 'HARD'].includes(mode)) {
                throw new BadRequestError('Invalid mode');
            }

            await this.policyService.setEnforcementMode(userId, mode);
            res.json({ message: 'Enforcement mode updated', mode });
        } catch (error) {
            next(error);
        }
    };

    getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.userId;
            const user = await prisma.user.findUnique({
                where: { user_id: userId },
                include: {
                    team_memberships: {
                        include: {
                            team: {
                                select: { team_id: true, name: true, owner_id: true }
                            }
                        }
                    },
                    teams_owned: {
                        select: { team_id: true, name: true }
                    }
                }
            });

            if (!user) throw new NotFoundError('User not found');

            const { password_hash, ...profile } = user;
            res.json(profile);
        } catch (error) {
            next(error);
        }
    };

    togglePublicScore = async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user!.userId;
            
            const subscriptionService = container.resolve(SubscriptionService);
            const sub = await subscriptionService.getSubscription(userId);
            
            if (!sub || sub.plan_tier === 'FREE') {
                throw new ForbiddenError('Public Badge requires OPERATOR tier.');
            }

            const user = await prisma.user.findUnique({ where: { user_id: userId } });
            if (!user) throw new NotFoundError('User not found');

            const updated = await prisma.user.update({
                where: { user_id: userId },
                data: { public_score_enabled: !user.public_score_enabled }
            });

            res.json({ public_score_enabled: updated.public_score_enabled });
        } catch (error) {
            next(error);
        }
    };
}
