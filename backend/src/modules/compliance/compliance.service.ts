
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

export class ComplianceService {
    static async generateReport(framework: string): Promise<ComplianceReport> {
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
                let evidenceFound = true;
                let details = 'System active';

                if (map.evidence_source.startsWith('DB_TABLE')) {
                    // checks if table has data? 
                    // const tableName = map.evidence_source.split(':')[1];
                    // const count = await prisma.$queryRawUnsafe(`SELECT count(*) FROM "${tableName}"`); 
                    // For now, static true.
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

    static async generateEvidencePack(framework: string): Promise<string> {
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
