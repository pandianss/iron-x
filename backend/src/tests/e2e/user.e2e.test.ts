import request from 'supertest';
import { app } from '../../app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: 'postgresql://test_user:test_password@localhost:5434/test_db?schema=public'
        }
    }
});

describe('User Lifecycle E2E', () => {
    const testEmail = `e2e-user-${Date.now()}@example.com`;
    const testPassword = 'password123';
    let token: string;
    let userId: string;

    afterAll(async () => {
        await prisma.user.deleteMany({ where: { email: testEmail } });
        await prisma.$disconnect();
    });

    it('should register a new user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/register')
            .send({
                email: testEmail,
                password: testPassword
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', testEmail);

        token = res.body.token;
        userId = res.body.user.user_id; // Adjust based on actual response structure
    });

    it('should login with the new user', async () => {
        const res = await request(app)
            .post('/api/v1/auth/login')
            .send({
                email: testEmail,
                password: testPassword
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
    });

    it('should access protected profile route', async () => {
        const res = await request(app)
            .get('/api/v1/user/profile')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('email', testEmail);
    });

    it('should fail to access with invalid token', async () => {
        const res = await request(app)
            .get('/api/v1/user/profile')
            .set('Authorization', 'Bearer invalid-token');

        expect(res.status).toBe(403);
    });
});
