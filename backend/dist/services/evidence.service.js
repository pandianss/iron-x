"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvidenceService = void 0;
const db_1 = __importDefault(require("../db"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const crypto = __importStar(require("crypto"));
exports.EvidenceService = {
    /**
     * Generates a comprehensive evidence pack for a user or system scope.
     * Returns the path to the generated artifacts and their hash.
     */
    async generateEvidencePack(scope, targetId, startDate, endDate) {
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
        // (Assuming AuditService is available and circular dependency is managed)
        // console.log(`Evidence generated: ${packId} SHA256:${sha256}`);
        return {
            packId,
            files: { json: jsonPath, html: htmlPath },
            integrity: { algorithm: 'sha256', hash: sha256 },
            generatedAt: new Date()
        };
    },
    async gatherData(scope, targetId, start, end) {
        const dateFilter = {};
        if (start)
            dateFilter['gte'] = start;
        if (end)
            dateFilter['lte'] = end;
        if (scope === 'USER') {
            const user = await db_1.default.user.findUnique({
                where: { user_id: targetId },
                include: { role: { include: { policy: true } } }
            });
            const logs = await db_1.default.auditLog.findMany({
                where: {
                    target_user_id: targetId,
                    timestamp: Object.keys(dateFilter).length ? dateFilter : undefined
                },
                orderBy: { timestamp: 'desc' }
            });
            const scores = await db_1.default.disciplineScore.findMany({
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
    generateHtmlReport(data, packId) {
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
                        ${data.enforcement_history?.map((l) => `
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
                        ${data.discipline_records?.map((s) => `
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
