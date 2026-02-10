
// Native fetch is available in Node 18+

const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');

// Mock HRMS System
const app = express();
app.use(bodyParser.json());

const MY_SECRET = 'whsec_test_123';
const PORT = 3001;

// 1. Webhook Receiver
app.post('/webhooks/discipline', (req, res) => {
    const signature = req.headers['x-discipline-signature'];
    const payload = JSON.stringify(req.body);
    const expected = crypto.createHmac('sha256', MY_SECRET).update(payload).digest('hex');

    if (signature !== expected) {
        console.error('[HRMS] Invalid Webhook Signature!');
        return res.status(401).send('Invalid Signature');
    }

    console.log(`[HRMS] Received Event: ${req.body.event}`);
    console.log(`[HRMS] Data:`, req.body.data);

    if (req.body.event === 'score.changed' && req.body.data.newScore < 50) {
        console.log('[HRMS] ALERT: Low discipline score detected. Triggering Performance Review workflow...');
    }

    res.status(200).send('OK');
});

// 2. Poll API for Compliance Check
async function checkCompliance(userId) {
    console.log(`[HRMS] Checking compliance for user ${userId}...`);
    // Mock API call to Discipline System
    // const response = await fetch(`http://localhost:3000/api/v1/external/metrics?userId=${userId}`, {
    //     headers: { 'Authorization': 'Bearer sk_test_discipline_ecosystem' }
    // });
    // const data = await response.json();

    // Mock Response
    const data = { score: 85, trend: 'STABLE' };
    console.log(`[HRMS] User Score: ${data.score}. Status: Active.`);
}

// Start Server
if (require.main === module) {
    const server = app.listen(PORT, () => {
        console.log(`[HRMS] Listening on port ${PORT}`);
        // Simulate a check
        checkCompliance('u_123');
    });

    // Close after 5 seconds for test
    setTimeout(() => {
        server.close();
        console.log('[HRMS] Demo finished.');
    }, 5000);
}
