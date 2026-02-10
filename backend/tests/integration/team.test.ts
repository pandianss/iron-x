import path from 'path';
import fs from 'fs';

const TEST_DB_PATH = path.join(__dirname, 'test_team.db');
const DATABASE_URL = `file:${TEST_DB_PATH}`;
process.env.DATABASE_URL = DATABASE_URL;

import request from 'supertest';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';
import app from '../../src/app';

import { setupTestDb, teardownTestDb } from '../test-utils';

describe('Team Module Integration Tests', () => {
    let prisma: PrismaClient;
    let managerToken: string;
    let managerId: string;
    let memberToken: string;
    let memberId: string;

    beforeAll(async () => {
        const setup = await setupTestDb(TEST_DB_PATH);
        prisma = setup.prisma;

        // Seed System Role
        await prisma.role.create({
            data: { name: 'Employee', description: 'Default' }
        });

        // Create Manager User
        const mgrRes = await request(app)
            .post('/auth/register')
            .send({ email: 'manager@team.com', password: 'password123', timezone: 'UTC' });
        managerToken = mgrRes.body.token;
        managerId = mgrRes.body.user.id;

        // Create Member User
        const memRes = await request(app)
            .post('/auth/register')
            .send({ email: 'member@team.com', password: 'password123', timezone: 'UTC' });
        memberToken = memRes.body.token;
        memberId = memRes.body.user.id;
    }, 30000);

    afterAll(async () => {
        await teardownTestDb(prisma, TEST_DB_PATH);
    });

    let teamId: string;

    it('should create a team successfully', async () => {
        const res = await request(app)
            .post('/team') // endpoint is /team in app.ts?
            .set('Authorization', `Bearer ${managerToken}`)
            .send({ name: 'Alpha Team' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('team_id');
        expect(res.body.name).toBe('Alpha Team');
        teamId = res.body.team_id;

        // Verify Owner Membership
        const member = await prisma.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: managerId } }
        });
        expect(member?.role).toBe('MANAGER');
    });

    it('should add a member to the team', async () => {
        const res = await request(app)
            .post('/team/members')
            .set('Authorization', `Bearer ${managerToken}`)
            .send({
                teamId: teamId,
                email: 'member@team.com',
                role: 'MEMBER'
            });

        expect(res.status).toBe(201);

        // Verify
        const member = await prisma.teamMember.findUnique({
            where: { team_id_user_id: { team_id: teamId, user_id: memberId } }
        });
        expect(member?.role).toBe('MEMBER');
    });

    it('should prevent non-managers from adding members', async () => {
        // Create another user
        const outsiderRes = await request(app)
            .post('/auth/register')
            .send({ email: 'outsider@team.com', password: 'password123' });
        const outsiderToken = outsiderRes.body.token;

        const res = await request(app)
            .post('/team/members')
            .set('Authorization', `Bearer ${memberToken}`) // Member trying to add
            .send({
                teamId: teamId,
                email: 'outsider@team.com',
                role: 'MEMBER'
            });

        expect(res.status).toBe(403);
    });

    it('should retrieve team stats for manager', async () => {
        const res = await request(app)
            .get(`/team/${teamId}/stats`)
            .set('Authorization', `Bearer ${managerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.totalMembers).toBe(2);
        expect(res.body.members).toHaveLength(2);
    });

    it('should deny team stats for non-managers', async () => {
        const res = await request(app)
            .get(`/team/${teamId}/stats`)
            .set('Authorization', `Bearer ${memberToken}`);

        expect(res.status).toBe(403);
    });
});
