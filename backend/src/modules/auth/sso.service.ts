
import prisma from '../../db';

export class SSOService {
    // Mock SAML Request Generation
    static async generateAuthRequest(domain: string): Promise<string> {
        const config = await this.getSSOConfig(domain);
        if (!config || !config.enabled) {
            throw new Error('SSO not configured or enabled for this domain');
        }

        // In a real implementation, this would generate a SAML AuthnRequest XML
        // signed with our private key.
        // For now, we return a redirect URL with a dummy request ID.
        const requestId = `Request_${Date.now()}`;
        const redirectUrl = `${config.entry_point}?SAMLRequest=${Buffer.from(requestId).toString('base64')}`;

        return redirectUrl;
    }

    // SAML Response Validation
    static async validateResponse(samlResponse: string): Promise<{ email: string; issuer: string }> {
        // In reality, verify signature using config.cert and parse XML.
        throw new Error('Real SAML validation not yet implemented.');
    }

    static async getSSOConfig(domain: string) {
        // Find config that whitelists this domain
        // Using a raw query or simple findFirst scan because 'domain_whitelist' is a CSV string
        // ideally we normalize domains to a separate table but for MVP string check is fine.

        // In production, might cache this.

        const configs = await prisma.sSOConfig.findMany({
            where: { enabled: true }
        });

        return configs.find(c => c.domain_whitelist.split(',').map(d => d.trim()).includes(domain));
    }

    static async createConfig(data: { entry_point: string; issuer: string; cert: string; domain_whitelist: string; team_id?: string }) {

        return prisma.sSOConfig.create({
            data: {
                ...data,
                enabled: true,
                team: data.team_id ? { connect: { team_id: data.team_id } } : undefined
            }
        });
    }
}
