import { singleton } from 'tsyringe';
import * as crypto from 'crypto';
import { Logger } from '../utils/logger';

export interface WebhookPayload {
    event: string;
    timestamp: string;
    data: unknown;
}

@singleton()
export class WebhookService {
    getSubscribers(_event: string) {
        return [
            { url: 'https://webhook.site/test', secret: 'whsec_test_secret_123' }
        ];
    }

    signPayload(payload: unknown, secret: string): string {
        const data = JSON.stringify(payload);
        return crypto.createHmac('sha256', secret).update(data).digest('hex');
    }

    async dispatchEvent(event: string, data: unknown) {
        const subscribers = this.getSubscribers(event);
        const timestamp = new Date().toISOString();

        const payload: WebhookPayload = {
            event,
            timestamp,
            data
        };

        for (const sub of subscribers) {
            const signature = crypto
                .createHmac('sha256', sub.secret)
                .update(JSON.stringify(payload))
                .digest('hex');

            try {
                await fetch(sub.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Iron-Signature': signature
                    },
                    body: JSON.stringify(payload),
                    signal: AbortSignal.timeout(5000)
                });
            } catch (e) {
                Logger.error(`Failed to dispatch webhook to ${sub.url}`, e);
            }
        }
    }
}
