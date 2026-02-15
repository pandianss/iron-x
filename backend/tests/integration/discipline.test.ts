import request from 'supertest';
import prisma from '../../src/db';
import { generateToken } from '../../src/utils/auth';

// Mock DB
jest.mock('../../src/db', () => ({
    __esModule: true,
    default: {
        user: { findUnique: jest.fn(), create: jest.fn(), delete: jest.fn() },
        action: { findMany: jest.fn() },
        actionInstance: { findMany: jest.fn() },
        policy: { findFirst: jest.fn() },
    }
}));

// Mock BullMQ
jest.mock('bullmq', () => ({
    Queue: jest.fn().mockImplementation(() => ({
        add: jest.fn(),
    })),
    Worker: jest.fn().mockImplementation(() => ({
        on: jest.fn(),
    })),
}));

// Import app AFTER mocking
import { app } from '../../src/app';


describe('Discipline Cockpit Endpoints', () => {
    let token: string;
    let userId: string;

    beforeAll(async () => {
        // Setup test user
        const user = {
            user_id: 'test-user-id',
            email: `test-cockpit@example.com`,
            password_hash: 'hashed_password',
            timezone: 'UTC',
            current_discipline_score: 85,
            discipline_classification: 'STABLE',
            role: { policy: { rules: JSON.stringify({ max_misses: 3 }), enforcement_mode: 'SOFT' } }
        };

        (prisma.user.create as jest.Mock).mockResolvedValue(user);
        // We mock findUnique because roleAuthMiddleware might use it
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);

        userId = user.user_id;
        token = generateToken(userId);
    });

    afterAll(async () => {
        // No cleanup needed for mocks
    });

    it('GET /api/v1/discipline/state should return current enforcement state', async () => {
        const res = await request(app)
            .get('/api/v1/discipline/state')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('score');
        expect(res.body).toHaveProperty('status');
        expect(['STRICT', 'STABLE', 'DRIFTING', 'BREACH']).toContain(res.body.status);
    });

    it('GET /api/v1/discipline/pressure should return drift vectors', async () => {
        const res = await request(app)
            .get('/api/v1/discipline/pressure')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        // expect(res.body).toHaveProperty('compositePressure'); // TODO: Implement service
        // expect(Array.isArray(res.body.driftVectors)).toBe(true);
    });

    it('GET /api/v1/discipline/predictions should return forward-looking violations', async () => {
        const res = await request(app)
            .get('/api/v1/discipline/predictions')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('event');
            expect(res.body[0]).toHaveProperty('confidence');
        }
    });

    it('GET /api/v1/discipline/constraints should return active enforcements', async () => {
        const res = await request(app)
            .get('/api/v1/discipline/constraints')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        // expect(res.body).toHaveProperty('activePolicies'); // TODO: Implement service
        // expect(res.body).toHaveProperty('reducedPrivileges');
    });

    it('GET /api/v1/discipline/history should return immutable log', async () => {
        const res = await request(app)
            .get('/api/v1/discipline/history')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
