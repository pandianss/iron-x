
import { PrismaClient } from '@prisma/client';
import { sign } from 'jsonwebtoken';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api/v1`;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_me';

async function main() {
    console.log('Starting Enterprise Features Verification...');

    // 1. Create a User and Admin
    const email = `test_ent_${Date.now()}@example.com`;
    const user = await prisma.user.create({
        data: {
            email,
            password_hash: 'hash',
            timezone: 'UTC'
        }
    });

    // 2. Configure Mock SSO
    // @ts-ignore
    const ssoConfig = await prisma.sSOConfig.create({
        data: {
            entry_point: 'http://mock-idp.com/login',
            issuer: 'mock-idp',
            cert: 'mock-cert',
            domain_whitelist: 'example.com',
            enabled: true
        }
    });
    console.log(`SSO Config created for example.com`);

    // 3. Test SSO Login Redirect
    console.log('Testing SSO Login Redirect...');
    try {
        const res = await fetch(`${API_URL}/sso/login?domain=example.com`, {
            redirect: 'manual' // Don't follow redirect, just check header
        });

        if (res.status === 302) {
            const loc = res.headers.get('location');
            console.log(`Redirect Location: ${loc}`);
            if (loc && loc.includes('mock-idp.com/login')) {
                console.log('PASS: SSO Login redirects correctly.');
            } else {
                console.error('FAIL: Incorrect redirect location');
            }
        } else {
            console.error(`FAIL: Expected 302, got ${res.status}`);
        }
    } catch (e: any) {
        console.error('FAIL: SSO Login error', e.message);
    }

    // 4. Test SSO Callback (Simulate IDP POST)
    console.log('Testing SSO Callback...');
    try {
        const mockResponse = Buffer.from('MOCK_SUCCESS:test_ent_sso@example.com:mock-idp').toString('base64');
        const res = await fetch(`${API_URL}/sso/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ SAMLResponse: mockResponse })
        });

        // This should fail because 'test_ent_sso@example.com' doesn't exist in DB
        // But let's check if it 401s correctly
        console.log(`Callback Status (Non-existent user): ${res.status}`);
        if (res.status === 401) {
            console.log('PASS: Blocked non-provisioned user.');
        } else {
            console.error(`FAIL: Expected 401, got ${res.status}`);
        }

        // Now update test user email to match
        await prisma.user.update({
            where: { user_id: user.user_id },
            data: { email: 'test_ent_sso@example.com' }
        });

        const res2 = await fetch(`${API_URL}/sso/callback`, {
            redirect: 'manual',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ SAMLResponse: mockResponse })
        });

        if (res2.status === 302) {
            const loc = res2.headers.get('location');
            console.log(`Callback Redirect: ${loc}`);
            if (loc && loc.includes('token=')) {
                console.log('PASS: SSO Callback issued token and redirected.');
            }
        } else {
            console.error(`FAIL: Expected 302 on success, got ${res2.status}`);
        }

    } catch (e: any) {
        console.error('FAIL: SSO Callback error', e.message);
    }

    // 5. Audit Export
    console.log('Testing Audit Export...');
    // Create an audit log
    await prisma.auditLog.create({
        data: {
            actor_id: user.user_id,
            action: 'TEST_ACTION',
            details: 'Testing export'
        }
    });

    const token = sign({ userId: user.user_id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    try {
        const res = await fetch(`${API_URL}/audit/export?userId=${user.user_id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.status === 200) {
            const csv = await res.text();
            console.log('CSV Preview:', csv.substring(0, 100));
            if (csv.includes('TEST_ACTION')) {
                console.log('PASS: Audit export contains created log.');
            } else {
                console.error('FAIL: CSV missing log data');
            }
        } else {
            console.error(`FAIL: Audit export status ${res.status}`);
        }
    } catch (e: any) {
        console.error('FAIL: Audit export error', e.message);
    }

    // Cleanup
    await prisma.auditLog.deleteMany({ where: { actor_id: user.user_id } });
    await prisma.user.delete({ where: { user_id: user.user_id } });
    // @ts-ignore
    await prisma.sSOConfig.delete({ where: { config_id: ssoConfig.config_id } });
    console.log('Cleanup done.');
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
