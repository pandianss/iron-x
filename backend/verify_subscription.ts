
import prisma from './src/db';
import { SubscriptionService } from './src/modules/subscription/subscription.service';
import { SubscriptionTier } from '@prisma/client';

async function main() {
    console.log('Starting Subscription Verification...');

    // 1. Create a test user
    const email = `test_sub_${Date.now()}@example.com`;
    const user = await prisma.user.create({
        data: {
            email,
            password_hash: 'hash',
            timezone: 'UTC',
            subscription: {
                create: {
                    plan_tier: SubscriptionTier.FREE
                }
            }
        }
    });
    console.log(`Created user: ${user.email} (${user.user_id})`);

    // 2. Check limits (should be clean)
    let check = await SubscriptionService.checkActionLimit(user.user_id);
    console.log(`Initial Check: ${check.allowed}`);

    // 3. Create 3 actions (should succeed)
    for (let i = 0; i < 3; i++) {
        await prisma.action.create({
            data: {
                user_id: user.user_id,
                title: `Action ${i}`,
                frequency_rule: 'DAILY',
                window_start_time: new Date(),
                window_duration_minutes: 30
            }
        });
    }
    console.log('Created 3 actions.');

    // 4. Try 4th action (should fail via Service check)
    check = await SubscriptionService.checkActionLimit(user.user_id);
    console.log(`Check after 3 actions: ${check.allowed} (Expected: false)`);
    if (check.allowed) console.error('FAIL: Should be blocked');
    else console.log('PASS: Correctly blocked');

    // 5. Upgrade to PRO
    await SubscriptionService.assignTier(user.user_id, SubscriptionTier.INDIVIDUAL_PRO);
    console.log('Upgraded to PRO');

    // 6. Try 4th action again (should succeed)
    check = await SubscriptionService.checkActionLimit(user.user_id);
    console.log(`Check after Upgrade: ${check.allowed} (Expected: true)`);
    if (!check.allowed) console.error('FAIL: Should be allowed');
    else console.log('PASS: Correctly allowed');

    // Cleanup
    await prisma.action.deleteMany({ where: { user_id: user.user_id } });
    await prisma.subscription.deleteMany({ where: { user_id: user.user_id } });
    await prisma.user.delete({ where: { user_id: user.user_id } });
    console.log('Cleanup done.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
