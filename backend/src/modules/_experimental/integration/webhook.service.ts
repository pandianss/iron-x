
import { singleton } from 'tsyringe';
import prisma from '../../db';
import { kernelQueue } from '../../infrastructure/queue';

@singleton()
export class WebhookService {
    async createWebhook(data: { orgId: string; url: string; events: string; secret?: string }) {
        return await (prisma as any).webhook.create({
            data: {
                org_id: data.orgId,
                url: data.url,
                events: data.events,
                secret: data.secret
            }
        });
    }

    async getWebhooksForOrg(orgId: string) {
        return await (prisma as any).webhook.findMany({
            where: { org_id: orgId, is_active: true }
        });
    }

    async triggerEvent(orgId: string, eventName: string, payload: any) {
        const webhooks = await this.getWebhooksForOrg(orgId);

        for (const webhook of webhooks) {
            if (webhook.events.includes(eventName) || webhook.events === '*') {
                await kernelQueue.add('WEBHOOK_JOB', {
                    url: webhook.url,
                    payload: {
                        event: eventName,
                        timestamp: new Date().toISOString(),
                        data: payload
                    },
                    secret: webhook.secret
                }, {
                    attempts: 5,
                    backoff: {
                        type: 'exponential',
                        delay: 5000
                    }
                });
            }
        }
    }
}
