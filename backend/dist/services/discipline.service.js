"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disciplineService = exports.DisciplineService = void 0;
const db_1 = __importDefault(require("../db"));
class DisciplineService {
    async getState(userId) {
        // Pure read-model adapter
        const user = await db_1.default.user.findUnique({
            where: { user_id: userId },
            select: { current_discipline_score: true, discipline_classification: true }
        });
        if (!user)
            throw new Error('User not found');
        return {
            score: user.current_discipline_score,
            status: user.discipline_classification || 'STABLE',
            // Mock data for UI - eventually comes from Read Model / Audit Log
            timeSinceLastViolation: '00:00:00',
            countdownToNextCheck: '00:00:00',
            decayRate: 0
        };
    }
    // ... other read methods remain as simple queries ...
    async getPressure(userId) { return {}; }
    async getPredictions(userId) { return []; }
    async getConstraints(userId) { return {}; }
    async getHistory(userId) { return []; }
}
exports.DisciplineService = DisciplineService;
exports.disciplineService = new DisciplineService();
