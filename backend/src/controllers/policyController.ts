import { Request, Response } from 'express';
import { PolicyService } from '../services/policyService';

// --- Policies ---
export const createPolicy = async (req: Request, res: Response) => {
    try {
        const policy = await PolicyService.createPolicy(req.body);
        res.json(policy);
    } catch (error) {
        console.error('Error creating policy:', error);
        res.status(500).json({ error: 'Failed to create policy' });
    }
};

export const getPolicies = async (req: Request, res: Response) => {
    try {
        const policies = await PolicyService.getAllPolicies();
        res.json(policies);
    } catch (error) {
        console.error('Error fetching policies:', error);
        res.status(500).json({ error: 'Failed to fetch policies' });
    }
};

export const getPolicyById = async (req: Request, res: Response) => {
    try {
        const policy = await PolicyService.getPolicyById(req.params.id as string);
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

export const updatePolicy = async (req: Request, res: Response) => {
    try {
        const policy = await PolicyService.updatePolicy(req.params.id as string, req.body);
        res.json(policy);
    } catch (error) {
        console.error('Error updating policy:', error);
        res.status(500).json({ error: 'Failed to update policy' });
    }
};

export const deletePolicy = async (req: Request, res: Response) => {
    try {
        await PolicyService.deletePolicy(req.params.id as string);
        res.json({ message: 'Policy deleted' });
    } catch (error) {
        console.error('Error deleting policy:', error);
        res.status(500).json({ error: 'Failed to delete policy' });
    }
};

// --- Roles ---
export const createRole = async (req: Request, res: Response) => {
    try {
        const role = await PolicyService.createRole(req.body);
        res.json(role);
    } catch (error) {
        console.error('Error creating role:', error);
        res.status(500).json({ error: 'Failed to create role' });
    }
};

export const getRoles = async (req: Request, res: Response) => {
    try {
        const roles = await PolicyService.getAllRoles();
        res.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({ error: 'Failed to fetch roles' });
    }
};

export const assignPolicyToRole = async (req: Request, res: Response) => {
    try {
        const { roleId, policyId } = req.body;
        const role = await PolicyService.assignPolicyToRole(roleId, policyId);
        res.json(role);
    } catch (error) {
        console.error('Error assigning policy to role:', error);
        res.status(500).json({ error: 'Failed to assign policy' });
    }
};

export const assignRoleToUser = async (req: Request, res: Response) => {
    try {
        const { userId, roleId } = req.body;
        const user = await PolicyService.assignRoleToUser(userId, roleId);
        res.json(user);
    } catch (error) {
        console.error('Error assigning role to user:', error);
        res.status(500).json({ error: 'Failed to assign role' });
    }
};

// --- Exceptions ---
export const requestException = async (req: Request, res: Response) => {
    try {
        const exception = await PolicyService.requestException(req.body);
        res.json(exception);
    } catch (error) {
        console.error('Error requesting exception:', error);
        res.status(500).json({ error: 'Failed to request exception' });
    }
};

export const approveException = async (req: Request, res: Response) => {
    try {
        const { exceptionId, approverId } = req.body;
        const exception = await PolicyService.approveException(exceptionId, approverId);
        res.json(exception);
    } catch (error) {
        console.error('Error approving exception:', error);
        res.status(500).json({ error: 'Failed to approve exception' });
    }
};
