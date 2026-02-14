import { Request, Response, NextFunction } from 'express';

export const versionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-API-Version', '1.0');
    // We can also attach the version to the request object if needed for logging/analytics
    (req as any).apiVersion = '1.0';
    next();
};
