import { EmailService } from '../../src/modules/communication/email.service';
import nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('EmailService', () => {
    let emailService: EmailService;
    let sendMailMock: jest.Mock;

    beforeEach(() => {
        sendMailMock = jest.fn().mockResolvedValue(true);
        (nodemailer.createTransport as jest.Mock).mockReturnValue({
            sendMail: sendMailMock,
        });

        // Initialize a new instance, which uses the mocked createTransport
        emailService = new EmailService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should send an invitation email with correct options', async () => {
        await emailService.sendInvitationEmail('test@example.com', 'Alpha Team', 'http://invite.link');

        expect(sendMailMock).toHaveBeenCalledTimes(1);
        const options = sendMailMock.mock.calls[0][0];
        expect(options.to).toBe('test@example.com');
        expect(options.subject).toContain("You've been invited to join Alpha Team");
        expect(options.text).toContain('http://invite.link');
    });

    it('should send a welcome email with correct options', async () => {
        await emailService.sendWelcomeEmail('user@test.com', 'John');

        expect(sendMailMock).toHaveBeenCalledTimes(1);
        const options = sendMailMock.mock.calls[0][0];
        expect(options.to).toBe('user@test.com');
        expect(options.subject).toContain('Welcome to Iron-X, John!');
        expect(options.html).toContain('John');
    });

    it('should send a password reset email with correct options', async () => {
        await emailService.sendPasswordResetEmail('reset@test.com', 'http://reset.link');

        expect(sendMailMock).toHaveBeenCalledTimes(1);
        const options = sendMailMock.mock.calls[0][0];
        expect(options.to).toBe('reset@test.com');
        expect(options.subject).toContain('Reset your Iron-X password');
        expect(options.html).toContain('http://reset.link');
    });

    it('should send a weekly digest with correct options', async () => {
        const stats = { completed: 10, score: 95 };
        await emailService.sendWeeklyDigest('digest@test.com', stats);

        expect(sendMailMock).toHaveBeenCalledTimes(1);
        const options = sendMailMock.mock.calls[0][0];
        expect(options.to).toBe('digest@test.com');
        expect(options.subject).toContain('Your Weekly Discipline Report');
        expect(options.text).toContain('10');
        expect(options.text).toContain('95');
    });
});
