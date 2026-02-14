"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enforcementObserver = exports.EnforcementObserver = void 0;
const db_1 = __importDefault(require("../../db"));
const events_1 = require("../../kernel/domain/events");
class EnforcementObserver {
    async handle(event) {
        if (event.type === events_1.DomainEventType.VIOLATION_DETECTED) {
            await this.handleViolation(event);
        }
    }
    async handleViolation(event) {
        const { userId, payload } = event;
        const { policyId } = payload;
        console.log(`[Governance] Violation observed for ${userId}: ${payload.reason}`);
        if (policyId === 'HARD') {
            // Logic moved from ExecutionPipeline
            const MAX_MISSES = 3;
            const LOCKOUT_HOURS = 24;
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const recentMisses = await db_1.default.actionInstance.count({
                where: {
                    user_id: userId,
                    status: 'MISSED',
                    scheduled_date: { gte: sevenDaysAgo }
                }
            });
            if (recentMisses >= MAX_MISSES) {
                const lockedUntil = new Date();
                lockedUntil.setHours(lockedUntil.getHours() + LOCKOUT_HOURS);
                await db_1.default.user.update({
                    where: { user_id: userId },
                    data: {
                        locked_until: lockedUntil,
                        acknowledgment_required: true
                    }
                });
                console.log(`[Governance] User ${userId} LOCKED OUT until ${lockedUntil}`);
                // Future: Emit USER_LOCKED_OUT event here if needed
            }
        }
    }
}
exports.EnforcementObserver = EnforcementObserver;
exports.enforcementObserver = new EnforcementObserver();
