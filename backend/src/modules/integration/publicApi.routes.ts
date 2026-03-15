import { Router } from 'express';
import { apiKeyMiddleware, ApiKeyRequest } from '../../middleware/apiKeyMiddleware';
import { ExternalApiService } from './externalApi.service';
import { container } from 'tsyringe';
import prisma from '../../infrastructure/db';
import { publicApiLimiter } from '../../middleware/rateLimitMiddleware';

const router = Router();
const externalApiService = container.resolve(ExternalApiService);

// Secure all routes in this router with API Key
router.use(publicApiLimiter);
router.use(apiKeyMiddleware);

// Middleware to ensure a key was actually provided and valid (since apiKeyMiddleware falls back to next() if no key)
const enforceApiKey = (req: ApiKeyRequest, res: any, next: any) => {
    if (!req.apiKeyId) {
        return res.status(401).json({ error: 'This endpoint requires an X-API-KEY header.' });
    }
    next();
};

router.use(enforceApiKey);

// GET /api/v1/user/:userId/score — get discipline score
router.get('/user/:userId/score', async (req, res) => {
    try {
        const metrics = await externalApiService.getUserMetrics(req.params.userId);
        if (!metrics) return res.status(404).json({ error: 'User not found.' });
        return res.json(metrics);
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

// GET /api/v1/user/:userId/policy — get active enforcement policy
router.get('/user/:userId/policy', async (req, res) => {
    try {
        const policy = await externalApiService.getActivePolicy(req.params.userId);
        return res.json(policy || { enforcement_mode: 'NONE' });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

// POST /api/v1/user/:userId/action — report an action outcome
router.post('/user/:userId/action', async (req: ApiKeyRequest, res) => {
    try {
        const { action_title, status, executed_at, details } = req.body;
        const userId = req.params.userId;

        if (!action_title || !status) {
            return res.status(400).json({ error: 'action_title and status are required.' });
        }

        // Find or create a generic action for this user if it doesn't exist?
        // Or just record the instance. In this system, instances usually link to actions.
        // For simplicity in this integration, we'll record a 'PROGRAMMATIC' audit log or a simple instance.
        
        await prisma.auditLog.create({
            data: {
                actor_id: (req.apiKeyUserId as any) || undefined,
                target_user_id: userId as any,
                action: 'EXTERNAL_ACTION_REPORTED',
                details: JSON.stringify({ action_title, status, executed_at, details, via_key: (req.apiKeyId as any) }),
                timestamp: new Date()
            }
        });

        return res.json({ success: true, message: 'Action reported successfully.' });
    } catch (err: any) {
        return res.status(500).json({ error: err.message });
    }
});

export default router;
