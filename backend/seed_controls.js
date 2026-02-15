/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Controls...');

    // ISO 27001 Controls
    const controls = [
        {
            framework: 'ISO 27001',
            control_code: 'A.9.2.1',
            description: 'User registration and de-registration',
        },
        {
            framework: 'ISO 27001',
            control_code: 'A.9.4.1',
            description: 'Information access restriction',
        },
        {
            framework: 'ISO 27001',
            control_code: 'A.12.4.1',
            description: 'Event logging',
        }
    ];

    for (const c of controls) {
        await prisma.control.upsert({
            where: {
                framework_control_code: {
                    framework: c.framework,
                    control_code: c.control_code
                }
            },
            create: c,
            update: c
        });
    }

    console.log('Controls seeded.');

    // Map A.12.4.1 (Logging) to Audit Logs (Conceptual mapping)
    const logControl = await prisma.control.findFirst({
        where: { control_code: 'A.12.4.1' }
    });

    if (logControl) {
        // Check if mapping exists
        const mappingExists = await prisma.controlMapping.findFirst({
            where: {
                control_id: logControl.control_id,
                evidence_source: 'LOG:audit_logs'
            }
        });

        if (!mappingExists) {
            await prisma.controlMapping.create({
                data: {
                    control_id: logControl.control_id,
                    enforcement_mechanism: 'IMMUTABLE_LOG',
                    evidence_source: 'LOG:audit_logs'
                }
            });
            console.log('Mapped A.12.4.1 to Audit Logs');
        }
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
