
import { Request, Response, NextFunction } from 'express';
import prisma from '../db';

/**
 * Middleware to prevent modifications if user is locked out.
 * To be used on POST/PUT/DELETE routes for Goals and Actions.
 */
export const checkLockout = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.userId;
        if (!userId) return res.sendStatus(401);

        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            select: { locked_until: true }
        });

        if (user && user.locked_until && user.locked_until > new Date()) {
            return res.status(403).json({
                error: 'Account is locked due to discipline failure. Read-only mode active.',
                lockedUntil: user.locked_until
            });
        }

        next();
    } catch (error) {
        console.error('Lockout check failed', error);
        res.status(500).json({ error: 'Internal server error during lockout check' });
    }
};
