/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- SEEDING PRODUCTION CONTROLS ---');

    const controls = [
        { framework: 'ISO 27001', control_code: 'A.12.6.1', description: 'Management of technical vulnerabilities' },
        { framework: 'ISO 27001', control_code: 'A.9.2.3', description: 'Management of privileged access rights' },
        { framework: 'ISO 27001', control_code: 'A.7.2.2', description: 'Information security awareness, education and training' },
        { framework: 'SOC 2', control_code: 'CC6.1', description: 'Logical access security' },
        { framework: 'SOC 2', control_code: 'CC7.1', description: 'System monitoring and incident response' }
    ];

    for (const c of controls) {
        await prisma.control.upsert({
            where: { framework_control_code: { framework: c.framework, control_code: c.control_code } },
            create: c,
            update: c
        });
        console.log(`[+] Seeded: ${c.control_code}`);
    }

    console.log('--- MAPPING EVIDENCE SOURCES ---');
    const vulnControl = await prisma.control.findFirst({ where: { control_code: 'A.12.6.1' } });
    if (vulnControl) {
        await prisma.controlMapping.upsert({
            where: { mapping_id: 'vuln-map-prod' },
            update: {},
            create: {
                mapping_id: 'vuln-map-prod',
                control_id: vulnControl.control_id,
                enforcement_mechanism: 'IMMUTABLE_LOG',
                evidence_source: 'SYSTEM:vulnerability_scan'
            }
        });
    }

    console.log('Seeding Complete.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
