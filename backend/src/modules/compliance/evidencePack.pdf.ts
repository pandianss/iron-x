import PDFDocument from 'pdfkit';
import { EvidencePackResult } from './evidencePack.service';

export async function generateEvidencePackPdf(data: EvidencePackResult): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));

    // Colors
    const primaryColor = '#000000';
    const accentColor = '#2563EB'; // Blue-600
    const mutedColor = '#6B7280';
    const borderColor = '#E5E7EB';
    const rowAltColor = '#F9FAFB';

    // Helper: Draw Horizontal Line
    const line = (y: number) => {
      doc.moveTo(50, y).lineTo(545, y).strokeColor(borderColor).stroke();
    };

    // --- COVER PAGE ---
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#FFFFFF');
    
    doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(24).text('IRON-X BEHAVIORAL COMPLIANCE', 50, 150);
    doc.fontSize(18).text('EVIDENCE PACK — AUDIT RECORD', 50, 185);
    
    line(220);
    
    doc.font('Helvetica').fontSize(10).fillColor(mutedColor);
    doc.text('SUBJECT TYPE:', 50, 240);
    doc.text('SUBJECT ID:', 50, 255);
    doc.text('REPORTING PERIOD:', 50, 270);
    doc.text('GENERATED AT:', 50, 285);
    doc.text('PACK ID:', 50, 300);
    doc.text('SIGNATURE:', 50, 315);

    doc.fillColor(primaryColor).font('Helvetica-Bold');
    doc.text(data.subject.type, 200, 240);
    doc.text(data.subject.id, 200, 255);
    doc.text(`${data.period.start.toISOString().split('T')[0]} to ${data.period.end.toISOString().split('T')[0]}`, 200, 270);
    doc.text(data.generated_at.toISOString(), 200, 285);
    doc.text(data.packId, 200, 300);
    doc.text(`${data.signature.substring(0, 32)}...`, 200, 315);

    line(350);

    doc.font('Helvetica-Oblique').fontSize(9).fillColor(mutedColor);
    doc.text('This document is a system-generated audit record from the Iron-X Behavioral Enforcement Platform.', 50, 370);
    doc.text('All events are immutably logged at the time of occurrence and signed for integrity.', 50, 382);

    // --- SECTION 1: EXECUTIVE SUMMARY ---
    doc.addPage();
    doc.fillColor(accentColor).font('Helvetica-Bold').fontSize(14).text('SECTION 1: EXECUTIVE SUMMARY', 50, 50);
    line(70);

    const s = data.sections.summary;
    const summaryData = [
      ['Total Actions Tracked', s.total_actions.toString()],
      ['Completed Actions', `${s.completed_actions} (${s.completion_rate}%)`],
      ['Missed Actions', s.missed_actions.toString()],
      ['Policy Violations', s.total_violations.toString()],
      ['Score at Start', s.score_start.toString()],
      ['Score at End', s.score_end.toString()],
      ['Net Score Change', (s.score_end - s.score_start).toString()],
    ];

    let currentY = 90;
    summaryData.forEach(([label, value]) => {
      doc.font('Helvetica').fontSize(10).fillColor(mutedColor).text(label, 60, currentY);
      doc.font('Helvetica-Bold').fillColor(primaryColor).text(value, 250, currentY);
      currentY += 20;
    });

    // --- SECTION 2: DISCIPLINE SCORE TRAJECTORY ---
    doc.moveDown(2);
    doc.fillColor(accentColor).font('Helvetica-Bold').fontSize(14).text('SECTION 2: DISCIPLINE SCORE TRAJECTORY', 50, doc.y);
    const scoreY = doc.y + 10;
    line(scoreY);

    doc.font('Helvetica-Bold').fontSize(9).fillColor(primaryColor);
    doc.text('DATE', 60, scoreY + 15);
    doc.text('SCORE', 200, scoreY + 15);
    
    currentY = scoreY + 35;
    data.sections.disciplineScores.slice(0, 40).forEach((row, idx) => {
      if (idx % 2 === 0) doc.rect(50, currentY - 5, 495, 18).fill(rowAltColor);
      doc.fillColor(primaryColor).font('Helvetica').fontSize(9);
      doc.text(row.date, 60, currentY);
      doc.text(row.score.toString(), 200, currentY);
      currentY += 18;
    });

    // --- SECTION 3: AUDIT EVENT LOG ---
    doc.addPage();
    doc.fillColor(accentColor).font('Helvetica-Bold').fontSize(14).text('SECTION 3: AUDIT EVENT LOG', 50, 50);
    const auditY = doc.y + 10;
    line(auditY);

    doc.font('Helvetica-Bold').fontSize(8).fillColor(primaryColor);
    doc.text('TIMESTAMP', 55, auditY + 15);
    doc.text('EVENT', 160, auditY + 15);
    doc.text('ACTOR', 280, auditY + 15);
    doc.text('DETAILS', 380, auditY + 15);

    currentY = auditY + 35;
    data.sections.auditLog.slice(0, 30).forEach((entry, idx) => {
      if (idx % 2 === 0) doc.rect(50, currentY - 5, 495, 20).fill(rowAltColor);
      doc.fillColor(primaryColor).font('Helvetica').fontSize(7);
      doc.text(entry.timestamp.substring(0, 19), 55, currentY);
      doc.text(entry.event, 160, currentY, { width: 110 });
      doc.text(entry.actor, 280, currentY, { width: 90 });
      doc.text(entry.details.substring(0, 60), 380, currentY, { width: 160 });
      currentY += 20;
    });

    // --- SECTION 4: POLICY VIOLATIONS ---
    doc.moveDown(2);
    currentY = doc.y + 20;
    doc.fillColor(accentColor).font('Helvetica-Bold').fontSize(14).text('SECTION 4: POLICY VIOLATIONS', 50, currentY);
    const violY = doc.y + 10;
    line(violY);

    doc.font('Helvetica-Bold').fontSize(8).fillColor(primaryColor);
    doc.text('TIMESTAMP', 55, violY + 15);
    doc.text('TYPE', 160, violY + 15);
    doc.text('SEVERITY', 280, violY + 15);
    doc.text('DETAILS', 350, violY + 15);

    currentY = violY + 35;
    data.sections.policyViolations.forEach((v, idx) => {
      if (idx % 2 === 0) doc.rect(50, currentY - 5, 495, 20).fill(rowAltColor);
      doc.fillColor(primaryColor).font('Helvetica').fontSize(7);
      doc.text(v.timestamp.substring(0, 19), 55, currentY);
      doc.text(v.type, 160, currentY);
      doc.text(v.severity, 280, currentY);
      doc.text(v.details.substring(0, 80), 350, currentY, { width: 190 });
      currentY += 20;
    });

    // --- SECTION 5: VERIFICATION ---
    doc.addPage();
    doc.fillColor(accentColor).font('Helvetica-Bold').fontSize(14).text('SECTION 5: COMPLIANCE VERIFICATION', 50, 50);
    line(70);

    doc.fillColor(primaryColor).font('Helvetica').fontSize(10);
    doc.text(`Pack ID: ${data.packId}`, 50, 90);
    doc.text(`HMAC Signature: ${data.signature}`, 50, 105);
    
    doc.moveDown(2);
    doc.font('Helvetica-Oblique').fontSize(9).fillColor(mutedColor);
    doc.text('VERIFICATION PROTOCOL:', 50, doc.y);
    doc.text('To verify the integrity of this record, compute the HMAC-SHA256 of the associated JSON sections', 50, doc.y + 15);
    doc.text('using the system evidence key. The resulting hash must match the signature provided above.', 50, doc.y + 27);

    doc.moveDown(4);
    doc.font('Helvetica-Bold').fontSize(8).text('// IRON-X EVIDENCE SYSTEM v1.0 // TAMPER-EVIDENT AUDIT RECORD', 50, doc.y);

    doc.end();
  });
}
