import { Request, Response } from 'express';
import { singleton, inject } from 'tsyringe';
import { SecurityService } from './security.service';
import prisma from '../../db';
import { AuthRequest } from '../../middleware/authMiddleware';
import { AppError } from '../../utils/AppError';
import { comparePassword } from '../../utils/auth';

@singleton()
export class SecurityController {
    constructor(
        @inject(SecurityService) private securityService: SecurityService
    ) { }

    /**
     * Initial setup for MFA. Generates secret and QR code.
     */
    setupMFA = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        if (!userId) throw new AppError('Unauthorized', 401);

        const user = await prisma.user.findUnique({
            where: { user_id: userId }
        });

        if (!user) throw new AppError('User not found', 404);

        // Generate new secret
        const secret = this.securityService.generateSecret();
        const qrCode = await this.securityService.generateQRCode(user.email, secret);

        // We don't save the secret yet. We wait for verification.
        // We return the secret and QR code for the frontend to show.
        // The secret is needed for the confirmation step.
        return res.json({
            secret,
            qrCode
        });
    };

    /**
     * Verify and enable MFA for a user.
     */
    verifyMFA = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        const { token, secret } = req.body;

        if (!userId) throw new AppError('Unauthorized', 401);
        if (!token || !secret) throw new AppError('Token and secret are required', 400);

        // Verify the token against the provided secret
        const isValid = this.securityService.verifyToken(token, secret);
        if (!isValid) {
            throw new AppError('Invalid MFA token', 401);
        }

        // Enable MFA in DB
        await prisma.user.update({
            where: { user_id: userId },
            data: {
                mfa_enabled: true,
                mfa_secret: secret
            }
        });

        return res.json({
            success: true,
            message: 'MFA enabled successfully'
        });
    };

    /**
     * Disable MFA. Requires password verification and current MFA token.
     */
    disableMFA = async (req: AuthRequest, res: Response) => {
        const userId = req.user?.userId;
        const { password, token } = req.body;

        if (!userId) throw new AppError('Unauthorized', 401);

        const user = await prisma.user.findUnique({
            where: { user_id: userId }
        }) as any;

        if (!user) throw new AppError('User not found', 404);

        // 1. Verify Password
        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            throw new AppError('Invalid password', 401);
        }

        // 2. Verify MFA Token if enabled
        if (user.mfa_enabled) {
            if (!token) throw new AppError('MFA token required', 400);
            const isValid = this.securityService.verifyToken(token, user.mfa_secret!);
            if (!isValid) {
                throw new AppError('Invalid MFA token', 401);
            }
        }

        // 3. Disable
        await prisma.user.update({
            where: { user_id: userId },
            data: {
                mfa_enabled: false,
                mfa_secret: null
            }
        });

        return res.json({
            success: true,
            message: 'MFA disabled successfully'
        });
    };
}
