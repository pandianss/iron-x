
import * as crypto from 'crypto';
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
            const signature = this.signPayload(payload, sub.secret);
            try {
                // console.log(`Dispatching ${event} to ${sub.url}`);
                // await fetch(sub.url, {
                //     method: 'POST',
                //     headers: {
                //         'Content-Type': 'application/json',
                //         'X-Discipline-Signature': signature,
                //         'X-Discipline-Event': event
                //     },
                //     body: JSON.stringify(payload)
                // });
            } catch (e) {
                console.error(`Failed to dispatch webhook to ${sub.url}`, e);
            }
        }
    }
};
