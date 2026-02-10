
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyCompliance() {
    console.log('Verifying Compliance Controls...');

    // 1. Get a control with a mapping
    const loggingControl = await prisma.control.findFirst({
        where: { control_code: 'A.12.4.1' },
        include: { mappings: true }
    });

    if (!loggingControl || loggingControl.mappings.length === 0) {
        console.error('Control A.12.4.1 not found or unmapped.');
        return;
    }

    const mapping = loggingControl.mappings[0];
    console.log(`Verifying Control: ${loggingControl.control_code}`);
    console.log(`Evidence Source: ${mapping.evidence_source}`);

    // 2. Automated Test Logic
    if (mapping.evidence_source === 'LOG:audit_logs') {
        const logCount = await prisma.auditLog.count();
        if (logCount > 0) {
            console.log(`[PASS] Evidence found in ${mapping.evidence_source}. Records: ${logCount}`);
        } else {
            console.warn(`[WARN] No evidence found in ${mapping.evidence_source}. System functioning but empty logs?`);
        }
    } else {
        console.log(`[INFO] Manual verification required for source: ${mapping.evidence_source}`);
    }
}

verifyCompliance()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
