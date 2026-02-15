import { Request, Response, NextFunction } from 'express';
import { governanceGuard } from './governanceGuard';

/**
 * @deprecated Use governanceGuard instead.
 */
export const outcomeGovernanceMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.warn('[DEPRECATED] outcomeGovernanceMiddleware usage detected. Please migrate to governanceGuard.');
    return governanceGuard(req as any, res, next);
};
