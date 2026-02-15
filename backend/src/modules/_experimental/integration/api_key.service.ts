
import { singleton } from 'tsyringe';
import prisma from '../../../db';
import * as crypto from 'crypto';

@singleton()
export class ApiKeyService {
    /**
     * Generates a new API key for an organization.
     * Returns the plain key (to show once) and its metadata.
     */
    async generateKey(orgId: string, name: string) {
        const plainKey = `ix_${crypto.randomBytes(24).toString('hex')}`;
        const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');

        const apiKey = await (prisma as any).api_key.create({
            data: {
                org_id: orgId,
                name,
                key_hash: keyHash
            }
        });

        return { plainKey, apiKey };
    }

    async getKeysForOrg(orgId: string) {
        return await (prisma as any).api_key.findMany({
            where: { org_id: orgId },
            select: {
                key_id: true,
                name: true,
                last_used: true,
                expires_at: true,
                created_at: true
            }
        });
    }

    async deleteKey(keyId: string) {
        return await (prisma as any).api_key.delete({
            where: { key_id: keyId }
        });
    }

    /**
     * Verifies an API key and returns the associated Organization.
     */
    async verifyKey(plainKey: string) {
        const keyHash = crypto.createHash('sha256').update(plainKey).digest('hex');

        const apiKey = await (prisma as any).api_key.findUnique({
            where: { key_hash: keyHash },
            include: { organization: true }
        });

        if (!apiKey) return null;

        // Update last used
        await (prisma as any).api_key.update({
            where: { key_id: apiKey.key_id },
            data: { last_used: new Date() }
        });

        return apiKey.organization;
    }
}
