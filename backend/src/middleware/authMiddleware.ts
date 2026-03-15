import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import { container } from 'tsyringe';
import { Logger } from '../core/logger';

export interface AuthRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
    user?: {
        userId: string;
        email?: string;
        role?: {
            name: string;
            policy?: any;
        };
        orgId?: string;
    };
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        Logger.warn(`[Auth] Missing token from ${req.ip} for ${req.path}`);
        return res.status(401).json({ error: 'Authentication required', code: 'NO_TOKEN' });
    }

    try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);

        if (!decodedToken || !decodedToken.uid) {
            throw new Error('Invalid token payload');
        }

        // Security Hardening: Enforce email verification for production-grade security
        // In some dev scenarios, you might want to disable this via env var.
        if (process.env.NODE_ENV === 'production' && !decodedToken.email_verified) {
            Logger.warn(`[Auth] Attempted login with unverified email: ${decodedToken.email}`);
            return res.status(403).json({ 
                error: 'Email verification required', 
                code: 'EMAIL_NOT_VERIFIED' 
            });
        }

        // Verify user exists using Firebase UID ONLY to prevent account hijacking via email spoofing
        const prisma = container.resolve('PrismaClient' as any) as any;
        const user = await prisma.user.findUnique({
            where: { firebase_uid: decodedToken.uid },
            include: {
                role: {
                    include: { policy: true }
                }
            }
        });

        if (!user) {
            Logger.error(`[Auth] User matching Firebase UID ${decodedToken.uid} not found in database.`);
            return res.status(401).json({ error: 'Invalid authentication', code: 'USER_NOT_FOUND' });
        }

        (req as AuthRequest).user = {
            userId: user.user_id,
            email: user.email,
            role: user.role ? { 
                name: user.role.name, 
                policy: user.role.policy 
            } : undefined,
            orgId: user.org_id || undefined
        };

        next();
    } catch (err: any) {
        Logger.warn(`[Auth] Token verification failed from ${req.ip}: ${err.message}`);
        return res.status(403).json({
            error: 'Invalid or expired token',
            code: err.code === 'auth/id-token-expired' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
        });
    }
};
