"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkLockout = void 0;
const db_1 = __importDefault(require("../db"));
/**
 * Middleware to prevent modifications if user is locked out.
 * To be used on POST/PUT/DELETE routes for Goals and Actions.
 */
const checkLockout = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return res.sendStatus(401);
        const user = await db_1.default.user.findUnique({
            where: { user_id: userId },
            select: { locked_until: true }
        });
        if (user && user.locked_until && user.locked_until > new Date()) {
            return res.status(403).json({
                error: 'Account is locked due to discipline failure. Read-only mode active.',
                lockedUntil: user.locked_until
            });
        }
        next();
    }
    catch (error) {
        console.error('Lockout check failed', error);
        res.status(500).json({ error: 'Internal server error during lockout check' });
    }
};
exports.checkLockout = checkLockout;
