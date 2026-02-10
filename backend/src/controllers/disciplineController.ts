import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import prisma from '../db';

export const getState = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            select: { current_discipline_score: true }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        const score = user.current_discipline_score;
        let status = 'STABLE';
        if (score < 50) status = 'BREACH';
        else if (score < 80) status = 'DRIFTING';
        else if (score >= 95) status = 'STRICT';

        // Mock data for time-based fields as per specs
        res.json({
            score,
            status,
            timeSinceLastViolation: '04:12:33',
            countdownToNextCheck: '00:45:00',
            decayRate: -0.05 // per hour
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed' });
    }
};

export const getPressure = async (req: AuthRequest, res: Response) => {
    res.json({
        compositePressure: 'RISING',
        driftVectors: [
            { source: 'Execution Lag', current: '12m', threshold: '15m', timeToBreach: '1h 20m' },
            { source: 'Buffer Erosion', current: '82%', threshold: '70%', timeToBreach: '4h 00m' },
            { source: 'Pattern Drift', current: 'Low', threshold: 'Med', timeToBreach: '12h 15m' }
        ]
    });
};

export const getPredictions = async (req: AuthRequest, res: Response) => {
    res.json([
        {
            event: 'Late Night Access Breach',
            time: '7h from now',
            confidence: 88,
            correctiveAction: 'Deactivate session before 23:00',
            consequence: 'Score Decay -5'
        },
        {
            event: 'Missed Morning Routine',
            time: '24h from now',
            confidence: 65,
            correctiveAction: 'Ensure wake-up lock-in',
            consequence: 'Action Lock Down'
        }
    ]);
};

export const getConstraints = async (req: AuthRequest, res: Response) => {
    res.json({
        activePolicies: ['CORE-01: Execution Rigor', 'TIME-02: Nocturnal Restriction'],
        exceptions: [
            { id: 'EXP-992', title: 'Work Override', expiry: '00:32:15' }
        ],
        reducedPrivileges: ['Flexible Scheduling', 'Optional Overlap'],
        frozenActions: ['Manual Score Adjustment', 'Delete Log Entry']
    });
};

export const getHistory = async (req: AuthRequest, res: Response) => {
    res.json([
        { id: 'EVENT-4421', timestamp: new Date().toISOString(), action: 'Threshold Breach', impact: 'Score -12, Lockout Active', severity: 'HIGH' },
        { id: 'EVENT-4420', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'Missed Checkpoint', impact: 'Score -5', severity: 'MEDIUM' }
    ]);
};
