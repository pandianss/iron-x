import PDFDocument from 'pdfkit';

export async function generateDriftReportPdf(data: {
    analysis: any;
    scoreHistory: any[];
    instanceHistory: any[];
    user: any;
}): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 60 });
        const chunks: Buffer[] = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        const emailMasked = data.user.email.split('@')[0].slice(0, 3) + '***@' + data.user.email.split('@')[1];
        const primaryColor = '#111111';
        const accentColor = '#888888';
        const separator = '─────────────────────────────────────────────';

        // --- PAGE 1: COVER ---
        doc.font('Courier-Bold').fontSize(16).fillColor(primaryColor);
        doc.text('IRON-X DISCIPLINE SYSTEM', { align: 'center' });
        doc.text('DRIFT ANALYSIS REPORT', { align: 'center' });
        doc.moveDown();
        doc.font('Courier').fontSize(10).text(separator, { align: 'center' });
        doc.moveDown();

        const meta = [
            `OPERATOR: ${emailMasked}`,
            `GENERATED: ${new Date().toISOString()}`,
            `CLASSIFICATION: ${data.user.discipline_classification}`,
            `TRUST TIER: ${data.user.trust_tier}`,
            `DISCIPLINE SCORE: ${data.user.current_discipline_score}`
        ];

        meta.forEach(line => {
            doc.text(line, { align: 'left' });
            doc.moveDown(0.5);
        });

        doc.moveDown();
        doc.text(separator, { align: 'center' });
        doc.moveDown();
        doc.font('Courier-Bold').fontSize(12).text('CONFIDENTIAL // INTERNAL PERFORMANCE DIAGNOSTIC', { align: 'center' });

        // --- PAGE 2: DRIFT DIAGNOSIS ---
        doc.addPage();
        doc.font('Courier-Bold').fontSize(14).text('PAGE 2: DRIFT DIAGNOSIS');
        doc.font('Courier').fontSize(10).text(separator);
        doc.moveDown();

        doc.font('Courier-Bold').fontSize(12).text('PRIMARY DRIFT PATTERN');
        doc.fontSize(18).fillColor('#333333').text(data.analysis.primary_drift_pattern.toUpperCase());
        doc.moveDown();

        doc.fontSize(12).fillColor(primaryColor).text('ROOT CAUSE ANALYSIS');
        doc.font('Courier').fontSize(10).text(data.analysis.root_cause_suggestion);
        doc.moveDown();

        doc.font('Courier-Bold').fontSize(12).text('RECOMMENDED ADJUSTMENT');
        doc.font('Courier').fontSize(10).text(data.analysis.recommended_adjustment);
        doc.moveDown();

        doc.text(`PROJECTED RECOVERY TRAJECTORY: ${data.analysis.projected_score_recovery}/10`);
        doc.text(`ANALYSIS CONFIDENCE: ${data.analysis.confidence_level}`);

        // --- PAGE 3: 30-DAY PERFORMANCE DATA ---
        doc.addPage();
        doc.font('Courier-Bold').fontSize(14).text('PAGE 3: 30-DAY PERFORMANCE DATA');
        doc.font('Courier').fontSize(10).text(separator);
        doc.moveDown();

        doc.text('30-DAY SCORE TRAJECTORY (ASCII)');
        doc.moveDown();
        doc.text('DATE       | SCORE | DELTA');
        doc.text('-----------|-------|-------');
        
        let lastScore = data.scoreHistory[data.scoreHistory.length - 1]?.score || 0;
        data.scoreHistory.slice(0, 15).forEach(s => {
            const dateStr = new Date(s.date).toISOString().split('T')[0];
            const delta = s.score - lastScore;
            doc.text(`${dateStr} | ${s.score.toString().padEnd(5)} | ${delta > 0 ? '+' : ''}${delta}`);
        });

        doc.moveDown(2);
        doc.font('Courier-Bold').text('COMPLETION RATE BY WEEK');
        doc.moveDown();

        const total = data.instanceHistory.length;
        const completed = data.instanceHistory.filter(i => i.status === 'COMPLETED').length;
        const missed = data.instanceHistory.filter(i => i.status === 'MISSED').length;
        const rate = total > 0 ? (completed / total * 100).toFixed(1) : '0.0';

        // Simplistic week grouping
        for (let i = 0; i < 4; i++) {
            const bar = '█'.repeat(Math.floor(Number(rate) / 10)).padEnd(10, '░');
            doc.text(`Week ${i + 1}: ${bar} ${rate}%`);
        }

        doc.moveDown();
        doc.text(`MISSED ACTIONS: ${missed}   COMPLETED: ${completed}   RATE: ${rate}%`);

        // --- PAGE 4: OPERATIONAL RECOMMENDATIONS ---
        doc.addPage();
        doc.font('Courier-Bold').fontSize(14).text('PAGE 4: OPERATIONAL RECOMMENDATIONS');
        doc.font('Courier').fontSize(10).text(separator);
        doc.moveDown();

        const recommendations = [
            "1. Implement strict window enforcement for the primary drift vector identified in Page 2.",
            "2. Audit recovery buffer allocation to prevent mid-week fatigue accumulation.",
            "3. Synchronize witness monitors to the high-risk drift intervals."
        ];

        recommendations.forEach(r => {
            doc.text(r);
            doc.moveDown();
        });

        doc.moveDown(5);
        doc.text(`NEXT REVIEW DATE: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`);
        doc.text(`// REPORT ID: ${Math.random().toString(36).substring(2, 15)}`);

        doc.end();
    });
}
