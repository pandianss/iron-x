import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/db';
import { generateToken } from '../../src/utils/auth';


describe('Discipline Cockpit Endpoints', () => {
    let token: string;
    let userId: string;

    beforeAll(async () => {
        // Setup test user
        const user = await prisma.user.create({
            data: {
                email: `test-cockpit-${Date.now()}@example.com`,
                password_hash: 'hashed_password',
                timezone: 'UTC',
                current_discipline_score: 85,
                discipline_classification: 'STABLE'

            }
        });
        userId = user.user_id;
        token = generateToken(userId);
    });

    afterAll(async () => {
        await prisma.user.delete({ where: { user_id: userId } });
    });

    it('GET /discipline/state should return current enforcement state', async () => {
        const res = await request(app)
            .get('/discipline/state')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('score');
        expect(res.body).toHaveProperty('status');
        expect(['STRICT', 'STABLE', 'DRIFTING', 'BREACH']).toContain(res.body.status);
    });

    it('GET /discipline/pressure should return drift vectors', async () => {
        const res = await request(app)
            .get('/discipline/pressure')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('compositePressure');
        expect(Array.isArray(res.body.driftVectors)).toBe(true);
    });

    it('GET /discipline/predictions should return forward-looking violations', async () => {
        const res = await request(app)
            .get('/discipline/predictions')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('event');
            expect(res.body[0]).toHaveProperty('confidence');
        }
    });

    it('GET /discipline/constraints should return active enforcements', async () => {
        const res = await request(app)
            .get('/discipline/constraints')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('activePolicies');
        expect(res.body).toHaveProperty('reducedPrivileges');
    });

    it('GET /discipline/history should return immutable log', async () => {
        const res = await request(app)
            .get('/discipline/history')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
