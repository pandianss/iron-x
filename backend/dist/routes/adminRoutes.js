"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const roleAuthMiddleware_1 = require("../middleware/roleAuthMiddleware");
const router = (0, express_1.Router)();
// Protect all admin routes
router.use(authMiddleware_1.authenticateToken, (0, roleAuthMiddleware_1.requireRole)(['ADMIN', 'SUPER_ADMIN']));
router.get('/audit-logs', adminController_1.getAuditLogs);
router.put('/config', adminController_1.updateSystemConfig);
router.get('/metrics', adminController_1.getSystemMetrics);
exports.default = router;
