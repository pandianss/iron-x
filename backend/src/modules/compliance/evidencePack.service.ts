import { container, singleton } from 'tsyringe';
import prisma from '../../db';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export interface EvidencePackParams {
  userId?: string;        // for individual pack
  orgId?: string;         // for org-wide pack
  startDate: Date;
  endDate: Date;
  format: 'PDF' | 'JSON' | 'BOTH';
}

export interface EvidenceSummary {
  total_actions: number;
  completed_actions: number;
  missed_actions: number;
  completion_rate: number;
  total_violations: number;
  score_start: number;
  score_end: number;
  audit_event_count: number;
}

export interface AuditLogEntry {
  timestamp: string;
  event: string;
  actor: string;
  target: string;
  details: string;
}

export interface ComplianceControlEntry {
  control_code: string;
  framework: string;
  description: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'NOT_APPLICABLE';
}

export interface DisciplineScoreEntry {
  date: string;
  score: number;
}

export interface PolicyViolationEntry {
  timestamp: string;
  type: string;
  severity: 'LOW' | 'MED' | 'HIGH' | 'CRITICAL';
  details: string;
}

export interface EvidencePackResult {
  packId: string;
  generated_at: Date;
  period: { start: Date; end: Date };
  subject: { type: 'USER' | 'ORG'; id: string; identifier: string };
  sections: {
    summary: EvidenceSummary;
    auditLog: AuditLogEntry[];
    complianceControls: ComplianceControlEntry[];
    disciplineScores: DisciplineScoreEntry[];
    policyViolations: PolicyViolationEntry[];
    actionCompletionRate: number;
  };
  signature: string;
}

@singleton()
export class EvidencePackService {
  async generatePack(params: EvidencePackParams): Promise<EvidencePackResult> {
    const { startDate, endDate } = params;

    // 1. Fetch audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        ...(params.userId ? { target_user_id: params.userId } : {}),
        timestamp: { gte: startDate, lte: endDate }
      },
      orderBy: { timestamp: 'asc' },
      include: {
        actor: { select: { email: true } },
        target: { select: { email: true } }
      }
    });

    // 2. Fetch discipline scores
    const disciplineScores = await prisma.disciplineScore.findMany({
      where: {
        user_id: params.userId,
        date: { gte: startDate, lte: endDate }
      },
      orderBy: { date: 'asc' }
    });

    // 3. Fetch action instance completion data
    const instances = await prisma.actionInstance.findMany({
      where: {
        user_id: params.userId,
        scheduled_start_time: { gte: startDate, lte: endDate }
      },
      include: { action: { select: { title: true } } }
    });

    // 4. Policy violations (MISSED + LOCKOUT events from audit log)
    // Looking for events that signify violations
    const violations = auditLogs.filter(l => 
      l.action === 'LOCKOUT_APPLIED' || l.action === 'ACTION_MISSED' || l.action === 'VIOLATION_RECORDED'
    );

    // 5. Compile summary
    const completed = instances.filter(i => i.status === 'COMPLETED').length;
    const total = instances.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const packData: Omit<EvidencePackResult, 'signature'> = {
      packId: uuidv4(),
      generated_at: new Date(),
      period: { start: startDate, end: endDate },
      subject: { 
        type: params.userId ? 'USER' : 'ORG', 
        id: params.userId || params.orgId || 'unknown', 
        identifier: params.userId ? 'Individual_User_Pack' : 'Organization_Wide_Pack' 
      },
      sections: {
        summary: {
          total_actions: total,
          completed_actions: completed,
          missed_actions: total - completed,
          completion_rate: completionRate,
          total_violations: violations.length,
          score_start: disciplineScores[0]?.score || 0,
          score_end: disciplineScores[disciplineScores.length - 1]?.score || 0,
          audit_event_count: auditLogs.length
        },
        auditLog: auditLogs.map(l => ({
          timestamp: l.timestamp.toISOString(),
          event: l.action,
          actor: l.actor?.email || 'SYSTEM',
          target: l.target?.email || 'N/A',
          details: l.details || ''
        })),
        complianceControls: [], // Placeholder for expansion
        disciplineScores: disciplineScores.map(s => ({ 
          date: s.date.toISOString().split('T')[0], 
          score: s.score 
        })),
        policyViolations: violations.map(v => ({
          timestamp: v.timestamp.toISOString(),
          type: v.action,
          severity: v.action === 'LOCKOUT_APPLIED' ? 'HIGH' : 'MED',
          details: v.details || ''
        })),
        actionCompletionRate: completionRate
      }
    };

    // Sign the pack
    const content = JSON.stringify(packData.sections);
    const signingKey = process.env.EVIDENCE_SIGNING_KEY || 'iron-x-default-key-32-chars-long-min';
    const signature = crypto.createHmac('sha256', signingKey).update(content).digest('hex');

    return { ...packData, signature } as EvidencePackResult;
  }
}
