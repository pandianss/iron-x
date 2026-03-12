import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// In-memory cache for enforcement state
const enforcementCache = new Map<string, { lockedUntil: Date | null, mode: string, expiry: number }>();

export const policyEnforcementMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Exempt routes
    const isExempt = req.originalUrl.includes('/auth/') ||
        req.originalUrl.includes('/discipline/state') ||
        req.originalUrl.includes('/discipline/refresh');

    if (isExempt) {
        return next();
    }

    // Identify user (assuming auth middleware has ran and attached user to req)
    const userId = (req as any).user?.id || req.body.user_id || req.body.userId;

    if (!userId) {
        return next();
    }

    try {
        let state = enforcementCache.get(userId);
        const now = Date.now();

        if (!state || state.expiry < now) {
            // Cache miss or expired
            const user = await prisma.user.findUnique({
                where: { user_id: userId },
                select: { locked_until: true, enforcement_mode: true }
            });

            state = {
                lockedUntil: user?.locked_until || null,
                mode: user?.enforcement_mode || 'NONE',
                expiry: now + 60000 // 60s TTL
            };
            enforcementCache.set(userId, state);
        }

        if (!state) return next();

        // 1. HARD Lockout Enforcement
        if (state.lockedUntil && new Date(state.lockedUntil) > new Date()) {
            return res.status(423).json({
                code: 'HARD_LOCKOUT',
                lockedUntil: state.lockedUntil.toISOString(),
                message: 'Your account is under hard lockout due to discipline breach. Access restricted.'
            });
        }

        // 2. SOFT Enforcement Mode
        if (state.mode === 'SOFT') {
            (req as any).restrictedMode = true;
        }

        next();
    } catch (error) {
        console.error('Policy enforcement error:', error);
        next(); // Fail open for continuity, or closed for security? Open for MVP.
    }
};
