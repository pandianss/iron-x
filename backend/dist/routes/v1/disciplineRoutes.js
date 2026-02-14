"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const disciplineController_1 = require("../../controllers/disciplineController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken);
router.get('/state', disciplineController_1.getState);
router.get('/pressure', disciplineController_1.getPressure);
router.get('/predictions', disciplineController_1.getPredictions);
router.get('/constraints', disciplineController_1.getConstraints);
router.get('/history', disciplineController_1.getHistory);
const queue_1 = require("../../infrastructure/queue");
const uuid_1 = require("uuid");
router.post('/trigger-cycle', async (req, res) => {
    const { userId } = req.body;
    if (!userId)
        return res.status(400).json({ error: 'userId required' });
    await queue_1.kernelQueue.add('KERNEL_CYCLE_JOB', {
        userId,
        traceId: (0, uuid_1.v4)(),
        timestamp: new Date()
    });
    res.json({ message: 'Cycle enqueued', userId });
});
exports.default = router;
