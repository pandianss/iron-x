import { Router } from 'express';
import { getState, getPressure, getPredictions, getConstraints, getHistory } from '../controllers/disciplineController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/state', getState);
router.get('/pressure', getPressure);
router.get('/predictions', getPredictions);
router.get('/constraints', getConstraints);
router.get('/history', getHistory);

import { kernelQueue } from '../infrastructure/queue';
import { v4 as uuidv4 } from 'uuid';

router.post('/trigger-cycle', async (req: any, res: any) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    await kernelQueue.add('KERNEL_CYCLE_JOB', {
        userId,
        traceId: uuidv4(),
        timestamp: new Date()
    });

    res.json({ message: 'Cycle enqueued', userId });
});

export default router;
