"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tsyringe_1 = require("tsyringe");
const discipline_controller_1 = require("./discipline.controller");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
const disciplineController = tsyringe_1.container.resolve(discipline_controller_1.DisciplineController);
// Authenticate all routes
router.use(authMiddleware_1.authenticateToken);
router.get('/state', disciplineController.getState);
router.get('/pressure', disciplineController.getPressure);
router.get('/predictions', disciplineController.getPredictions);
router.get('/constraints', disciplineController.getConstraints);
router.get('/history', disciplineController.getHistory);
router.post('/trigger-cycle', disciplineController.triggerCycle);
exports.default = router;
