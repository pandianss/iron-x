
const BASE_URL = 'http://localhost:3000';
let token = '';

async function runVerification() {
    try {
        console.log('1. Registering User...');
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'verify@test.com',
                password: 'password123',
                timezone: 'UTC'
            })
        });

        if (regRes.status === 201) {
            console.log('   User registered.');
        } else if (regRes.status === 400) {
            console.log('   User likely already exists, proceeding to login.');
        } else {
            console.error(`   Registration failed: ${regRes.status} ${regRes.statusText}`);
            const txt = await regRes.text();
            console.error(txt);
            // Don't exit, try login
        }

        console.log('2. Logging In...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'verify@test.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) {
            throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
        }

        const loginData = await loginRes.json();
        token = loginData.token;
        console.log('   Logged in. Token received.');

        const authHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('3. Creating Goal...');
        const goalRes = await fetch(`${BASE_URL}/goals`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({
                title: 'Verification Goal',
                description: 'Testing via script'
            })
        });

        if (!goalRes.ok) throw new Error(`Goal creation failed: ${await goalRes.text()}`);
        const goalData = await goalRes.json();
        const goalId = goalData.goal_id;
        console.log(`   Goal created: ${goalId}`);

        console.log('4. Creating Action...');
        // Need to match the expected Action structure
        const actionPayload = {
            title: 'Verify Action',
            description: 'Run verification script',
            goal_id: goalId,
            frequency_rule: 'DAILY',
            window_start_time: '08:00', // HH:mm format
            window_duration_minutes: 60,
            is_strict: true
        };
        const actionRes = await fetch(`${BASE_URL}/actions`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(actionPayload)
        });

        if (!actionRes.ok) throw new Error(`Action creation failed: ${await actionRes.text()}`);
        const actionData = await actionRes.json();
        const actionId = actionData.action_id;
        console.log(`   Action created: ${actionId}`);

        console.log('5. Verifying Dashboard (Schedule)...');
        const scheduleRes = await fetch(`${BASE_URL}/schedule/today`, {
            headers: authHeaders
        });
        if (!scheduleRes.ok) throw new Error(`Schedule fetch failed: ${await scheduleRes.text()}`);
        const scheduleData = await scheduleRes.json();
        console.log(`   Schedule items: ${scheduleData.length}`);

        console.log('6. Verifying Analytics (Discipline Score)...');
        const analyticsRes = await fetch(`${BASE_URL}/analytics/daily`, {
            headers: authHeaders
        });
        if (!analyticsRes.ok) throw new Error(`Analytics fetch failed: ${await analyticsRes.text()}`);
        const analyticsData = await analyticsRes.json();
        console.log('   Analytics Data:', JSON.stringify(analyticsData, null, 2));

        console.log('VERIFICATION SUCCESSFUL');

    } catch (error) {
        console.error('VERIFICATION FAILED');
        console.error(error);
        process.exit(1);
    }
}

runVerification();
