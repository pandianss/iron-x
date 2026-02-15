import { singleton } from 'tsyringe';

@singleton()
export class EmailService {
    async sendInvitationEmail(to: string, teamName: string, inviteLink: string) {
        console.log(`[EmailService] Sending invitation to ${to}`);
        console.log(`[EmailService] Subject: You've been invited to join ${teamName} on Iron-X`);
        console.log(`[EmailService] Body: Click here to join: ${inviteLink}`);
        return true;
    }

    async sendWelcomeEmail(to: string, userName: string) {
        console.log(`[EmailService] Sending welcome email to ${to}`);
        console.log(`[EmailService] Subject: Welcome to Iron-X, ${userName}!`);
        console.log(`[EmailService] Body: We're excited to have you on board. Start tracking your discipline today!`);
        return true;
    }

    async sendPasswordResetEmail(to: string, resetLink: string) {
        console.log(`[EmailService] Sending password reset email to ${to}`);
        console.log(`[EmailService] Subject: Reset your Iron-X password`);
        console.log(`[EmailService] Body: Follow this link to reset your password: ${resetLink}`);
        return true;
    }

    async sendWeeklyDigest(to: string, stats: any) {
        console.log(`[EmailService] Sending weekly digest to ${to}`);
        console.log(`[EmailService] Subject: Your Weekly Discipline Report`);
        console.log(`[EmailService] Body: You completed ${stats.completed} actions this week with a score of ${stats.score}.`);
        return true;
    }
}

export const emailService = new EmailService();
