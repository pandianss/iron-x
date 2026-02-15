
import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api/v1`;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me';

async function main() {
    console.log('Starting Compliance API Verification...');

    // 1. Create a test user
    const email = `test_comp_${Date.now()}@example.com`;
    const user = await prisma.user.create({
        data: {
            email,
            password_hash: 'hash',
            timezone: 'UTC'
        }
    });

    // 2. Generate token
    const token = sign({ userId: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    console.log(`Generated token for user: ${user.user_id}`);

    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

    // 3. Test Report API
    console.log('Testing /compliance/report/SOC 2...');
    try {
        const res1 = await fetch(`${API_URL}/compliance/report/SOC 2`, { headers });
        console.log('Status:', res1.status);
        if (res1.status === 200) {
            const data = await res1.json();
            if (data.framework === 'SOC 2') {
                console.log('PASS: Report generated successfully.');
                console.log(`Controls found: ${data.total_controls}`);
            } else {
                console.error('FAIL: Unexpected response format', data);
            }
        } else {
            console.error('FAIL: Status not 200');
        }
    } catch (e: any) {
        console.error('FAIL: Report endpoint failed', e.message);
    }

    // 4. Test Export API
    console.log('Testing /compliance/export/ISO 27001...');
    try {
        const res2 = await fetch(`${API_URL}/compliance/export/ISO 27001`, { headers });
        console.log('Status:', res2.status);
        if (res2.status === 200) {
            const text = await res2.text();
            if (text.includes('EVIDENCE PACK FOR ISO 27001')) {
                console.log('PASS: Export generated successfully.');
            } else {
                console.error('FAIL: Unexpected export content', text);
            }
        } else {
            console.error('FAIL: Status not 200');
        }
    } catch (e: any) {
        console.error('FAIL: Export endpoint failed', e.message);
    }

    // Cleanup
    await prisma.user.delete({ where: { user_id: user.user_id } });
    console.log('Cleanup done.');
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
