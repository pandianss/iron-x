import prisma from '../db';

export class DisciplineService {
    async getState(userId: string) {
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            select: { current_discipline_score: true, discipline_classification: true }
        });

        if (!user) throw new Error('User not found');

        // Logic to determine status based on score if classification is not sufficient
        // or just return the classification.
        let status = user.discipline_classification || 'STABLE';
        const score = user.current_discipline_score;

        // Fallback or override logic if needed
        if (score < 50) status = 'BREACH';
        else if (score < 80) status = 'DRIFTING';
        else if (score >= 95) status = 'STRICT';

        return {
            score,
            status,
            timeSinceLastViolation: '04:12:33', // Mock for now, would be calculated from Audit/Violation logs
            countdownToNextCheck: '00:45:00',
            decayRate: -0.05
        };
    }

    async getPressure(userId: string) {
        // In a real implementation, this would aggregate data from various sources
        return {
            compositePressure: 'RISING',
            driftVectors: [
                { source: 'Execution Lag', current: '12m', threshold: '15m', timeToBreach: '1h 20m' },
                { source: 'Buffer Erosion', current: '82%', threshold: '70%', timeToBreach: '4h 00m' },
                { source: 'Pattern Drift', current: 'Low', threshold: 'Med', timeToBreach: '12h 15m' }
            ]
        };
    }

    async getPredictions(userId: string) {
        return [
            {
                event: 'Late Night Access Breach',
                time: '7h from now',
                confidence: 88,
                correctiveAction: 'Deactivate session before 23:00',
                consequence: 'Score Decay -5'
            },
            {
                event: 'Missed Morning Routine',
                time: '24h from now',
                confidence: 65,
                correctiveAction: 'Ensure wake-up lock-in',
                consequence: 'Action Lock Down'
            }
        ];
    }

    async getConstraints(userId: string) {
        return {
            activePolicies: ['CORE-01: Execution Rigor', 'TIME-02: Nocturnal Restriction'],
            exceptions: [
                { id: 'EXP-992', title: 'Work Override', expiry: '00:32:15' }
            ],
            reducedPrivileges: ['Flexible Scheduling', 'Optional Overlap'],
            frozenActions: ['Manual Score Adjustment', 'Delete Log Entry']
        };
    }

    async getHistory(userId: string) {
        // This should eventually query the AuditLog table
        return [
            { id: 'EVENT-4421', timestamp: new Date().toISOString(), action: 'Threshold Breach', impact: 'Score -12, Lockout Active', severity: 'HIGH' },
            { id: 'EVENT-4420', timestamp: new Date(Date.now() - 3600000).toISOString(), action: 'Missed Checkpoint', impact: 'Score -5', severity: 'MEDIUM' }
        ];
    }
}

export const disciplineService = new DisciplineService();
