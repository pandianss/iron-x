const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting classification remediation...');
    
    // Update all users who were previously 'UNRELIABLE' to 'ONBOARDING'
    const result = await prisma.user.updateMany({
        where: {
            discipline_classification: 'UNRELIABLE'
        },
        data: {
            discipline_classification: 'ONBOARDING'
        }
    });

    console.log(`Remediated ${result.count} users from UNRELIABLE to ONBOARDING.`);
    
    // Also update any remaining 'DRIFTING' to 'RECOVERING' or 'BREACH' to 'RECOVERING' if we want absolute alignment
    const result2 = await prisma.user.updateMany({
        where: {
            discipline_classification: { in: ['DRIFTING', 'BREACH'] }
        },
        data: {
            discipline_classification: 'RECOVERING'
        }
    });
    console.log(`Updated ${result2.count} users with legacy (DRIFTING/BREACH) statuses to RECOVERING.`);

    // One more: STRICT to HIGH_RELIABILITY
    const result3 = await prisma.user.updateMany({
        where: {
            discipline_classification: 'STRICT'
        },
        data: {
            discipline_classification: 'HIGH_RELIABILITY'
        }
    });
    console.log(`Updated ${result3.count} users with legacy (STRICT) status to HIGH_RELIABILITY.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
