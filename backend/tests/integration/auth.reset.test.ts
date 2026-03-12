import request from 'supertest';
import { app } from '../../src/app';
import prisma from '../../src/db';
import crypto from 'crypto';

jest.mock('../../src/db', () => ({
    __esModule: true,
    default: {
        user: {
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn()
        }
    }
}));

jest.mock('../../src/modules/communication/email.service', () => ({
    EmailService: jest.fn().mockImplementation(() => ({
        sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
    }))
}));

describe('Password Reset Flow', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/forgot-password', () => {
        it('should return 200 and send email if user exists', async () => {
            const mockUser = {
                user_id: 'user-123',
                email: 'forgot@example.com'
            };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.update as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/api/v1/auth/forgot-password') // Note standard routing appends /api/v1 prefix
                .send({ email: 'forgot@example.com' });

            expect(res.status).toBe(200);
            expect(res.body.message).toContain('email has been sent');
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { user_id: 'user-123' },
                    data: expect.objectContaining({
                        password_reset_token: expect.any(String)
                    })
                })
            );
        });

        it('should return 200 even if user does not exist (anti-enumeration)', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .post('/api/v1/auth/forgot-password')
                .send({ email: 'nonexistent@example.com' });

            expect(res.status).toBe(200);
            expect(prisma.user.update).not.toHaveBeenCalled();
        });
    });

    describe('POST /auth/reset-password', () => {
        it('should reject an invalid token', async () => {
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({ token: 'invalid_token', newPassword: 'newpassword123' });

            expect(res.status).toBe(400); // Bad Request from AppError
            expect(res.body.message).toContain('Invalid or expired password reset token');
        });

        it('should reset password on a valid token', async () => {
            const mockUser = {
                user_id: 'user-reset-123',
                email: 'reset@example.com'
            };
            (prisma.user.findFirst as jest.Mock).mockResolvedValue(mockUser);
            (prisma.user.update as jest.Mock).mockResolvedValue({ ...mockUser, password_hash: 'new_hash' });

            const res = await request(app)
                .post('/api/v1/auth/reset-password')
                .send({ token: 'valid_token', newPassword: 'newpassword123' });

            expect(res.status).toBe(200);
            expect(res.body.message).toContain('reset successfully');
            expect(prisma.user.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { user_id: 'user-reset-123' },
                    data: expect.objectContaining({
                        password_hash: expect.any(String),
                        password_reset_token: null,
                        password_reset_expires: null
                    })
                })
            );
        });
    });
});
