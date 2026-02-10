
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAuditor() {
    console.log('Seeding Auditor Role...');

    try {
        await prisma.role.upsert({
            where: { name: 'Auditor' },
            create: {
                name: 'Auditor',
                description: 'External auditor with read-only access',
                policy_id: null
            },
            update: {}
        });
        console.log('Role "Auditor" ensured.');
    } catch (e) {
        console.error('Error ensuring Auditor role:', e);
    }
}

seedAuditor()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
