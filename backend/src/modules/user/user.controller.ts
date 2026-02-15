import { Response, NextFunction } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { PolicyService } from '../policies/policy.service';
import prisma from '../../db';
import { AuthRequest } from '../../middleware/authMiddleware';
import { BadRequestError, NotFoundError } from '../../utils/AppError';

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
}
