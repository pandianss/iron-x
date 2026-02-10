import path from 'path';
import fs from 'fs';

const TEST_DB_PATH = path.join(__dirname, 'test_core.db');
const DATABASE_URL = `file:${TEST_DB_PATH}`;
process.env.DATABASE_URL = DATABASE_URL;

import request from 'supertest';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';

import { setupTestDb, teardownTestDb } from '../test-utils';

describe('Core Flows Integration Tests', () => {
    let prisma: PrismaClient;
    let authToken: string;
    let userId: string;

    beforeAll(async () => {
        const setup = await setupTestDb(TEST_DB_PATH);
        prisma = setup.prisma;

        // Seed roles
        await prisma.role.create({
            data: { name: 'Employee', description: 'Default' }
        });

        // Register and Login to get token
        const authRes = await request(app)
            .post('/auth/register')
            .send({
                email: 'core@example.com',
                password: 'password123',
                timezone: 'UTC'
            });

        authToken = authRes.body.token;
        userId = authRes.body.user.id;
    }, 30000);

    afterAll(async () => {
        await teardownTestDb(prisma, TEST_DB_PATH);
    });

    describe('Goals', () => {
        it('should create a goal successfully', async () => {
            const res = await request(app)
                .post('/goals')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    title: 'Test Goal',
                    description: 'Goal description'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('goal_id');
            expect(res.body.title).toBe('Test Goal');

            // Verify Persistance
            const goal = await prisma.goal.findUnique({ where: { goal_id: res.body.goal_id } });
            expect(goal).toBeTruthy();
            expect(goal?.user_id).toBe(userId);
        });
    });

    describe('Actions', () => {
        let goalId: string;

        beforeAll(async () => {
            const goal = await prisma.goal.create({
                data: {
                    user_id: userId,
                    title: 'Parent Goal',
                }
            });
            goalId = goal.goal_id;
        });

        it('should fail to create strict action on FREE plan', async () => {
            const res = await request(app)
                .post('/actions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    goal_id: goalId,
                    title: 'Strict Action',
                    description: 'Strict mode request',
                    frequency_rule: 'DAILY',
                    window_start_time: '09:00',
                    window_duration_minutes: 60,
                    is_strict: true
                });

            expect(res.status).toBe(403);
            expect(res.body.code).toContain('PLAN_LIMIT_EXCEEDED');
        });

        it('should create a standard action linked to a goal', async () => {
            const res = await request(app)
                .post('/actions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    goal_id: goalId,
                    title: 'Test Action',
                    description: 'Do the thing',
                    frequency_rule: 'DAILY',
                    window_start_time: '09:00',
                    window_duration_minutes: 60,
                    is_strict: false
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('action_id');
            expect(res.body.goal_id).toBe(goalId);

            // Verify persistence
            const action = await prisma.action.findUnique({ where: { action_id: res.body.action_id } });
            expect(action).toBeTruthy();
            expect(action?.title).toBe('Test Action');
        });

        it('should retrieve actions for the user', async () => {
            const res = await request(app)
                .get('/actions')
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0]).toHaveProperty('action_id');
        });
    });
});
