"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const db_1 = __importDefault(require("../db"));
const logger_1 = require("../utils/logger");
/**
 * Service for creating immutable audit logs.
 * Covers: Status changes, Enforcement actions, Lockouts, Manager interventions.
 */
exports.AuditService = {
    /**
     * Log an event to the audit trail.
     * @param actorId - The user ID performing the action (System, User, or Manager). Use 'SYSTEM' for automated jobs if possible, but schema expects User relation. If system, maybe use a reserved ID or null if allowed, but schema has relation.
     * NOTE: Schema has `actor_id` as optional String? and relation. If we want "SYSTEM" string, we might need no relation or a specific system user.
     * For now, if actorId is not a UUID of a user, we should probably leave it null and put "SYSTEM" in details or create a System User.
     * Let's assume for now automate jobs might not have a user ID.
     * Update: Schema `actor` is `User?`. So if it's system, we leave actor_id null and specify in details or action.
     */
    logEvent: async (action, details, targetUserId, actorId) => {
        try {
            const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);
            await db_1.default.auditLog.create({
                data: {
                    action,
                    details: detailsStr,
                    target_user_id: targetUserId,
                    actor_id: actorId, // Nullable
                },
            });
            // console.log(`[AUDIT] ${action} - Target: ${targetUserId} - Actor: ${actorId}`);
        }
        catch (error) {
            // Fail silent? or rethrow? For audit, maybe we should alert.
            // ...
            logger_1.Logger.error('Failed to create audit log', error);
            // Fail silent? or rethrow? For audit, maybe we should alert.
        }
    },
};
