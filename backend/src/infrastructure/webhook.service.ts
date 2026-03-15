import { singleton, injectable } from 'tsyringe';
import * as crypto from 'crypto';
import { Logger } from '../core/logger';
import axios from 'axios';

export interface WebhookPayload {
    event: string;
    timestamp: string;
    data: unknown;
}

@injectable()
@singleton()
export class WebhookService {
    /**
     * Sends a webhook to a specific destination with a signature.
     */
    async sendWebhook(url: string, payload: any, secret?: string): Promise<void> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            'User-Agent': 'Iron-X-Webhook-Engine/1.0'
        };

        if (secret) {
            const signature = crypto
                .createHmac('sha256', secret)
                .update(JSON.stringify(payload))
                .digest('hex');
            headers['X-Iron-X-Signature'] = signature;
        }

        try {
            await axios.post(url, payload, {
                headers,
                timeout: 5000,
                validateStatus: (status) => status >= 200 && status < 300
            });
            Logger.info(`[WebhookService] Successfully delivered to ${url}`);
        } catch (error: any) {
            const status = error.response?.status;
            const message = error.message;
            Logger.error(`[WebhookService] Delivery failed to ${url}. Status: ${status}, Error: ${message}`);
            throw error; // Re-throw to allow queue retries
        }
    }

    /**
     * Broadcasts an event to all registered subscribers for that event.
     * (Legacy/Experimental implementation updated to use sendWebhook)
     */
    async dispatchEvent(event: string, data: unknown) {
        // Implementation for dynamic subscribers (e.g. from DB) could go here
        const subscribers = [
            { url: 'https://webhook.site/test', secret: 'whsec_test_secret_123' }
        ];
        
        const timestamp = new Date().toISOString();
        const payload: WebhookPayload = { event, timestamp, data };

        for (const sub of subscribers) {
            try {
                await this.sendWebhook(sub.url, payload, sub.secret);
            } catch (e) {
                // Individual delivery failure shouldn't stop the loop
                // Logging is handled inside sendWebhook
            }
        }
    }
}
