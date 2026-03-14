import { PrismaClient } from '@prisma/client';
import { injectable, inject } from 'tsyringe';

@injectable()
export class PublicBadgeService {
    constructor(@inject('PrismaClient') private prisma: PrismaClient) { }

    async getUserBadgeData(userId: string) {
        const user = await (this.prisma.user.findUnique({
            where: { user_id: userId },
            select: {
                current_discipline_score: true,
                discipline_classification: true,
                public_score_enabled: true,
                trust_tier: true
            }
        }) as any);

        if (!user || !user.public_score_enabled) return null;

        return {
            score: user.current_discipline_score,
            classification: user.discipline_classification,
            tier: user.trust_tier
        };
    }

    generateSvgBadge(data: { score: number, classification: string, tier: string }): string {
        const color = this.getBadgeColor(data.classification);
        const timestamp = new Date().toISOString();
        
        return `
            <svg width="320" height="80" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#111;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#222;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="320" height="80" fill="url(#grad)" rx="8" stroke="${color}" stroke-width="1"/>
                
                <!-- Left Panel -->
                <text x="20" y="35" fill="#fff" font-family="'Courier New', monospace" font-size="20" font-weight="bold">IRON-X</text>
                <text x="20" y="55" fill="#444" font-family="'Courier New', monospace" font-size="10" font-weight="bold" letter-spacing="2">DISCIPLINE SCORE</text>
                
                <!-- Right Panel -->
                <rect x="230" y="10" width="80" height="60" fill="${color}33" rx="4" />
                <text x="270" y="45" fill="${color}" font-family="'Courier New', monospace" font-size="32" font-weight="bold" text-anchor="middle">${data.score}</text>
                <text x="270" y="62" fill="${color}" font-family="'Courier New', monospace" font-size="8" font-weight="bold" text-anchor="middle" letter-spacing="1">${data.tier}</text>
                
                <!-- Footer -->
                <text x="20" y="73" fill="#333" font-family="'Courier New', monospace" font-size="6">// Updated: ${timestamp}</text>
            </svg>
        `.trim();
    }

    private getBadgeColor(classification: string): string {
        switch (classification) {
            case 'HIGH_RELIABILITY': return '#4CAF50';
            case 'STABLE': return '#3B82F6';
            case 'RECOVERING': return '#F59E0B';
            case 'UNRELIABLE': return '#EF4444';
            default: return '#888888';
        }
    }
}
