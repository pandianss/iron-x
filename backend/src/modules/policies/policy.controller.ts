import { Request, Response } from 'express';
import { autoInjectable, inject } from 'tsyringe';
import { PolicyService } from './policy.service';

@autoInjectable()
export class PolicyController {
    constructor(
        @inject(PolicyService) private policyService: PolicyService
    ) { }

    // --- Policies ---
    createPolicy = async (req: Request, res: Response) => {
        try {
            const policy = await this.policyService.createPolicy(req.body);
            res.json(policy);
        } catch (error) {
            console.error('Error creating policy:', error);
            res.status(500).json({ error: 'Failed to create policy' });
        }
    };

    getPolicies = async (req: Request, res: Response) => {
        try {
            const policies = await this.policyService.getAllPolicies();
            res.json(policies);
        } catch (error) {
            console.error('Error fetching policies:', error);
            res.status(500).json({ error: 'Failed to fetch policies' });
        }
    };

    getPolicyById = async (req: Request, res: Response) => {
        try {
            const policy = await this.policyService.getPolicyById(req.params.id as string);
            if (!policy) {
                res.status(404).json({ error: 'Policy not found' });
                return;
            }
            res.json(policy);
        } catch (error) {
            console.error('Error fetching policy:', error);
            res.status(500).json({ error: 'Failed to fetch policy' });
        }
    };

    updatePolicy = async (req: Request, res: Response) => {
        try {
            const policy = await this.policyService.updatePolicy(req.params.id as string, req.body);
            res.json(policy);
        } catch (error) {
            console.error('Error updating policy:', error);
            res.status(500).json({ error: 'Failed to update policy' });
        }
    };

    deletePolicy = async (req: Request, res: Response) => {
        try {
            await this.policyService.deletePolicy(req.params.id as string);
            res.json({ message: 'Policy deleted' });
        } catch (error) {
            console.error('Error deleting policy:', error);
            res.status(500).json({ error: 'Failed to delete policy' });
        }
    };

    // --- Roles ---
    createRole = async (req: Request, res: Response) => {
        try {
            const role = await this.policyService.createRole(req.body);
            res.json(role);
        } catch (error) {
            console.error('Error creating role:', error);
            res.status(500).json({ error: 'Failed to create role' });
        }
    };

    getRoles = async (req: Request, res: Response) => {
        try {
            const roles = await this.policyService.getAllRoles();
            res.json(roles);
        } catch (error) {
            console.error('Error fetching roles:', error);
            res.status(500).json({ error: 'Failed to fetch roles' });
        }
    };

    assignPolicyToRole = async (req: Request, res: Response) => {
        try {
            const { roleId, policyId } = req.body;
            const role = await this.policyService.assignPolicyToRole(roleId, policyId);
            res.json(role);
        } catch (error) {
            console.error('Error assigning policy to role:', error);
            res.status(500).json({ error: 'Failed to assign policy' });
        }
    };

    assignRoleToUser = async (req: Request, res: Response) => {
        try {
            const { userId, roleId } = req.body;
            const user = await this.policyService.assignRoleToUser(userId, roleId);
            res.json(user);
        } catch (error) {
            console.error('Error assigning role to user:', error);
            res.status(500).json({ error: 'Failed to assign role' });
        }
    };

    // --- Exceptions ---
    requestException = async (req: Request, res: Response) => {
        try {
            const exception = await this.policyService.requestException(req.body);
            res.json(exception);
        } catch (error) {
            console.error('Error requesting exception:', error);
            res.status(500).json({ error: 'Failed to request exception' });
        }
    };

    approveException = async (req: Request, res: Response) => {
        try {
            const { exceptionId, approverId } = req.body;
            const exception = await this.policyService.approveException(exceptionId, approverId);
            res.json(exception);
        } catch (error) {
            console.error('Error approving exception:', error);
            res.status(500).json({ error: 'Failed to approve exception' });
        }
    };
}
