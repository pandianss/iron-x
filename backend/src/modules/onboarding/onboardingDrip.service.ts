
import { PrismaClient } from '@prisma/client';
import { container } from 'tsyringe';
import { EmailService } from '../communication/email.service';
import { Logger } from '../../core/logger';

export class OnboardingDripService {
    private prisma: PrismaClient;
    private emailService: EmailService;

    constructor() {
        this.prisma = container.resolve<PrismaClient>('PrismaClient');
        this.emailService = container.resolve<EmailService>(EmailService);
    }

    /**
     * This method would be called by a cron job once a day.
     */
    async processDrips() {
        Logger.info('[OnboardingDrip] Starting daily drip processing...');

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // This is a simplified logic. In production, we'd use a state machine or a 'sent_drips' table.
        // For the MVP, we'll just send based on created_at windows.

        // Day 1 Drip: Users created exactly 1 day ago (approx)
        const day1Users = await this.prisma.user.findMany({
            where: {
                created_at: {
                    gte: new Date(oneDayAgo.getTime() - 60 * 60 * 1000), // 23h ago
                    lte: oneDayAgo // 24h ago
                }
            }
        });

        for (const user of day1Users) {
            await this.emailService.sendDripDay1(user.email, user.email.split('@')[0]);
        }

        // Day 3 Drip
        const day3Users = await this.prisma.user.findMany({
            where: {
                created_at: {
                    gte: new Date(threeDaysAgo.getTime() - 60 * 60 * 1000),
                    lte: threeDaysAgo
                }
            }
        });

        for (const user of day3Users) {
            await this.emailService.sendDripDay3(user.email, user.email.split('@')[0]);
        }

        // Day 7 Drip
        const day7Users = await this.prisma.user.findMany({
            where: {
                created_at: {
                    gte: new Date(sevenDaysAgo.getTime() - 60 * 60 * 1000),
                    lte: sevenDaysAgo
                }
            }
        });

        for (const user of day7Users) {
            await this.emailService.sendDripDay7(user.email, user.email.split('@')[0]);
        }

        Logger.info(`[OnboardingDrip] Processed ${day1Users.length} Day1s, ${day3Users.length} Day3s, ${day7Users.length} Day7s.`);
    }
}
