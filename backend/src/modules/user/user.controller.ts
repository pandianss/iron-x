import { Request, Response } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { PolicyService } from '../policies/policy.service';
import prisma from '../../db';

@autoInjectable()
export class UserController {
    constructor(
        @inject(PolicyService) private policyService: PolicyService
    ) { }

    updateEnforcementMode = async (req: Request, res: Response) => {
        try {
            const { mode } = req.body;
            const userId = req.user!.userId;

            if (!['NONE', 'SOFT', 'HARD'].includes(mode)) {
                return res.status(400).json({ error: 'Invalid mode' });
            }

            await this.policyService.setEnforcementMode(userId, mode);
            res.json({ message: 'Enforcement mode updated', mode });
        } catch (error) {
            console.error('Error updating enforcement mode', error);
            res.status(500).json({ error: 'Failed to update enforcement mode' });
        }
    };

    getProfile = async (req: Request, res: Response) => {
        const userId = req.user!.userId;
        const user = await prisma.user.findUnique({
            where: { user_id: userId }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const { password_hash, ...profile } = user;
        res.json(profile);
    };
}
