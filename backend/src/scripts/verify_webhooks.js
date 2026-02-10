
const crypto = require('crypto');

// Replicating service logic for verification script
function signPayload(payload, secret) {
    const data = JSON.stringify(payload);
    return crypto.createHmac('sha256', secret).update(data).digest('hex');
}

function verifyWebhooks() {
    console.log('Verifying Webhook Signing...');

    const secret = 'whsec_test_123';
    const payload = {
        event: 'score.changed',
        timestamp: new Date().toISOString(),
        data: { userId: 'u_123', newScore: 85 }
    };

    const signature = signPayload(payload, secret);
    console.log(`Payload: ${JSON.stringify(payload)}`);
    console.log(`Signature: ${signature}`);

    // Verify
    const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    if (signature === expected) {
        console.log('[PASS] Signature matches.');
    } else {
        console.error('[FAIL] Signature mismatch.');
    }
}

verifyWebhooks();
