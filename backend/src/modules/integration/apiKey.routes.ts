import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../../middleware/authMiddleware';
import { ApiKeyService } from './apiKey.service';
import { container } from 'tsyringe';
import { SubscriptionService } from '../subscription/subscription.service';
import prisma from '../../db';

const router = Router();
router.use(authenticateToken);
const service = new ApiKeyService();

// Create a new key
router.post('/api-keys', async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const subscriptionService = container.resolve(SubscriptionService);
    
    // Subscription Check
    const sub = await subscriptionService.getSubscription(userId);
    const planTier = sub?.plan_tier || 'FREE';
    
    // Determine limits
    let maxKeys = 0;
    if (planTier === 'INDIVIDUAL_PRO') maxKeys = 1;
    if (planTier === 'TEAM_ENTERPRISE') maxKeys = 10;
    
    if (maxKeys === 0) {
      return res.status(403).json({ error: 'API Keys require OPERATOR or INSTITUTIONAL tier.', code: 'TIER_LOCKED' }); // 403 maps to tier lock overlay on frontend
    }

    // Checking current active keys
    const currentKeys = await (prisma.apiKey as any).count({
      where: { user_id: userId, is_active: true }
    });

    if (currentKeys >= maxKeys) {
      return res.status(403).json({ error: `Maximum ${maxKeys} API keys allowed on your tier.`, code: 'LIMIT_REACHED' });
    }

    const { name, expiresAt } = req.body;
    if (!name) return res.status(400).json({ error: 'Key name is required.' });

    const result = await service.createKey({ 
      userId, 
      orgId: req.user!.orgId, 
      name, 
      expiresAt: expiresAt ? new Date(expiresAt) : undefined 
    });
    
    // Return plaintext key ONCE — client must copy it now
    return res.status(201).json({
      key: result.key,  // shown once
      preview: result.preview,
      key_id: result.key_id,
      warning: 'Store this key securely. It will not be shown again.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// List keys
router.get('/api-keys', async (req: AuthRequest, res) => {
  try {
    const keys = await service.listKeys(req.user!.userId);
    return res.json(keys);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Revoke key
router.delete('/api-keys/:keyId', async (req: AuthRequest, res) => {
  try {
    await service.revokeKey(req.params.keyId, req.user!.userId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(403).json({ error: err.message });
  }
});

export default router;
