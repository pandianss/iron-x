
import { Request, Response } from 'express';
import { SSOService } from './sso.service';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me';

export class SSOController {
    static async login(req: Request, res: Response) {
        try {
            const { domain } = req.query;
            if (!domain || typeof domain !== 'string') {
                return res.status(400).json({ message: 'Domain is required' });
            }

            const redirectUrl = await SSOService.generateAuthRequest(domain);
            // In a real app, strict redirect. Here we might return JSON for frontend to redirect.
            // Let's redirect directly for standard SAML flow.
            res.redirect(redirectUrl);
        } catch (error: any) {
            console.error('SSO Login Error:', error);
            res.status(400).json({ message: error.message });
        }
    }

    static async callback(req: Request, res: Response) {
        try {
            const { SAMLResponse } = req.body;
            if (!SAMLResponse) {
                return res.status(400).json({ message: 'SAMLResponse is required' });
            }

            const { email, issuer } = await SSOService.validateResponse(SAMLResponse);

            // Find or create user? 
            // Phase 1: Fail if user doesn't exist.
            // Assumption: User must be provisioned first.
            const user = await import('../../db').then(m => m.default.user.findUnique({ where: { email } }));

            if (!user) {
                return res.status(401).json({ message: 'User not found in system' });
            }

            // Issue JWT
            const token = sign(
                { userId: user.user_id, email: user.email, role: 'USER' }, // Mock role
                JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Redirect to frontend dashboard with token
            // In production, use a secure cookie or intermediate page.
            // For MVP: redirect with query param (Not secure, but functional for demo)
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
            res.redirect(`${frontendUrl}/sso-callback?token=${token}`);

        } catch (error: any) {
            console.error('SSO Callback Error:', error);
            res.status(401).json({ message: 'SSO Authentication Failed' });
        }
    }
}
