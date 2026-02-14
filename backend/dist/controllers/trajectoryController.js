"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklyReport = exports.getAnticipatoryWarnings = exports.getTomorrowPreview = exports.getProjectedScore = exports.getTrajectory = exports.getIdentity = void 0;
const trajectory_service_1 = require("../services/trajectory.service");
const getIdentity = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        // Ensure classification is up to date before returning
        await trajectory_service_1.TrajectoryService.updateClassification(userId);
        const data = await trajectory_service_1.TrajectoryService.getIdentityData(userId);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching identity:', error);
        res.status(500).json({ error: 'Failed to fetch identity data' });
    }
};
exports.getIdentity = getIdentity;
const getTrajectory = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        const days = req.query.days ? parseInt(req.query.days) : 30;
        const data = await trajectory_service_1.TrajectoryService.getTrajectory(userId, days);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching trajectory:', error);
        res.status(500).json({ error: 'Failed to fetch trajectory data' });
    }
};
exports.getTrajectory = getTrajectory;
const getProjectedScore = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        const data = await trajectory_service_1.TrajectoryService.getProjectedScore(userId);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching projection:', error);
        res.status(500).json({ error: 'Failed to fetch projection data' });
    }
};
exports.getProjectedScore = getProjectedScore;
const getTomorrowPreview = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        const data = await trajectory_service_1.TrajectoryService.getTomorrowPreview(userId);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching preview:', error);
        res.status(500).json({ error: 'Failed to fetch preview data' });
    }
};
exports.getTomorrowPreview = getTomorrowPreview;
const getAnticipatoryWarnings = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        const data = await trajectory_service_1.TrajectoryService.getAnticipatoryWarnings(userId);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching warnings:', error);
        res.status(500).json({ error: 'Failed to fetch warnings' });
    }
};
exports.getAnticipatoryWarnings = getAnticipatoryWarnings;
const getWeeklyReport = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        const data = await trajectory_service_1.TrajectoryService.getWeeklyReport(userId);
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching weekly report:', error);
        res.status(500).json({ error: 'Failed to fetch weekly report' });
    }
};
exports.getWeeklyReport = getWeeklyReport;
