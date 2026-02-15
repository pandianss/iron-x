import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';
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
        const payload = verifyToken(token) as any;

        if (!payload || !payload.userId) {
            throw new Error('Invalid token payload');
        }

        // Verify user exists and is active
        const user = await prisma.user.findUnique({
            where: { user_id: payload.userId },
            select: { user_id: true }
        });

        if (!user) {
            console.error(`[Auth] User ${payload.userId} not found`);
            return res.status(401).json({ error: 'Invalid authentication', code: 'USER_NOT_FOUND' });
        }

        (req as AuthRequest).user = {
            userId: payload.userId,
            email: (payload as any).email,
            role: (payload as any).role
        };
        next();
    } catch (err: any) {
        console.warn(`[Auth] Token verification failed from ${req.ip}: ${err.message}`);
        return res.status(403).json({
            error: 'Invalid or expired token',
            code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN'
        });
    }
};
