"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// TODO: Add admin role check middleware
router.get('/audit-logs', authMiddleware_1.authenticateToken, adminController_1.getAuditLogs);
router.put('/config', authMiddleware_1.authenticateToken, adminController_1.updateSystemConfig);
router.get('/metrics', authMiddleware_1.authenticateToken, adminController_1.getSystemMetrics);
exports.default = router;
