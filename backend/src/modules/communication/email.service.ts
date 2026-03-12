import { singleton } from 'tsyringe';
import nodemailer from 'nodemailer';

@singleton()
export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER, // generated ethereal user
                pass: process.env.SMTP_PASS, // generated ethereal password
            },
        });
    }

    async sendInvitationEmail(to: string, teamName: string, inviteLink: string) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Iron-X" <noreply@iron-x.com>',
            to,
            subject: `You've been invited to join ${teamName} on Iron-X`,
            text: `Click here to join: ${inviteLink}`,
            html: `<p>Click <a href="${inviteLink}">here</a> to join ${teamName} on Iron-X.</p>`
        };
        await this.transporter.sendMail(mailOptions);
        return true;
    }

    async sendWelcomeEmail(to: string, userName: string) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Iron-X" <noreply@iron-x.com>',
            to,
            subject: `Welcome to Iron-X, ${userName}!`,
            text: `We're excited to have you on board. Start tracking your discipline today!`,
            html: `<p>We're excited to have you on board, <strong>${userName}</strong>! Start tracking your discipline today!</p>`
        };
        await this.transporter.sendMail(mailOptions);
        return true;
    }

    async sendPasswordResetEmail(to: string, resetLink: string) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Iron-X" <noreply@iron-x.com>',
            to,
            subject: `Reset your Iron-X password`,
            text: `Follow this link to reset your password: ${resetLink}`,
            html: `<p>Follow this link to reset your password: <a href="${resetLink}">Reset Password</a></p>`
        };
        await this.transporter.sendMail(mailOptions);
        return true;
    }

    async sendWeeklyDigest(to: string, stats: any) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Iron-X" <noreply@iron-x.com>',
            to,
            subject: `Your Weekly Discipline Report`,
            text: `You completed ${stats.completed} actions this week with a score of ${stats.score}.`,
            html: `<p>You completed <strong>${stats.completed}</strong> actions this week with a score of <strong>${stats.score}</strong>.</p>`
        };
        await this.transporter.sendMail(mailOptions);
        return true;
    }
    async sendEmail(to: string, subject: string, message: string) {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Iron-X" <noreply@iron-x.com>',
            to,
            subject,
            text: message,
            html: `<p>${message}</p>`
        };
        await this.transporter.sendMail(mailOptions);
        return true;
    }
}

export const emailService = new EmailService();
