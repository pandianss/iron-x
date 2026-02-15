
import { Request, Response, NextFunction } from 'express';
import { container } from 'tsyringe';
import { ApiKeyService } from '../modules/_experimental/integration/api_key.service';
import { Logger } from '../utils/logger';
import { isModuleActive, ModuleId } from '../kernel/moduleRegistry';

export const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Feature Flag: Skip if Integration module is inactive
    if (!isModuleActive(ModuleId.INTEGRATION)) {
        return next();
    }

    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ix_')) {
        return next(); // Continue to other auth middlewares (like JWT)
    }

    const plainKey = authHeader.split(' ')[1];
    const apiKeyService = container.resolve(ApiKeyService);

    try {
        const organization = await apiKeyService.verifyKey(plainKey);

        if (organization) {
            // Attach org info to request for downstream usage
            (req as any).organization = organization;
            (req as any).isApiKeyAuth = true;
            return next();
        }

        Logger.warn('[Auth] Invalid API Key attempt');
        return res.status(401).json({ message: 'Invalid API Key' });
    } catch (error) {
        console.error('API Key Middleware Error:', error);
        res.status(500).json({ message: 'Internal server error during authentication' });
    }
};
