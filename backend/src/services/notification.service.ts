import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'tsyringe';
import { Logger } from '../utils/logger';
import { EmailService } from '../modules/communication/email.service';
import { domainEvents, DomainEventType } from '../kernel/domain/events';

@injectable()
export class NotificationService {
    constructor(
        @inject('PrismaClient') private prisma: PrismaClient,
        private emailService: EmailService
    ) { }

    async checkAndNotify(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                action_instances: {
                    where: {
                        status: 'PENDING',
                        scheduled_start_time: {
                            gte: new Date(),
                            lte: new Date(Date.now() + 2 * 60 * 60 * 1000) // Next 2 hours
                        }
                    },
                    include: { action: true }
                }
            }
        });

        if (!user) return;

        // 1. Window closing in 2 hours
        for (const instance of user.action_instances) {
            await this.sendNotification(userId, {
                title: 'Action Window Closing',
                message: `⚠ Window closes in 2hr for ${instance.action?.title}. DS at risk.`,
                type: 'WINDOW_CLOSING'
            });
        }

        // 2. Execution lag check (already missed or late)
        const lateInstances = await this.prisma.actionInstance.findMany({
            where: {
                user_id: userId,
                status: 'LATE',
                executed_at: null,
                scheduled_end_time: {
                    lt: new Date(Date.now() - 2 * 60 * 60 * 1000) // Late more than 2 hours
                }
            },
            include: { action: true }
        });

        for (const instance of lateInstances) {
            await this.sendNotification(userId, {
                title: 'Execution Lag Alert',
                message: `-5 pts applied. 2 more hours → RESTRICTION for ${instance.action?.title}.`,
                type: 'EXECUTION_LAG'
            });
        }

        // 3. Consecutive misses
        const last3 = await this.prisma.actionInstance.findMany({
            where: { user_id: userId },
            orderBy: { scheduled_start_time: 'desc' },
            take: 3
        });

        const missCount = last3.filter(i => i.status === 'MISSED').length;
        if (missCount === 2) {
            await this.sendNotification(userId, {
                title: 'Lockout Risk',
                message: 'LOCKOUT in 1 miss. Complete next action on time.',
                type: 'LOCKOUT_RISK'
            });
        }
    }

    async notifyScoreChange(userId: string, oldScore: number, newScore: number, classification: string) {
        if (oldScore >= 50 && newScore < 50) {
            await this.sendNotification(userId, {
                title: 'Classification Change',
                message: `Classification: DRIFTING. Breach horizon detected.`,
                type: 'SCORE_DROP'
            });
        } else if (oldScore < 50 && newScore >= 50) {
            await this.sendNotification(userId, {
                title: 'Classification Restored',
                message: 'Classification restored: STABLE.',
                type: 'SCORE_RECOVERY'
            });
        }
    }

    async notifyTrustTierPromotion(userId: string, tier: string) {
        await this.sendNotification(userId, {
            title: 'Trust Tier Upgraded',
            message: `Trust tier upgraded: ${tier}.`,
            type: 'TRUST_PROMOTION'
        });
    }

    private async sendNotification(userId: string, payload: { title: string, message: string, type: string }) {
        const user = await this.prisma.user.findUnique({ where: { user_id: userId } });
        if (!user) return;

        Logger.info(`[Notification] Sending ${payload.type} to user ${userId}`);

        // Email
        try {
            await this.emailService.sendEmail(user.email, payload.title, payload.message);
        } catch (err) {
            Logger.error(`[Notification] Failed to send email to ${user.email}`, err);
        }

        // WebSocket / In-app
        domainEvents.emit(DomainEventType.SCORE_UPDATED, {
            type: DomainEventType.SCORE_UPDATED,
            timestamp: new Date(),
            userId,
            payload: {
                oldScore: 0,
                newScore: 0,
                reason: `${payload.type}: ${payload.message}`
            }
        });
    }
}
