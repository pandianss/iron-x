"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../../controllers/userController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.put('/enforcement-mode', authMiddleware_1.authenticateToken, userController_1.updateEnforcementMode);
exports.default = router;
