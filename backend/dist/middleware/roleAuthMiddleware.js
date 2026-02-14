"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const db_1 = __importDefault(require("../db"));
const logger_1 = require("../utils/logger");
const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized: No user ID found' });
            }
            const user = await db_1.default.user.findUnique({
                where: { user_id: userId },
                include: { role: true }
            });
            if (!user) {
                return res.status(401).json({ error: 'Unauthorized: User not found' });
            }
            // If user has no role, or role name is not in allowed list
            if (!user.role || !allowedRoles.includes(user.role.name)) {
                logger_1.Logger.warn(`[Auth] Access denied for user ${userId}. Required: ${allowedRoles}, Actual: ${user.role?.name || 'NONE'}`);
                return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
            }
            next();
        }
        catch (error) {
            logger_1.Logger.error('[Auth] Role verification failed', error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    };
};
exports.requireRole = requireRole;
