import { Router } from 'express';
import { ReferralService } from './referral.service';
import { authenticateToken } from '../../middleware/authMiddleware';

const router = Router();
const referralService = new ReferralService();

router.get('/me', authenticateToken, async (req: any, res) => {
    try {
        const stats = await referralService.getReferralStats(req.user.userId);
        res.json(stats);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/apply', authenticateToken, async (req: any, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: 'Code is required' });
        
        const result = await referralService.applyReferral(req.user.userId, code);
        res.json(result);
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
});

export default router;
