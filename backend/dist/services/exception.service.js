"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExceptionService = void 0;
const db_1 = __importDefault(require("../db"));
const audit_service_1 = require("./audit.service");
exports.ExceptionService = {
    /**
     * Grants a discipline exception/waiver to a user.
     */
    async grantException(userId, reason, validUntil, approverId) {
        const exception = await db_1.default.disciplineException.create({
            data: {
                user_id: userId,
                reason,
                approved_by: approverId,
                valid_until: validUntil,
                valid_from: new Date()
            }
        });
        await audit_service_1.AuditService.logEvent('EXCEPTION_GRANTED', { reason, validUntil, exceptionId: exception.exception_id }, userId, approverId);
        return exception;
    },
    /**
     * Checks if a user has an active exception that prevents enforcement.
     */
    async hasActiveException(userId) {
        const now = new Date();
        const activeException = await db_1.default.disciplineException.findFirst({
            where: {
                user_id: userId,
                valid_from: { lte: now },
                valid_until: { gte: now }
            }
        });
        return !!activeException;
    }
};
