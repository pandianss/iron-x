
import { Request, Response } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { WebhookService } from './webhook.service';
import { ApiKeyService } from './api_key.service';

@autoInjectable()
export class IntegrationController {
    constructor(
        @inject(WebhookService) private webhookService: WebhookService,
        @inject(ApiKeyService) private apiKeyService: ApiKeyService
    ) { }

    createWebhook = async (req: Request, res: Response) => {
        try {
            const webhook = await this.webhookService.createWebhook(req.body);
            res.status(201).json(webhook);
        } catch (error) {
            console.error('Create Webhook Error:', error);
            res.status(500).json({ message: 'Failed to create webhook' });
        }
    };

    getWebhooks = async (req: Request, res: Response) => {
        try {
            const orgId = req.params.orgId as string;
            const webhooks = await this.webhookService.getWebhooksForOrg(orgId);
            res.json(webhooks);
        } catch (error) {
            console.error('Get Webhooks Error:', error);
            res.status(500).json({ message: 'Failed to fetch webhooks' });
        }
    };

    generateApiKey = async (req: Request, res: Response) => {
        try {
            const orgId = req.params.orgId as string;
            const { name } = req.body;
            const result = await this.apiKeyService.generateKey(orgId, name);
            res.status(201).json(result);
        } catch (error) {
            console.error('Generate API Key Error:', error);
            res.status(500).json({ message: 'Failed to generate API Key' });
        }
    };

    getKeys = async (req: Request, res: Response) => {
        try {
            const orgId = req.params.orgId as string;
            const keys = await this.apiKeyService.getKeysForOrg(orgId);
            res.json(keys);
        } catch (error) {
            console.error('Get API Keys Error:', error);
            res.status(500).json({ message: 'Failed to fetch API Keys' });
        }
    };
}
