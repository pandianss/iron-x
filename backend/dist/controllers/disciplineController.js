"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistory = exports.getConstraints = exports.getPredictions = exports.getPressure = exports.getState = void 0;
const discipline_service_1 = require("../services/discipline.service");
const getState = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        const data = await discipline_service_1.disciplineService.getState(userId);
        res.json(data);
    }
    catch (error) {
        if (error instanceof Error && error.message === 'User not found') {
            res.status(404).json({ error: 'User not found' });
        }
        else {
            res.status(500).json({ error: 'Failed' });
        }
    }
};
exports.getState = getState;
const getPressure = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    const data = await discipline_service_1.disciplineService.getPressure(userId);
    res.json(data);
};
exports.getPressure = getPressure;
const getPredictions = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    const data = await discipline_service_1.disciplineService.getPredictions(userId);
    res.json(data);
};
exports.getPredictions = getPredictions;
const getConstraints = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    const data = await discipline_service_1.disciplineService.getConstraints(userId);
    res.json(data);
};
exports.getConstraints = getConstraints;
const getHistory = async (req, res) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    const data = await discipline_service_1.disciplineService.getHistory(userId);
    res.json(data);
};
exports.getHistory = getHistory;
