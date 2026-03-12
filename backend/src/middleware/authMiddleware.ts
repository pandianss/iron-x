import { Request, Response, NextFunction } from 'express';
import { firebaseAuth } from '../config/firebase';
import prisma from '../db';

export interface AuthRequest<P = any, ResBody = any, ReqBody = any, ReqQuery = any> extends Request<P, ResBody, ReqBody, ReqQuery> {
    user?: {
        userId: string;
        email?: string;
        role?: {
            name: string;
            policy?: any;
        };
    };
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.warn(`[Auth] Missing token from ${req.ip} for ${req.path}`);
        return res.status(401).json({ error: 'Authentication required', code: 'NO_TOKEN' });
    }

    try {
        const decodedToken = await firebaseAuth.verifyIdToken(token);

        if (!decodedToken || !decodedToken.uid) {
            throw new Error('Invalid token payload');
        }

        // Verify user exists and is active using Firebase UID or Email fallback initially (for sync mapping)
        const user = await (prisma as any).user.findFirst({
            where: {
                OR: [
                    { firebase_uid: decodedToken.uid },
                    { email: decodedToken.email || undefined }
                ]
            },
            include: {
                role: {
                    include: { policy: true }
                }
            }
        });

        if (!user) {
            console.error(`[Auth] User matching ${decodedToken.uid} not found`);
            return res.status(401).json({ error: 'Invalid authentication', code: 'USER_NOT_FOUND' });
        }

        (req as AuthRequest).user = {
            userId: user.user_id,
            email: user.email,
            role: user.role ? { name: user.role.name, policy: user.role.policy } : undefined
        };

        next();
    } catch (err: any) {
        console.warn(`[Auth] Token verification failed from ${req.ip}: ${err.message}`);
        return res.status(403).json({
            error: 'Invalid or expired token',
            code: err.code === 'auth/id-token-expired' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
        });
    }
};
