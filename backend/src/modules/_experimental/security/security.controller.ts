
import { Request, Response } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { SecurityService } from './security.service';
import { AuthRequest } from '../../middleware/authMiddleware';
import prisma from '../../db';

@autoInjectable()
export class SecurityController {
    constructor(
        @inject(SecurityService) private securityService: SecurityService
    ) { }

    setupMFA = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) return res.sendStatus(401);

        try {
            const user = await prisma.user.findUnique({
                where: { user_id: userId }
            }) as any;

            if (!user) return res.status(404).json({ message: 'User not found' });
            if (user.mfa_enabled) {
                return res.status(400).json({ message: 'MFA is already enabled' });
            }

            const secret = this.securityService.generateSecret();
            const qrCode = await this.securityService.generateQRCode(user.email, secret);

            // Store the secret TEMPORARILY in a way that it's not yet "enabled"
            // We'll update the user model with the secret now, but mfa_enabled remains false
            // until they verify their first code.
            await prisma.user.update({
                where: { user_id: userId },
                data: { mfa_secret: secret } as any
            });

            res.json({ secret, qrCode });
        } catch (error) {
            console.error('MFA Setup Error:', error);
            res.status(500).json({ message: 'Failed to setup MFA' });
        }
    };

    verifyMFA = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        const { token } = req.body;

        if (!userId || !token) return res.status(400).json({ message: 'Token is required' });

        try {
            const user = await prisma.user.findUnique({
                where: { user_id: userId }
            }) as any;

            if (!user?.mfa_secret) {
                return res.status(400).json({ message: 'MFA setup not initiated' });
            }

            const isValid = this.securityService.verifyToken(token, user.mfa_secret);

            if (isValid) {
                await prisma.user.update({
                    where: { user_id: userId },
                    data: { mfa_enabled: true } as any
                });
                res.json({ message: 'MFA enabled successfully' });
            } else {
                res.status(400).json({ message: 'Invalid MFA token' });
            }
        } catch (error) {
            console.error('MFA Verification Error:', error);
            res.status(500).json({ message: 'Failed to verify MFA' });
        }
    };

    disableMFA = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;

        if (!userId) return res.sendStatus(401);

        try {
            await prisma.user.update({
                where: { user_id: userId },
                data: {
                    mfa_enabled: false,
                    mfa_secret: null
                } as any
            });
            res.json({ message: 'MFA disabled successfully' });
        } catch (error) {
            console.error('MFA Disable Error:', error);
            res.status(500).json({ message: 'Failed to disable MFA' });
        }
    };
}
