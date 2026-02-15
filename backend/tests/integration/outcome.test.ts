import path from 'path';
import fs from 'fs';

const TEST_DB_PATH = path.join(__dirname, 'test_outcome.db');
const DATABASE_URL = `file:${TEST_DB_PATH}`;
process.env.DATABASE_URL = DATABASE_URL;

import request from 'supertest';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import { app } from '../../src/app';

import { setupTestDb, teardownTestDb } from '../test-utils';

describe('Outcome Module Integration Tests', () => {
    let prisma: PrismaClient;
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
        const setup = await setupTestDb(TEST_DB_PATH);
        prisma = setup.prisma;

        await prisma.role.create({
            data: { name: 'Employee', description: 'Default' }
        });

        const authRes = await request(app)
            .post('/auth/register')
            .send({ email: 'outcome@test.com', password: 'password123', timezone: 'UTC' });
        authToken = authRes.body.token;
        userId = authRes.body.user.id;
    }, 30000);

    afterAll(async () => {
        await teardownTestDb(prisma, TEST_DB_PATH);
    });

    it('should include governance header in responses', async () => {
        const res = await request(app)
            .get(`/outcomes/user/${userId}`)
            .set('Authorization', `Bearer ${authToken}`);

        // Outcomes might be empty, but header must be there
        expect(res.headers).toHaveProperty('x-outcome-disclaimer');
        expect(res.headers['x-outcome-disclaimer']).toContain('Not for punitive HR use');
    });

    it('should generate "High Reliability" outcome upon evaluation with sufficient data', async () => {
        // Seed 7 days of high scores
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            await prisma.disciplineScore.create({
                data: {
                    user_id: userId,
                    date: date,
                    score: 90 + i, // High score
                }
            });
        }

        // Trigger Evaluation
        const res = await request(app)
            .post(`/outcomes/evaluate/${userId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);

        // Check DB
        const outcomes = await prisma.outcome.findMany({ where: { user_id: userId, type: 'RELIABILITY' } });
        expect(outcomes.length).toBeGreaterThan(0);
        expect(outcomes[0].title).toBe('High Reliability Streak');
    });

    it('should retrieve outcomes for user', async () => {
        const res = await request(app)
            .get(`/outcomes/user/${userId}`)
            .set('Authorization', `Bearer ${authToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0]).toHaveProperty('outcome_id');
        expect(res.body[0].type).toBe('RELIABILITY');
    });
});
