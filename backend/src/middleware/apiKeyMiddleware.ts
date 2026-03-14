import { Request, Response, NextFunction } from 'express';
import { ApiKeyService } from '../modules/integration/apiKey.service';

const apiKeyService = new ApiKeyService();

export interface ApiKeyRequest extends Request {
    apiKeyUserId?: string;
    apiKeyOrgId?: string;
    apiKeyId?: string;
}

export const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Check if the request is from a public route
    if (req.originalUrl.startsWith('/api/v1/auth') || req.originalUrl.startsWith('/api/docs')) {
        return next();
    }

    const apiKey = req.header('X-API-KEY');

    if (!apiKey) {
        // Fallback to JWT Check if there's no api key
        return next();
    }

    try {
        const result = await apiKeyService.validateKey(apiKey);

        if (!result.valid) {
            return res.status(401).json({ message: 'Invalid or Expired API Key' });
        }

        // Attach user/org to request for downstream handlers
        (req as ApiKeyRequest).apiKeyUserId = result.userId;
        (req as ApiKeyRequest).apiKeyOrgId = result.orgId;
        (req as ApiKeyRequest).apiKeyId = result.key_id;

        return next();
    } catch (e) {
        console.error('API Key validation error:', e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
