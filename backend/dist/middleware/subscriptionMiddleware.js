"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkStrictModeAccess = exports.checkActionLimit = void 0;
const db_1 = __importDefault(require("../db"));
const checkActionLimit = async (req, res, next) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        const userSubscription = await db_1.default.subscription.findUnique({
            where: { user_id: userId }
        });
        const plan = userSubscription?.plan_tier || 'FREE';
        console.log(`[LIMIT] Plan: ${plan}`);
        // PRO and TEAM have unlimited actions
        if (plan !== 'FREE')
            return next();
        const actionCount = await db_1.default.action.count({
            where: { user_id: userId }
        });
        console.log(`[LIMIT] Count: ${actionCount}`);
        if (actionCount >= 3) {
            console.log(`[LIMIT] BLOCKED.`);
            return res.status(403).json({
                message: 'PLAN_LIMIT_EXCEEDED: Free plan allows max 3 actions. Upgrade to PRO for unlimited.',
                code: 'PLAN_LIMIT_EXCEEDED'
            });
        }
        next();
    }
    catch (error) {
        console.error('Subscription check error', error);
        res.status(500).json({ message: 'Server error during plan check' });
    }
};
exports.checkActionLimit = checkActionLimit;
const checkStrictModeAccess = async (req, res, next) => {
    const userId = req.user?.userId;
    if (!userId)
        return res.sendStatus(401);
    try {
        // If creating/updating action with is_strict=true
        const { is_strict } = req.body;
        // If not enabling strict mode, pass through
        if (is_strict !== true)
            return next();
        const userSubscription = await db_1.default.subscription.findUnique({
            where: { user_id: userId }
        });
        const plan = userSubscription?.plan_tier || 'FREE';
        if (plan === 'FREE') {
            return res.status(403).json({
                message: 'PLAN_LIMIT_EXCEEDED: Strict Mode is a PRO feature.',
                code: 'PLAN_LIMIT_EXCEEDED_FEATURE'
            });
        }
        next();
    }
    catch (error) {
        console.error('Subscription feature check error', error);
        res.status(500).json({ message: 'Server error during plan check' });
    }
};
exports.checkStrictModeAccess = checkStrictModeAccess;
