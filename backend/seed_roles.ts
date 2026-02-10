
import prisma from './src/db';

async function seedRoles() {
    console.log('Seeding Standard Roles and Policies...');

    // 1. Create Default Policy (Soft)
    const softPolicy = await prisma.policy.upsert({
        where: { policy_id: 'policy_default_soft' }, // Use fixed ID if possible? schema says uuid. 
        // We can't query by ID if it doesn't exist. Find by name.
        create: {
            name: 'Standard Employee Policy',
            scope: 'ORG',
            enforcement_mode: 'SOFT',
            rules: JSON.stringify({
                max_misses: 5,
                score_threshold: 40,
                lockout_hours: 4
            })
        },
        update: {},
    } as any);
    // Wait, upsert needs unique where. Name is not unique in schema?
    // Name is not unique in Policy model. I should make it unique if I want to seed idempotently?
    // Or just check if exists.

    // Workaround for non-unique name:
    const exPolicy = await prisma.policy.findFirst({ where: { name: 'Standard Employee Policy' } });
    let policyId = exPolicy?.policy_id;

    if (!exPolicy) {
        const p = await (prisma as any).policy.create({
            data: {
                name: 'Standard Employee Policy',
                scope: 'ORG',
                enforcement_mode: 'SOFT',
                rules: JSON.stringify({
                    max_misses: 5,
                    score_threshold: 40,
                    lockout_hours: 4
                })
            }
        });
        policyId = p.policy_id;
        console.log('Created Standard Policy:', policyId);
    } else {
        console.log('Standard Policy already exists:', policyId);
    }

    // 2. Create Executive Policy (Hard)
    const exExecPolicy = await prisma.policy.findFirst({ where: { name: 'Executive Policy' } });
    let execPolicyId = exExecPolicy?.policy_id;

    if (!exExecPolicy) {
        const p = await (prisma as any).policy.create({
            data: {
                name: 'Executive Policy',
                scope: 'ROLE',
                enforcement_mode: 'HARD',
                rules: JSON.stringify({
                    max_misses: 2,
                    score_threshold: 80,
                    lockout_hours: 24
                })
            }
        });
        execPolicyId = p.policy_id;
        console.log('Created Executive Policy:', execPolicyId);
    } else {
        console.log('Executive Policy already exists:', execPolicyId);
    }

    // 3. Create Roles
    // Role name IS unique.

    // Employee
    try {
        await (prisma as any).role.upsert({
            where: { name: 'Employee' },
            create: {
                name: 'Employee',
                description: 'Standard staff role',
                policy_id: policyId
            },
            update: {
                policy_id: policyId // Ensure policy is linked
            }
        });
        console.log('Role "Employee" ensured.');
    } catch (e) {
        console.error('Error ensuring Employee role:', e);
    }

    // Executive
    try {
        await (prisma as any).role.upsert({
            where: { name: 'Executive' },
            create: {
                name: 'Executive',
                description: 'Leadership role with strict enforcement',
                policy_id: execPolicyId
            },
            update: {
                policy_id: execPolicyId
            }
        });
        console.log('Role "Executive" ensured.');
    } catch (e) {
        console.error('Error ensuring Executive role:', e);
    }

    // Manager
    // Maybe share policy with Employee for now?
    try {
        await (prisma as any).role.upsert({
            where: { name: 'Manager' },
            create: {
                name: 'Manager',
                description: 'Team lead role',
                policy_id: policyId
            },
            update: {
                policy_id: policyId
            }
        });
        console.log('Role "Manager" ensured.');
    } catch (e) {
        console.error('Error ensuring Manager role:', e);
    }

    // Auditor
    try {
        await (prisma as any).role.upsert({
            where: { name: 'Auditor' },
            create: {
                name: 'Auditor',
                description: 'External auditor with read-only access',
                policy_id: null // Auditors are not subject to discipline policies
            },
            update: {}
        });
        console.log('Role "Auditor" ensured.');
    } catch (e) {
        console.error('Error ensuring Auditor role:', e);
    }

}

seedRoles().catch(console.error);
