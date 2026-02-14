import { Request, Response } from 'express';
import { TrajectoryService } from '../services/trajectory.service';
import { AuthRequest } from '../middleware/authMiddleware';

export const getIdentity = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        // Ensure classification is up to date before returning
        await TrajectoryService.updateClassification(userId);
        const data = await TrajectoryService.getIdentityData(userId);
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
        const data = await TrajectoryService.getTrajectory(userId, days);
        res.json(data);
    } catch (error) {
        console.error('Error fetching trajectory:', error);
        res.status(500).json({ error: 'Failed to fetch trajectory data' });
    }
};

export const getProjectedScore = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const data = await TrajectoryService.getProjectedScore(userId);
        res.json(data);
    } catch (error) {
        console.error('Error fetching projection:', error);
        res.status(500).json({ error: 'Failed to fetch projection data' });
    }
};

export const getTomorrowPreview = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const data = await TrajectoryService.getTomorrowPreview(userId);
        res.json(data);
    } catch (error) {
        console.error('Error fetching preview:', error);
        res.status(500).json({ error: 'Failed to fetch preview data' });
    }
};

export const getAnticipatoryWarnings = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const data = await TrajectoryService.getAnticipatoryWarnings(userId);
        res.json(data);
    } catch (error) {
        console.error('Error fetching warnings:', error);
        res.status(500).json({ error: 'Failed to fetch warnings' });
    }
};

export const getWeeklyReport = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) return res.sendStatus(401);

    try {
        const data = await TrajectoryService.getWeeklyReport(userId);
        res.json(data);
    } catch (error) {
        console.error('Error fetching weekly report:', error);
        res.status(500).json({ error: 'Failed to fetch weekly report' });
    }
};
