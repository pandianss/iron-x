
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAuditorRole() {
    console.log('Checking for Auditor Role...');
    const role = await prisma.role.findUnique({
        where: { name: 'Auditor' }
    });

    if (role) {
        console.log(`[PASS] Auditor Role found: ${role.role_id}`);
        console.log(`Description: ${role.description}`);
    } else {
        console.error('[FAIL] Auditor Role NOT found.');
    }
}

checkAuditorRole()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
