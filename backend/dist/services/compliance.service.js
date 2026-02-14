"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceService = void 0;
const db_1 = __importDefault(require("../db"));
exports.ComplianceService = {
    /**
     * Retrieves all defined controls for a given framework.
     */
    async getControlsByFramework(framework) {
        return db_1.default.control.findMany({
            where: { framework },
            include: { mappings: true }
        });
    },
    /**
     * Maps a policy to a specific control.
     */
    async mapPolicyToControl(controlId, policyId, mechanism) {
        return db_1.default.controlMapping.create({
            data: {
                control_id: controlId,
                policy_id: policyId,
                enforcement_mechanism: mechanism,
                evidence_source: 'DB_TABLE:policies'
            }
        });
    },
    /**
     * Generates a "Gap Analysis" by finding controls with no mappings.
     */
    async getGapAnalysis(framework) {
        const controls = await this.getControlsByFramework(framework);
        const gaps = controls.filter(c => c.mappings.length === 0);
        return {
            total_controls: controls.length,
            implemented_controls: controls.length - gaps.length,
            gaps: gaps.map(g => ({
                control_code: g.control_code,
                description: g.description
            }))
        };
    }
};
