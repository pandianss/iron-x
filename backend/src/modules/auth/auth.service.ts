import { singleton } from 'tsyringe';
import prisma from '../../infrastructure/db';
import { AppError } from '../../utils/AppError';
import { Logger } from '../../core/logger';

@singleton()
export class AuthService {
    constructor() { }

    async syncUser(data: Record<string, any>) {
        const { firebaseUid, email, timezone, orgName, orgSlug, emailVerified } = data;

        if (!firebaseUid || !email) {
            throw new AppError('Missing Firebase UID or Email', 400);
        }

        // 1. Primary lookup by Firebase UID
        let user = await prisma.user.findUnique({
            where: { firebase_uid: firebaseUid },
            include: { organization: true, role: { include: { policy: true } } }
        });

        // 2. Secondary lookup by email if not found (Account Linking)
        // ONLY link if email is verified to prevent hijacking
        if (!user) {
            const existingByEmail = await prisma.user.findUnique({
                where: { email }
            });

            if (existingByEmail) {
                if (emailVerified) {
                    Logger.info(`[Auth] Mapping existing user ${email} to Firebase UID ${firebaseUid}`);
                    user = await prisma.user.update({
                        where: { email },
                        data: { firebase_uid: firebaseUid },
                        include: { organization: true, role: { include: { policy: true } } }
                    });
                } else {
                    Logger.warn(`[Auth] Verification mismatch for existing user ${email}. Refusing to link unverified account.`);
                    throw new AppError('Email verification required to link existing account.', 403);
                }
            }
        }

        // 3. Create if still not found
        if (!user) {
            // First time login - auto-register
            let orgId = undefined;
            if (orgName && orgSlug) {
                const org = await prisma.organization.create({
                    data: { name: orgName, slug: orgSlug }
                });
                orgId = org.org_id;
            }

            user = await prisma.user.create({
                data: {
                    email,
                    firebase_uid: firebaseUid,
                    timezone: timezone || 'UTC',
                    org_id: orgId
                },
                include: { organization: true, role: { include: { policy: true } } }
            });
        }

        return {
            user: {
                id: user.user_id,
                email: user.email,
                org_id: user.org_id,
                organization: user.organization,
                role: user.role
            }
        };
    }
}
