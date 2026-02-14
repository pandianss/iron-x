import { Request, Response, NextFunction } from 'express';
import prisma from '../db';
import { Logger } from '../utils/logger';

export const requireRole = (allowedRoles: string[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized: No user ID found' });
            }

            const user = await prisma.user.findUnique({
                where: { user_id: userId },
                include: { role: true }
            });

            if (!user) {
                return res.status(401).json({ error: 'Unauthorized: User not found' });
            }

            // If user has no role, or role name is not in allowed list
            if (!user.role || !allowedRoles.includes(user.role.name)) {
                Logger.warn(`[Auth] Access denied for user ${userId}. Required: ${allowedRoles}, Actual: ${user.role?.name || 'NONE'}`);
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }

            next();
        } catch (error) {
            Logger.error('[Auth] Role verification failed', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};
