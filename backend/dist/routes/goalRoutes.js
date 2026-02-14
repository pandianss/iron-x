"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const goalController_1 = require("../controllers/goalController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateToken); // Protect all routes
const lockoutMiddleware_1 = require("../middleware/lockoutMiddleware");
router.post('/', lockoutMiddleware_1.checkLockout, goalController_1.createGoal);
router.get('/', goalController_1.getGoals);
exports.default = router;
