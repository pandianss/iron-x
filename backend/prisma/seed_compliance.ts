
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SOC2_CONTROLS = [
    {
        code: 'CC6.1',
        description: 'The entity restricts logical access to security assets to authorized personnel.',
        mappings: [
            {
                enforcement_mechanism: 'ROLE_BASED_ACCESS_CONTROL',
                evidence_source: 'DB_TABLE:users,roles',
                narrative: 'Iron-X enforces RBAC via the Role entity and roleAuthMiddleware. Access is denied by default.'
            },
            {
                enforcement_mechanism: 'AUTHENTICATION',
                evidence_source: 'CODE:authMiddleware.ts',
                narrative: 'All API endpoints require valid JWT tokens signed by the internal secret.'
            }
        ]
    },
    {
        code: 'CC6.7',
        description: 'The entity restricts the transmission of confidential data over public networks.',
        mappings: [
            {
                enforcement_mechanism: 'ENCRYPTION_TLS',
                evidence_source: 'INFRA:load_balancer',
                narrative: 'All traffic is encrypted in transit via TLS 1.2+.'
            }
        ]
    },
    {
        code: 'CC2.1',
        description: 'The entity publishes a security commitments and system requirements description.',
        mappings: [
            {
                enforcement_mechanism: 'PUBLIC_DOCUMENTATION',
                evidence_source: 'DOC:security_policy',
                narrative: 'Security policy is published at /legal/security.'
            }
        ]
    },
    {
        code: 'A.1.2',
        description: 'The entity authorizes, modifies, or terminates access to data and system resources.',
        mappings: [
            {
                enforcement_mechanism: 'SUBSCRIPTION_MANAGEMENT',
                evidence_source: 'DB_TABLE:subscriptions',
                narrative: 'Access to features is controlled by strict subscription tier enforcement.'
            }
        ]
    }
];

const ISO27001_CONTROLS = [
    {
        code: 'A.9.2.1',
        description: 'User registration and de-registration',
        mappings: [
            {
                enforcement_mechanism: 'USER_LIFECYCLE_MANGEMENT',
                evidence_source: 'API:POST /auth/register',
                narrative: 'User creation is handled via a centralized registration flow with valid email verification.'
            }
        ]
    },
    {
        code: 'A.12.4.1',
        description: 'Event logging',
        mappings: [
            {
                enforcement_mechanism: 'IMMUTABLE_AUDIT_LOG',
                evidence_source: 'DB_TABLE:audit_logs',
                narrative: 'Critical actions (login, policy change, data deletion) are written to a write-only audit log table.'
            }
        ]
    }
];

async function main() {
    console.log('Seeding Compliance Controls...');

    // 1. SOC 2
    for (const control of SOC2_CONTROLS) {
        const c = await prisma.control.upsert({
            where: {
                framework_control_code: {
                    framework: 'SOC 2',
                    control_code: control.code
                }
            },
            update: {},
            create: {
                framework: 'SOC 2',
                control_code: control.code,
                description: control.description
            }
        });

        console.log(`Upserted SOC 2 Control: ${control.code}`);

        // Create mappings
        for (const m of control.mappings) {
            // cleanup existing to avoid dupes on re-run if generic
            // strictly, we should probably check existence, but for seed we can just create
            await prisma.controlMapping.create({
                data: {
                    control_id: c.control_id,
                    enforcement_mechanism: m.enforcement_mechanism,
                    evidence_source: m.evidence_source
                }
            });
        }
    }

    // 2. ISO 27001
    for (const control of ISO27001_CONTROLS) {
        const c = await prisma.control.upsert({
            where: {
                framework_control_code: {
                    framework: 'ISO 27001',
                    control_code: control.code
                }
            },
            update: {},
            create: {
                framework: 'ISO 27001',
                control_code: control.code,
                description: control.description
            }
        });
        console.log(`Upserted ISO 27001 Control: ${control.code}`);

        for (const m of control.mappings) {
            await prisma.controlMapping.create({
                data: {
                    control_id: c.control_id,
                    enforcement_mechanism: m.enforcement_mechanism,
                    evidence_source: m.evidence_source
                }
            });
        }
    }

    console.log('Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
