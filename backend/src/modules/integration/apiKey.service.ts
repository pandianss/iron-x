import crypto from 'crypto';
import prisma from '../../db';

export class ApiKeyService {
  // Generate a new API key — returns the plaintext key ONCE (never stored)
  async createKey(params: {
    userId?: string;
    orgId?: string;
    name: string;
    monthlyLimit?: number;
    expiresAt?: Date;
  }): Promise<{ key: string; preview: string; key_id: string }> {
    // Format: sk_live_[32 random chars]
    const raw = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
    const hash = crypto.createHash('sha256').update(raw).digest('hex');
    const preview = `${raw.substring(0, 12)}....${raw.slice(-4)}`;

    const record = await (prisma.apiKey as any).create({
      data: {
        key_hash: hash,
        key_preview: preview,
        name: params.name,
        user_id: params.userId,
        org_id: params.orgId,
        monthly_limit: params.monthlyLimit || 10000,
        expires_at: params.expiresAt
      }
    });

    return { key: raw, preview, key_id: record.key_id };
  }

  // Validate an incoming API key (used in middleware)
  async validateKey(rawKey: string): Promise<{ valid: boolean; userId?: string; orgId?: string; key_id?: string }> {
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyRecord = await (prisma.apiKey as any).findUnique({ where: { key_hash: hash } });

    if (!keyRecord || !keyRecord.is_active) return { valid: false };
    if (keyRecord.expires_at && keyRecord.expires_at < new Date()) return { valid: false };

    // Increment usage counter
    await (prisma.apiKey as any).update({
      where: { key_id: keyRecord.key_id },
      data: { call_count: { increment: 1 }, last_used_at: new Date() }
    });

    return {
      valid: true,
      userId: keyRecord.user_id || undefined,
      orgId: keyRecord.org_id || undefined,
      key_id: keyRecord.key_id
    };
  }

  async listKeys(userId: string) {
    return (prisma.apiKey as any).findMany({
      where: { OR: [{ user_id: userId }] }, 
      select: { key_id: true, key_preview: true, name: true, is_active: true, created_at: true, last_used_at: true, call_count: true, monthly_limit: true, expires_at: true },
      orderBy: { created_at: 'desc' }
    });
  }

  async revokeKey(keyId: string, userId: string) {
    // Verify ownership before revoking
    const key = await (prisma.apiKey as any).findUnique({ where: { key_id: keyId } });
    if (!key || (key.user_id !== userId)) throw new Error('Not authorized');
    return (prisma.apiKey as any).update({ where: { key_id: keyId }, data: { is_active: false } });
  }
}
