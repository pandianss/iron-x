import { Request, Response, NextFunction } from 'express';

import crypto from 'crypto';
import prisma from '../db';

export const apiKeyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Check if the request is from a public route
    if (req.originalUrl.startsWith('/api/v1/auth') || req.originalUrl.startsWith('/api/docs')) {
        return next();
    }

    const apiKey = req.header('X-API-KEY');

    if (!apiKey) {
        // Fallback to JWT Check if there's no api key
        return next();
        // Note: For Iron-X standard endpoints expect JWT (passed to auth middleware). 
        // This middleware handles X-API-KEY primarily for integration/machine routes.
        // It's acting alongside normal auth, so missing it just means we move on.
    }

    try {
        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        const validKey = await prisma.apiKey.findUnique({
            where: {
                key_hash: keyHash
            }
        });

        if (!validKey) {
            return res.status(401).json({ message: 'Invalid API Key' });
        }

        if (validKey.expires_at && validKey.expires_at < new Date()) {
            return res.status(401).json({ message: 'API Key Expired' });
        }

        // Update last used asynchronously
        prisma.apiKey.update({
            where: { key_id: validKey.key_id },
            data: { last_used: new Date() }
        }).catch(err => console.error('Failed to update API key last_used', err));

        // Attach org to request for downstream handlers
        (req as any).orgId = validKey.org_id;

        return next();
    } catch (e) {
        console.error('API Key validation error:', e);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
