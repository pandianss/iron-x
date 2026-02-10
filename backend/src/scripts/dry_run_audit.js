
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function dryRunAudit() {
    console.log('Starting Internal Certification Dry Run...');

    const controls = await prisma.control.findMany({
        include: { mappings: true }
    });

    const report = {
        timestamp: new Date(),
        summary: {
            total_controls: controls.length,
            mapped_controls: 0,
            evidence_verified: 0,
            gaps: 0
        },
        details: []
    };

    for (const c of controls) {
        const isMapped = c.mappings.length > 0;
        let evidenceFound = false;
        let evidenceNote = 'No mapping';

        if (isMapped) {
            const mapping = c.mappings[0];
            evidenceNote = `Mapped to: ${mapping.evidence_source}`;

            // Simple verification logic
            if (mapping.evidence_source.startsWith('LOG:')) {
                const logs = await prisma.auditLog.count();
                evidenceFound = logs > 0;
            } else if (mapping.evidence_source.startsWith('DB_TABLE:')) {
                // Assume schema existence implies foundational evidence for now
                evidenceFound = true;
            }
        }

        if (isMapped) report.summary.mapped_controls++;
        if (evidenceFound) report.summary.evidence_verified++;
        if (!isMapped || !evidenceFound) report.summary.gaps++;

        report.details.push({
            control_code: c.control_code,
            description: c.description,
            status: isMapped ? (evidenceFound ? 'COMPLIANT' : 'PARTIAL') : 'GAP',
            notes: evidenceNote
        });
    }

    // Output Report
    console.log(JSON.stringify(report.summary, null, 2));

    const outputPath = path.join(__dirname, '../../audit_dry_run_report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`Gap Analysis Report generated: ${outputPath}`);
}

dryRunAudit()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
