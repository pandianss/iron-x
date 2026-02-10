import { Request, Response } from 'express';
import { ExperienceService } from '../services/experience.service';
import { AuthRequest } from '../middleware/authMiddleware';

export const getIdentity = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        // Ensure classification is up to date before returning
        await ExperienceService.updateClassification(userId);
        const data = await ExperienceService.getIdentityData(userId);
        res.json(data);
    } catch (error) {
        console.error('Error fetching identity:', error);
        res.status(500).json({ error: 'Failed to fetch identity data' });
    }
};

export const getTrajectory = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const days = req.query.days ? parseInt(req.query.days as string) : 30;
        const data = await ExperienceService.getTrajectory(userId, days);
        res.json(data);
    } catch (error) {
        console.error('Error fetching trajectory:', error);
        res.status(500).json({ error: 'Failed to fetch trajectory data' });
    }
};

export const getTomorrowPreview = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const data = await ExperienceService.getTomorrowPreview(userId);
        res.json(data);
    } catch (error) {
        console.error('Error fetching preview:', error);
        res.status(500).json({ error: 'Failed to fetch preview data' });
    }
};

export const getWeeklyReport = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const data = await ExperienceService.getWeeklyReport(userId);
        res.json(data);
    } catch (error) {
        console.error('Error fetching weekly report:', error);
        res.status(500).json({ error: 'Failed to fetch weekly report' });
    }
};
