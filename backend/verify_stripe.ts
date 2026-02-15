
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// app.ts usually listens on PORT env var. Let's check. 
// verify_enterprise used 3000. 
// docker-compose maps 4000:4000 usually.
// verify_enterprise says: const PORT = process.env.PORT || 3000;
// Let's use 3000 as default or env.

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

async function verifyStripe() {
    console.log('Starting Stripe Verification...');

    // 1. Create a Test User
    const email = `test_stripe_${Date.now()}@example.com`;
    // Manually create user to bypass auth flow or use register
    const user = await prisma.user.create({
        data: {
            email,
            password_hash: 'hash',
            timezone: 'UTC'
        }
    });
    console.log(`Created user: ${user.user_id}`);

    // Generate Token
    const token = jwt.sign({ userId: user.user_id, email: user.email, role: 'USER' }, process.env.JWT_SECRET || 'super_secret_jwt_key_change_me', { expiresIn: '1h' });

    console.log(`Testing /billing/checkout at ${BASE_URL}...`);
    try {
        const res = await fetch(`${BASE_URL}/billing/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                priceId: 'price_fake_123',
                successUrl: 'http://localhost:3000/success',
                cancelUrl: 'http://localhost:3000/cancel'
            })
        });

        if (res.status === 500) {
            // Mock key might fail if not valid format for Stripe SDK even in mock mode?
            // Actually Stripe SDK throws if key is invalid format.
            // We used 'sk_test_mock_key' which might cause Stripe SDK to error on init if it checks regex.
            const text = await res.text();
            console.log('Checkout failed (Expected if using fake key without proper mock):', text);
        } else {
            const data = await res.json();
            console.log('Checkout Session URL:', data.url);
        }
    } catch (e) {
        console.error('Checkout fetch error:', e);
    }

    // 3. Test Webhook (Mock)
    console.log(`Testing /billing/webhook at ${BASE_URL}...`);
    // We need to simulate a Stripe event. 
    // Note: Signature verification will fail unless we mock the signature or the service skips it.
    // Real Stripe SDK verification is strict.
    // For this test, we can try, but expect 400 Signature Error.
    try {
        const resWeb = await fetch(`${BASE_URL}/billing/webhook`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Stripe-Signature': 't=123,v1=fake_sig'
            },
            body: JSON.stringify({
                type: 'checkout.session.completed',
                data: {
                    object: {
                        metadata: { userId: user.user_id },
                        subscription: 'sub_fake_123'
                    }
                }
            })
        });
        const textWeb = await resWeb.text();
        console.log('Webhook Response:', resWeb.status, textWeb); // Expect 400 due to signature
    } catch (e) {
        console.error('Webhook fetch error:', e);
    }

    // Cleanup
    await prisma.user.delete({ where: { user_id: user.user_id } });
    console.log('Cleanup done.');
}

verifyStripe();
