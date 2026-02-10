
const BASE_URL = 'http://localhost:3000';
let token = '';
let userId = '';

async function runVerification() {
    try {
        console.log('1. Registering Limit User...');
        const email = `limit_test_${Date.now()}@test.com`;
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password', timezone: 'UTC' })
        });

        let loginData;
        if (regRes.status === 201) {
            loginData = await regRes.json();
        } else {
            // Try login
            const loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: 'password' })
            });
            loginData = await loginRes.json();
        }

        token = loginData.token;
        userId = loginData.user.id;
        console.log('   User ID:', userId);

        const authHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('2. Creating 3 Actions (Allowed)...');
        for (let i = 0; i < 3; i++) {
            const res = await fetch(`${BASE_URL}/actions`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    title: `Action ${i + 1}`,
                    goal_id: null,
                    frequency_rule: 'DAILY',
                    window_start_time: '10:00',
                    window_duration_minutes: 30,
                    is_strict: false
                })
            });
            if (!res.ok) throw new Error(`Failed to create action ${i + 1}: ${res.status}`);
        }
        console.log('   3 Actions Created.');

        console.log('3. Creating 4th Action (Should Fail)...');
        const res4 = await fetch(`${BASE_URL}/actions`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                title: 'Action 4',
                frequency_rule: 'DAILY',
                window_start_time: '10:00',
                window_duration_minutes: 30,
                is_strict: false
            })
        });
        if (res4.status === 403) {
            console.log('   SUCCESS: Action 4 blocked (403).');
        } else {
            console.error(`   FAILURE: Action 4 status ${res4.status}`);
        }

        console.log('4. Creating Strict Action (Should Fail)...');
        const resStrict = await fetch(`${BASE_URL}/actions`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                title: 'Strict Action',
                frequency_rule: 'DAILY',
                window_start_time: '10:00',
                window_duration_minutes: 30,
                is_strict: true
            })
        });
        if (resStrict.status === 403) {
            console.log('   SUCCESS: Strict Action blocked (403).');
        } else {
            console.error(`   FAILURE: Strict Action status ${resStrict.status}`);
        }


        console.log('5. Upgrading to PRO...');
        // Manually insert subscription via Prisma just for test? Or use admin endpoint?
        // Since we don't have an admin endpoint for this yet, let's use a temporary endpoint or direct DB if verify_limits was server-side.
        // But verify_limits is a client script.
        // Let's create a temporary admin route or just assume checking LIMITS is enough for H1.
        // Wait, Task H1 says "Enforce limits by plan".

        // I'll add a temporary route to upgrade user for testing purposes? 
        // Or better, I can use the existing `check_schema.ts` style to run a backend script to upgrade the user.
        // But I need the userId.

        console.log('   (Skipping PRO verification in this script, will verify manually or via separate DB script)');

    } catch (error) {
        console.error('VERIFICATION FAILED', error);
    }
}

runVerification();
