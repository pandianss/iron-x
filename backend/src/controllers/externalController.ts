
import { Request, Response } from 'express';
import { ExternalApiService } from '../services/externalApi.service';

export const ExternalController = {
    async getMetrics(req: Request, res: Response) {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing API Key' });
        }

        const apiKey = authHeader.split(' ')[1];
        if (!await ExternalApiService.validateApiKey(apiKey)) {
            return res.status(403).json({ error: 'Invalid API Key' });
        }

        // In a real scenario, API Key would map to a specific tenant/user scope.
        // For this demo, we accept a query param 'userId' if the key is admin-level, 
        // or infer from key context. MVP: expect 'userId' in query.
        const userId = req.query.userId as string;
        if (!userId) {
            return res.status(400).json({ error: 'Missing userId parameter' });
        }

        try {
            const metrics = await ExternalApiService.getUserMetrics(userId);
            if (!metrics) {
                return res.status(404).json({ error: 'Metrics not found' });
            }
            res.json(metrics);
        } catch (e) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    async getPolicy(req: Request, res: Response) {
        // Similar auth logic (should be middleware in production)
        const authHeader = req.headers['authorization'];
        const apiKey = authHeader?.split(' ')[1] || '';

        if (!await ExternalApiService.validateApiKey(apiKey)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const userId = req.query.userId as string;
        if (!userId) return res.status(400).json({ error: 'Missing userId' });

        try {
            const policy = await ExternalApiService.getActivePolicy(userId);
            if (!policy) {
                return res.status(404).json({ error: 'Policy not found' });
            }
            res.json(policy);
        } catch (e) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
};
