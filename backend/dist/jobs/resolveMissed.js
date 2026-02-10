"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveMissedActions = void 0;
const db_1 = __importDefault(require("../db"));
const resolveMissedActions = async () => {
    const now = new Date();
    try {
        const result = await db_1.default.actionInstance.updateMany({
            where: {
                status: 'PENDING',
                scheduled_end_time: { lt: now }
            },
            data: {
                status: 'MISSED'
            }
        });
        if (result.count > 0) {
            console.log(`Marked ${result.count} instances as MISSED.`);
        }
    }
    catch (error) {
        console.error('Error in resolveMissedActions', error);
    }
};
exports.resolveMissedActions = resolveMissedActions;
