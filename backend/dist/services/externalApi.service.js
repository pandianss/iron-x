"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExternalApiService = void 0;
const db_1 = __importDefault(require("../db"));
const transformer_1 = require("../domain/canonical/transformer");
exports.ExternalApiService = {
    /**
     * Validates API Key (Simple implementation).
     * In production, use hashed keys in DB.
     * For MVP/Phase 8, we check against an env var or config.
     */
    async validateApiKey(key) {
        // Mock validation for reference integration
        return key === 'sk_test_discipline_ecosystem';
    },
    async getUserMetrics(userId) {
        // Get latest score
        const score = await db_1.default.disciplineScore.findFirst({
            where: { user_id: userId },
            orderBy: { date: 'desc' }
        });
        if (!score)
            return null;
        // Transform
        return transformer_1.CanonicalTransformer.toScoreV1(score);
    },
    async getActivePolicy(userId) {
        const user = await db_1.default.user.findUnique({
            where: { user_id: userId },
            include: { role: { include: { policy: true } } }
        });
        if (!user?.role?.policy)
            return null;
        return transformer_1.CanonicalTransformer.toPolicyV1(user.role.policy);
    }
};
