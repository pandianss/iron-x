
import { Request, Response } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { OrganizationService } from './organization.service';

@autoInjectable()
export class OrganizationController {
    constructor(
        @inject(OrganizationService) private organizationService: OrganizationService
    ) { }

    createOrganization = async (req: Request, res: Response) => {
        try {
            const org = await this.organizationService.createOrganization(req.body);
            res.status(201).json(org);
        } catch (error) {
            console.error('Create Org Error:', error);
            res.status(500).json({ message: 'Failed to create organization' });
        }
    };

    getOrganization = async (req: Request, res: Response) => {
        try {
            const slug = req.params.slug as string;
            const org = await this.organizationService.getOrganizationBySlug(slug);
            if (!org) return res.status(404).json({ message: 'Organization not found' });
            res.json(org);
        } catch (error) {
            console.error('Get Org Error:', error);
            res.status(500).json({ message: 'Failed to fetch organization' });
        }
    };

    getStats = async (req: Request, res: Response) => {
        try {
            const orgId = req.params.orgId as string;
            const stats = await this.organizationService.getOrganizationStats(orgId);
            res.json(stats);
        } catch (error) {
            console.error('Get Org Stats Error:', error);
            res.status(500).json({ message: 'Failed to fetch organization stats' });
        }
    };

    addUser = async (req: Request, res: Response) => {
        try {
            const orgId = req.params.orgId as string;
            const { userId } = req.body;
            const result = await this.organizationService.addUserToOrganization(orgId, userId);
            res.json(result);
        } catch (error) {
            console.error('Add User to Org Error:', error);
            res.status(500).json({ message: 'Failed to add user to organization' });
        }
    };
}
