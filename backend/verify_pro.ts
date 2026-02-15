
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:3000';

async function runVerification() {
    try {
        console.log('1. Registering PRO User...');
        const email = `pro_test_${Date.now()}@test.com`;
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password', timezone: 'UTC' })
        });

        const loginData = await regRes.json();
        const token = loginData.token;
        const userId = loginData.user.id;
        console.log('   User ID:', userId);

        // Upgrade User
        console.log('2. Upgrading to PRO (Backend Simulation)...');
        await prisma.subscription.upsert({
            where: { user_id: userId },
            update: { plan_tier: 'INDIVIDUAL_PRO' },
            create: { user_id: userId, plan_tier: 'INDIVIDUAL_PRO' }
        });
        console.log('   Upgraded.');

        const authHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('3. Creating 4 Actions (Should Succeed)...');
        for (let i = 0; i < 4; i++) {
            const res = await fetch(`${BASE_URL}/actions`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    title: `Pro Action ${i + 1}`,
                    goal_id: null,
                    frequency_rule: 'DAILY',
                    window_start_time: '10:00',
                    window_duration_minutes: 30,
                    is_strict: false
                })
            });
            if (!res.ok) throw new Error(`Failed to create action ${i + 1}: ${res.status}`);
        }
        console.log('   4 Actions Created (Limit Bypassed).');

        console.log('4. Creating Strict Action (Should Succeed)...');
        const resStrict = await fetch(`${BASE_URL}/actions`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                title: 'Strict Pro Action',
                frequency_rule: 'DAILY',
                window_start_time: '10:00',
                window_duration_minutes: 30,
                is_strict: true
            })
        });
        if (resStrict.ok) {
            console.log('   SUCCESS: Strict Action Created.');
        } else {
            console.error(`   FAILURE: Strict Action status ${resStrict.status}`);
        }

    } catch (error) {
        console.error('VERIFICATION FAILED', error);
    } finally {
        await prisma.$disconnect();
    }
}

runVerification();
