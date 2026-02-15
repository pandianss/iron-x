import { singleton, inject } from 'tsyringe';
import prisma from '../../db';
import { hashPassword, comparePassword, generateToken } from '../../utils/auth';
import { AppError } from '../../utils/AppError';
import { SecurityService } from '../security/security.service';

@singleton()
export class AuthService {
    constructor(
        @inject(SecurityService) private securityService: SecurityService
    ) { }

    async register(data: any) {
        const { email, password, timezone, orgName, orgSlug } = data;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new AppError('User already exists', 400);
        }

        const hashedPassword = await hashPassword(password);

        let orgId = undefined;
        if (orgName && orgSlug) {
            const org = await (prisma as any).organization.create({
                data: { name: orgName, slug: orgSlug }
            });
            orgId = org.org_id;
        }

        const user = await (prisma as any).user.create({
            data: {
                email,
                password_hash: hashedPassword,
                timezone: timezone || 'UTC',
                org_id: orgId
            },
            include: { organization: true } as any
        }) as any;

        const token = generateToken(user.user_id);
        return {
            token,
            user: {
                id: user.user_id,
                email: user.email,
                org_id: user.org_id,
                organization: user.organization
            }
        };
    }

    async login(data: any) {
        const { email, password, mfaToken } = data;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { organization: true }
        }) as any;

        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        const isMatch = await comparePassword(password, user.password_hash);
        if (!isMatch) {
            throw new AppError('Invalid credentials', 401);
        }

        // Check MFA
        if (user.mfa_enabled) {
            if (!mfaToken) {
                return { mfaRequired: true, userId: user.user_id };
            }

            const isValid = this.securityService.verifyToken(mfaToken, user.mfa_secret!);
            if (!isValid) {
                throw new AppError('Invalid MFA token', 401);
            }
        }

        const token = generateToken(user.user_id);
        return {
            token,
            user: {
                id: user.user_id,
                email: user.email,
                org_id: user.org_id,
                organization: user.organization
            }
        };
    }
}
