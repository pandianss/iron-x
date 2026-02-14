import { Request, Response } from 'express';
import prisma from '../db';
import { hashPassword, comparePassword, generateToken } from '../utils/auth';

export const register = async (req: Request, res: Response) => {
    const { email, password, timezone } = req.body;

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                timezone: timezone || 'UTC',
            },
        });

        // Phase 6: Institutionalization - Assign Default Role
        try {
            const { PolicyService } = await import('../services/policyService');
            await PolicyService.assignDefaultRole(user.user_id);
        } catch (e) {
            console.error('Failed to assign default role:', e);
            // Don't fail registration, but log critical error
        }

        const token = generateToken(user.user_id);
        res.status(201).json({ token, user: { id: user.user_id, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user.user_id);
        res.json({ token, user: { id: user.user_id, email: user.email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
