import { ActionInstance, DisciplinePolicy, Role, User } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            user?: {
                userId: string;
                role?: {
                    name: string;
                    policy?: DisciplinePolicy
                };
            };
        }
    }
}
