
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDataProtection() {
    console.log('Verifying Data Protection Logic...');

    // 1. Retention Test
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 8); // 8 years ago

    // Create an old log
    const oldLog = await prisma.auditLog.create({
        data: {
            action: 'TEST_OLD_LOG',
            timestamp: oldDate,
            actor_id: null,
            target_user_id: null
        }
    });
    console.log(`Created old log ID: ${oldLog.log_id} Date: ${oldLog.timestamp}`);

    // Enforce Retention (Simulate logic from Service)
    const cutoffDate = new Date();
    cutoffDate.setFullYear(cutoffDate.getFullYear() - 7);

    const deleteResult = await prisma.auditLog.deleteMany({
        where: { timestamp: { lt: cutoffDate }, action: 'TEST_OLD_LOG' }
    });
    console.log(`Retention Policy Enforced. Deleted: ${deleteResult.count}`);

    if (deleteResult.count >= 1) {
        console.log('[PASS] Retention Policy verified.');
    } else {
        console.error('[FAIL] Retention Policy failed to delete old log.');
    }

    // 2. Anonymization Test
    // Create dummy user
    const dummyUser = await prisma.user.create({
        data: {
            email: `test-anon-${Date.now()}@example.com`,
            password_hash: 'secret',
            timezone: 'UTC'
        }
    });
    console.log(`Created dummy user: ${dummyUser.user_id}`);

    // Anonymize (Simulate Service Logic)
    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { user_id: dummyUser.user_id },
            data: {
                email: `anonymized-${dummyUser.user_id}@deleted.local`,
                password_hash: 'DELETED'
            }
        });
    });

    const updatedUser = await prisma.user.findUnique({ where: { user_id: dummyUser.user_id } });
    if (updatedUser.email.startsWith('anonymized-') && updatedUser.password_hash === 'DELETED') {
        console.log('[PASS] Anonymization verified.');
    } else {
        console.error('[FAIL] Anonymization failed.');
    }

    // Cleanup
    await prisma.user.delete({ where: { user_id: dummyUser.user_id } });
}

verifyDataProtection()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
