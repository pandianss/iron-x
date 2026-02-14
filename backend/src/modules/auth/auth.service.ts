import { singleton, inject } from 'tsyringe';
import prisma from '../../db';
import { hashPassword, comparePassword, generateToken } from '../../utils/auth';
import { AppError } from '../../utils/AppError';

@singleton()
export class AuthService {
    async register(data: any) {
        const { email, password, timezone } = data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new AppError('User already exists', 400);
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
        // We can inject PolicyService here later, but for now dynamic import or direct import is fine if not circular
        try {
            // Check if PolicyService is available to import without circular deps
            // For now, we will keep the pattern from the controller but cleaned up
        } catch (e) {
            console.error('Failed to assign default role:', e);
        }

        const token = generateToken(user.user_id);
        return { token, user: { id: user.user_id, email: user.email } };
    }

    async login(data: any) {
        const { email, password } = data;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            throw new AppError('Invalid credentials', 401);
        }

        const token = generateToken(user.user_id);
        return { token, user: { id: user.user_id, email: user.email } };
    }
}
