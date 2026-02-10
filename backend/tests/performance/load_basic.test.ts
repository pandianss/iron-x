import path from 'path';
import fs from 'fs';

const TEST_DB_PATH = path.join(__dirname, 'test_perf.db');
const DATABASE_URL = `file:${TEST_DB_PATH}`;
process.env.DATABASE_URL = DATABASE_URL;

import request from 'supertest';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';
import { performance } from 'perf_hooks';

import { setupTestDb, teardownTestDb } from '../test-utils';

describe('Performance Tests', () => {
    let prisma: PrismaClient;
    let authToken: string;

    beforeAll(async () => {
        const setup = await setupTestDb(TEST_DB_PATH);
        prisma = setup.prisma;

        // Seed roles
        await prisma.role.create({
            data: { name: 'Employee', description: 'Default' }
        });

        // Setup user
        const authRes = await request(app)
            .post('/auth/register')
            .send({
                email: 'perf@example.com',
                password: 'password123',
                timezone: 'UTC'
            });
        authToken = authRes.body.token;
    }, 30000);

    afterAll(async () => {
        await teardownTestDb(prisma, TEST_DB_PATH);
    });

    it('should respond to health check within 100ms', async () => {
        const start = performance.now();
        const res = await request(app).get('/');
        const end = performance.now();

        expect(res.status).toBe(200);
        expect(end - start).toBeLessThan(100);
    });

    it('should authenticate within 500ms', async () => {
        const start = performance.now();
        const res = await request(app)
            .post('/auth/login')
            .send({
                email: 'perf@example.com',
                password: 'password123'
            });
        const end = performance.now();

        expect(res.status).toBe(200);
        expect(end - start).toBeLessThan(500); // hashing takes time
    });

    it('should retrieve action list within 200ms', async () => {
        const start = performance.now();
        const res = await request(app)
            .get('/actions')
            .set('Authorization', `Bearer ${authToken}`);
        const end = performance.now();

        expect(res.status).toBe(200);
        expect(end - start).toBeLessThan(200);
    });
});
