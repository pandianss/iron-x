
import prisma from '../db';
import { Control, ControlMapping } from '@prisma/client';

export const ComplianceService = {
    /**
     * Retrieves all defined controls for a given framework.
     */
    async getControlsByFramework(framework: string) {
        return prisma.control.findMany({
            where: { framework },
            include: { mappings: true }
        });
    },

    /**
     * Maps a policy to a specific control.
     */
    async mapPolicyToControl(controlId: string, policyId: string, mechanism: string) {
        return prisma.controlMapping.create({
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
    async getGapAnalysis(framework: string) {
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
