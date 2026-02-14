"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrajectoryController = void 0;
const tsyringe_1 = require("tsyringe");
const trajectory_service_1 = require("./trajectory.service");
let TrajectoryController = class TrajectoryController {
    constructor() {
        this.getIdentity = async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                return res.sendStatus(401);
            try {
                await trajectory_service_1.TrajectoryService.updateClassification(userId);
                const data = await trajectory_service_1.TrajectoryService.getIdentityData(userId);
                res.json(data);
            }
            catch (error) {
                console.error('Error fetching identity:', error);
                res.status(500).json({ error: 'Failed to fetch identity data' });
            }
        };
        this.getTrajectory = async (req, res) => {
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
        this.getProjectedScore = async (req, res) => {
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
        this.getTomorrowPreview = async (req, res) => {
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
        this.getAnticipatoryWarnings = async (req, res) => {
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
        this.getWeeklyReport = async (req, res) => {
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
    }
};
exports.TrajectoryController = TrajectoryController;
exports.TrajectoryController = TrajectoryController = __decorate([
    (0, tsyringe_1.autoInjectable)()
], TrajectoryController);
