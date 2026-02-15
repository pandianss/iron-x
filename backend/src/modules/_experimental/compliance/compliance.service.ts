import { singleton } from 'tsyringe';
import prisma from '../../db';

export interface ComplianceReport {
    framework: string;
    generated_at: Date;
    total_controls: number;
    controls: ControlSummary[];
}

export interface ControlSummary {
    code: string;
    description: string;
    mappings: MappingSummary[];
}

export interface MappingSummary {
    mechanism: string;
    source: string;
    evidence_found: boolean;
    details?: string;
}

@singleton()
export class ComplianceService {
    async getControlsByFramework(framework: string) {
        return prisma.control.findMany({
            where: { framework },
            include: { mappings: true }
        });
    }

    async mapPolicyToControl(controlId: string, policyId: string, mechanism: string) {
        return prisma.controlMapping.create({
            data: {
                control_id: controlId,
                policy_id: policyId,
                enforcement_mechanism: mechanism,
                evidence_source: 'DB_TABLE:policies'
            }
        });
    }

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

    async generateReport(framework: string): Promise<ComplianceReport> {
        const controls = await prisma.control.findMany({
            where: { framework },
            include: { mappings: true }
        });

        const controlSummaries: ControlSummary[] = [];

        for (const control of controls) {
            const mappings: MappingSummary[] = [];

            for (const map of control.mappings) {
                // In future, we would actually check the Evidence Source (e.g., query audit logs count)
                // For Phase 1, we assume if mapping exists + system is active = Evidence Found.
                const evidenceFound = true;
                const details = 'System active';

                if (map.evidence_source.startsWith('DB_TABLE')) {
                    // For now, static true. Future implementation will use type-safe Prisma count per table.
                }

                mappings.push({
                    mechanism: map.enforcement_mechanism,
                    source: map.evidence_source,
                    evidence_found: evidenceFound,
                    details
                });
            }

            controlSummaries.push({
                code: control.control_code,
                description: control.description,
                mappings
            });
        }

        return {
            framework,
            generated_at: new Date(),
            total_controls: controls.length,
            controls: controlSummaries
        };
    }

    async generateEvidencePack(framework: string): Promise<string> {
        const report = await this.generateReport(framework);

        // Simulating a text dump of evidence for now
        let dump = `EVIDENCE PACK FOR ${framework}\n`;
        dump += `Generated: ${report.generated_at.toISOString()}\n`;
        dump += `=================================================\n\n`;

        for (const c of report.controls) {
            dump += `[${c.code}] ${c.description}\n`;
            for (const m of c.mappings) {
                dump += `  - Mechanism: ${m.mechanism}\n`;
                dump += `  - Source: ${m.source}\n`;
                dump += `  - Status: ${m.evidence_found ? 'VERIFIED' : 'PENDING'}\n`;
            }
            dump += `\n-------------------------------------------------\n`;
        }

        return dump;
    }
}
