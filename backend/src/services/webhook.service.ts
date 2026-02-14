
import * as crypto from 'crypto';
import { Logger } from '../utils/logger';
// import fetch from 'node-fetch'; // Built-in in Node 18+

export interface WebhookPayload {
    event: string; // 'score.changed', 'policy.violation'
    timestamp: string;
    data: any;
}

export const WebhookService = {
    // In a real system, these would be loaded from DB per user/tenant
    getSubscribers(event: string) {
        // Mock subscription
        return [
            { url: 'https://webhook.site/test', secret: 'whsec_test_secret_123' }
        ];
    },

    signPayload(payload: any, secret: string): string {
        const data = JSON.stringify(payload);
        return crypto.createHmac('sha256', secret).update(data).digest('hex');
    },

    async dispatchEvent(event: string, data: any) {
        const subscribers = this.getSubscribers(event);
        const timestamp = new Date().toISOString();

        const payload: WebhookPayload = {
            event,
            timestamp,
            data
        };

        for (const sub of subscribers) {
            // Logger.info(`Dispatching ${event} to ${sub.url}`);

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
};
