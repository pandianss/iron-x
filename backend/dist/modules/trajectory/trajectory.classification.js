"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trajectoryClassification = void 0;
const db_1 = __importDefault(require("../../db"));
exports.trajectoryClassification = {
    /**
     * Calculates and updates the user's discipline classification.
     * Rules:
     * - UNRELIABLE: Score < 50
     * - RECOVERING: Score >= 50 AND < 80
     * - STABLE: Score >= 80 AND < 95
     * - HIGH_RELIABILITY: Score >= 95
     */
    async calculateClassification(userId) {
        const user = await db_1.default.user.findUnique({
            where: { user_id: userId },
            select: { current_discipline_score: true }
        });
        if (!user)
            return 'UNRELIABLE';
        const score = user.current_discipline_score;
        if (score >= 95)
            return 'HIGH_RELIABILITY';
        if (score >= 80)
            return 'STABLE';
        if (score >= 50)
            return 'RECOVERING';
        return 'UNRELIABLE';
    },
    async updateClassification(userId) {
        const newClass = await this.calculateClassification(userId);
        const user = await db_1.default.user.findUnique({
            where: { user_id: userId },
            select: { discipline_classification: true, classification_last_updated: true }
        });
        if (!user)
            return;
        if (user.discipline_classification !== newClass) {
            await db_1.default.user.update({
                where: { user_id: userId },
                data: {
                    discipline_classification: newClass,
                    classification_last_updated: new Date()
                }
            });
        }
    }
};
