/* eslint-disable @typescript-eslint/no-explicit-any */

import prisma from './src/db';
import { EnforcementService } from './src/services/enforcement.service';

async function verifyPolicy() {
    console.log('Starting Policy Verification...');

    // Check if prisma client has Policy model
    if (!(prisma as any).policy) {
        console.error('ERROR: Prisma Client does not have Policy model. Has "npx prisma generate" been run successfully?');
        console.log('Skipping verification due to missing client code.');
        return;
    }

    try {
        // 1. Create a Strict Policy
        const policyName = `Strict_Test_${Date.now()}`;
        console.log(`Creating Policy: ${policyName}`);

        const policy = await (prisma as any).policy.create({
            data: {
                name: policyName,
                scope: 'ROLE',
                enforcement_mode: 'HARD',
                rules: JSON.stringify({
                    max_misses: 2, // Strict limit
                    lockout_hours: 1
                })
            }
        });
        console.log('   Policy Created:', policy.policy_id);

        // 2. Create Role linked to Policy
        const roleName = `Role_${Date.now()}`;
        console.log(`Creating Role: ${roleName}`);

        const role = await (prisma as any).role.create({
            data: {
                name: roleName,
                policy_id: policy.policy_id
            }
        });
        console.log('   Role Created:', role.role_id);

        // 3. Create User with Role
        const email = `policy_user_${Date.now()}@test.com`;
        console.log(`Creating User: ${email}`);

        const user = await prisma.user.create({
            data: {
                email,
                password_hash: 'hashed_password',
                timezone: 'UTC',
                // Link role
                role_id: role.role_id
            } as any
        });
        console.log('   User Created:', user.user_id);

        // 4. Simulate Missed Actions
        console.log('Simulating 1st Missed Action...');
        await EnforcementService.handleMissedAction(user.user_id, 'fake_instance_1');

        // Refresh user
        let updatedUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        if (updatedUser?.locked_until && updatedUser.locked_until > new Date()) {
            console.error('   FAILURE: User locked out too early!');
        } else {
            console.log('   SUCCESS: User not locked yet (limit is 2).');
        }

        console.log('Simulating 2nd Missed Action (Should Trigger Lockout)...');
        // create dummy misses in DB first because logic counts them from DB
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(new Date().getDate() - 1);

        // We need actual ActionInstance records in DB for the count query to work
        await prisma.actionInstance.createMany({
            data: [
                {
                    instance_id: `inst_${Date.now()}_1`,
                    user_id: user.user_id,
                    status: 'MISSED',
                    scheduled_date: new Date(),
                    scheduled_start_time: new Date(),
                    scheduled_end_time: new Date()
                },
                {
                    instance_id: `inst_${Date.now()}_2`,
                    user_id: user.user_id,
                    status: 'MISSED',
                    scheduled_date: new Date(),
                    scheduled_start_time: new Date(),
                    scheduled_end_time: new Date()
                }
            ]
        });

        await EnforcementService.handleMissedAction(user.user_id, 'fake_instance_2');

        updatedUser = await prisma.user.findUnique({ where: { user_id: user.user_id } });
        if (updatedUser?.locked_until && updatedUser.locked_until > new Date()) {
            console.log('   SUCCESS: User is locked out!');
            console.log('   Locked Until:', updatedUser.locked_until);
        } else {
            console.error('   FAILURE: User NOT locked out after 2 misses.');
        }

    } catch (error) {
        console.error('Verification failed with error:', error);
    }
}

verifyPolicy();
