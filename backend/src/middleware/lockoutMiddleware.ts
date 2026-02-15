import { Request, Response, NextFunction } from 'express';
import { governanceGuard } from './governanceGuard';

/**
 * @deprecated Use governanceGuard instead.
 * Keeping this for backward compatibility during migration if needed,
 * but it just wraps the new guard or logs a warning.
 */
export const checkLockout = (req: Request, res: Response, next: NextFunction) => {
    console.warn('[DEPRECATED] checkLockout middleware usage detected. Please migrate to governanceGuard.');
    // For now, we just pass through to governanceGuard if we want strict equivalence,
    // or we can leave it as is if we want to ensure no breakage yet.
    // However, since we updated the routes, this shouldn't be called.
    // Let's forward to governanceGuard to be safe.
    return governanceGuard(req as any, res, next);
};
