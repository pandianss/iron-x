
import prisma from '../db';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export const EvidenceService = {
    /**
     * Generates a comprehensive evidence pack for a user or system scope.
     * Returns the path to the generated artifacts and their hash.
     */
    async generateEvidencePack(scope: 'USER' | 'SYSTEM', targetId: string, startDate?: Date, endDate?: Date) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const packId = `EVIDENCE-${scope}-${targetId}-${timestamp}`;
        const outputDir = path.join(__dirname, '../../evidence_packs');

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const data = await this.gatherData(scope, targetId, startDate, endDate);

        // 1. Generate JSON Dump (Machine Readable)
        const jsonPath = path.join(outputDir, `${packId}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));

        // 2. Generate HTML Report (Human Readable / PDF-ready)
        const htmlPath = path.join(outputDir, `${packId}.html`);
        const htmlContent = this.generateHtmlReport(data, packId);
        fs.writeFileSync(htmlPath, htmlContent);

        // 3. Compute Hash (Integrity)
        const fileBuffer = fs.readFileSync(jsonPath);
        const hashSum = crypto.createHash('sha256');
        hashSum.update(fileBuffer);
        const sha256 = hashSum.digest('hex');

        // Log the creation of evidence

        // Logger.debug(`Evidence generated: ${packId} SHA256:${sha256}`);

        return {
            packId,
            files: { json: jsonPath, html: htmlPath },
            integrity: { algorithm: 'sha256', hash: sha256 },
            generatedAt: new Date()
        };
    },

    async gatherData(scope: 'USER' | 'SYSTEM', targetId: string, start?: Date, end?: Date) {
        const dateFilter: any = {};
        if (start) dateFilter['gte'] = start;
        if (end) dateFilter['lte'] = end;

        if (scope === 'USER') {
            const user = await prisma.user.findUnique({
                where: { user_id: targetId },
                include: { role: { include: { policy: true } } }
            });

            const logs = await prisma.auditLog.findMany({
                where: {
                    target_user_id: targetId,
                    timestamp: Object.keys(dateFilter).length ? dateFilter : undefined
                },
                orderBy: { timestamp: 'desc' }
            });

            const scores = await prisma.disciplineScore.findMany({
                where: {
                    user_id: targetId,
                    date: Object.keys(dateFilter).length ? dateFilter : undefined
                },
                orderBy: { date: 'desc' }
            });

            return {
                metadata: { scope, targetId, generatedAt: new Date() },
                subject: {
                    id: user?.user_id,
                    role: user?.role?.name,
                    curent_policy: user?.role?.policy?.name
                },
                enforcement_history: logs,
                discipline_records: scores
            };
        }

        return { error: 'SYSTEM scope not implemented yet' };
    },

    generateHtmlReport(data: any, packId: string): string {
        return `
            <html>
            <head>
                <style>
                    body { font-family: monospace; padding: 20px; }
                    h1 { border-bottom: 2px solid #000; }
                    .section { margin-top: 20px; border: 1px solid #ccc; padding: 10px; }
                    table { wudth: 100%; border-collapse: collapse; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                </style>
            </head>
            <body>
                <h1>Audit Evidence Pack: ${packId}</h1>
                <p>Generated: ${new Date().toISOString()}</p>
                <p>Subject: ${data.subject?.id} (${data.subject?.role})</p>
                
                <div class="section">
                    <h2>Enforcement History</h2>
                    <table>
                        <tr><th>Time</th><th>Action</th><th>Details</th></tr>
                        ${data.enforcement_history?.map((l: any) => `
                            <tr>
                                <td>${l.timestamp}</td>
                                <td>${l.action}</td>
                                <td>${l.details}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>

                <div class="section">
                    <h2>Discipline Records</h2>
                    <table>
                        <tr><th>Date</th><th>Score</th></tr>
                        ${data.discipline_records?.map((s: any) => `
                            <tr>
                                <td>${s.date}</td>
                                <td>${s.score}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </body>
            </html>
        `;
    }
};
