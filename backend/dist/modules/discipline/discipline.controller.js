"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisciplineController = void 0;
const tsyringe_1 = require("tsyringe");
const discipline_service_1 = require("../../services/discipline.service"); // Static for now
const queue_1 = require("../../infrastructure/queue");
const uuid_1 = require("uuid");
let DisciplineController = class DisciplineController {
    constructor() {
        this.getState = async (req, res) => {
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
        this.getPressure = async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                return res.sendStatus(401);
            const data = await discipline_service_1.disciplineService.getPressure(userId);
            res.json(data);
        };
        this.getPredictions = async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                return res.sendStatus(401);
            const data = await discipline_service_1.disciplineService.getPredictions(userId);
            res.json(data);
        };
        this.getConstraints = async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                return res.sendStatus(401);
            const data = await discipline_service_1.disciplineService.getConstraints(userId);
            res.json(data);
        };
        this.getHistory = async (req, res) => {
            const userId = req.user?.userId;
            if (!userId)
                return res.sendStatus(401);
            const data = await discipline_service_1.disciplineService.getHistory(userId);
            res.json(data);
        };
        this.triggerCycle = async (req, res) => {
            const { userId } = req.body;
            if (!userId)
                return res.status(400).json({ error: 'userId required' });
            await queue_1.kernelQueue.add('KERNEL_CYCLE_JOB', {
                userId,
                traceId: (0, uuid_1.v4)(),
                timestamp: new Date()
            });
            res.json({ message: 'Cycle enqueued', userId });
        };
    }
};
exports.DisciplineController = DisciplineController;
exports.DisciplineController = DisciplineController = __decorate([
    (0, tsyringe_1.autoInjectable)()
], DisciplineController);
