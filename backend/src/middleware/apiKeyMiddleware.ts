import { Request, Response, NextFunction } from 'express';

/**
 * API Key Middleware (Placeholder)
 * Original implementation was dependent on missing experimental modules.
 * Standard authentication is handled via JWT/AuthMiddleware.
 */
export const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Pass-through until Integration module is properly implemented/restored.
    return next();
};
