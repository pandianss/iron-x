import { ActionInstance, DisciplinePolicy, Role, User } from '@prisma/client';

declare module 'express-serve-static-core' {
    interface Request {
        user?: {
            userId: string;
            email?: string;
            role?: {
                name: string;
                policy?: DisciplinePolicy
            };
        };
    }
}
