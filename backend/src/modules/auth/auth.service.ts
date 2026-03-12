import { singleton, inject } from 'tsyringe';
import prisma from '../../db';
import { AppError } from '../../utils/AppError';

@singleton()
export class AuthService {
    constructor() { }

    async syncUser(data: Record<string, any>) {
        const { firebaseUid, email, timezone, orgName, orgSlug } = data;

        if (!firebaseUid || !email) {
            throw new AppError('Missing Firebase UID or Email', 400);
        }

        let user = await (prisma as any).user.findUnique({
            where: { firebase_uid: firebaseUid },
            include: { organization: true, role: { include: { policy: true } } }
        });

        if (!user) {
            // First time login - auto-register
            let orgId = undefined;
            if (orgName && orgSlug) {
                const org = await prisma.organization.create({
                    data: { name: orgName, slug: orgSlug }
                });
                const orgIdStr = org.org_id;
                orgId = orgIdStr;
            }

            user = await (prisma as any).user.create({
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
