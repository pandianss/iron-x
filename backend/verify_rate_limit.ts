
const BASE_URL = 'http://localhost:3000';

async function runVerification() {
    console.log('Testing Auth Rate Limit (Max 10 per hour)...');
    let blocked = false;
    for (let i = 0; i < 15; i++) {
        const res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'fake@test.com', password: 'fake' })
        });

        console.log(`Request ${i + 1}: Status ${res.status}`);
        if (res.status === 429) {
            blocked = true;
            console.log('SUCCESS: Rate limit hit (429).');
            break;
        }
    }

    if (!blocked) {
        console.error('FAILURE: Rate limit not triggered.');
    }
}

runVerification();
