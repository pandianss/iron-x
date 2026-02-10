
import { Request, Response } from 'express';
import { EnforcementService } from '../services/enforcement.service';

export const updateEnforcementMode = async (req: Request, res: Response) => {
    try {
        const { mode } = req.body;
        const userId = (req as any).user.userId;

        if (!['NONE', 'SOFT', 'HARD'].includes(mode)) {
            return res.status(400).json({ error: 'Invalid mode' });
        }

        await EnforcementService.setEnforcementMode(userId, mode, userId);
        res.json({ message: 'Enforcement mode updated', mode });
    } catch (error) {
        console.error('Error updating enforcement mode', error);
        res.status(500).json({ error: 'Failed to update enforcement mode' });
    }
};
