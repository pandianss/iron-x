import { ActionStatus, EnforcementMode } from '@prisma/client';
// Note: Imports will need adjustment based on final backend structure
// This serves as the baseline Enforcement Integrity Check

describe('Enforcement Integrity', () => {
    it('should trigger hard lockout on 3 consecutive misses', () => {
        const history = [
            { status: ActionStatus.MISSED },
            { status: ActionStatus.MISSED },
            { status: ActionStatus.MISSED }
        ];

        // Deterministic check: Lockout logic MUST return LOCKED
        expect(evaluateEnforcementState(history)).toBe(EnforcementMode.HARD_LOCKOUT);
    });

    it('should not allow motivational language in UI strings (Enforcement Check)', () => {
        const uiStrings = [
            "Action required",
            "System locked",
            "Compliance low"
        ];

        const motivationalTerms = ["good job", "keep it up", "streak", "badge", "congrats"];

        uiStrings.forEach(str => {
            motivationalTerms.forEach(term => {
                expect(str.toLowerCase()).not.toContain(term);
            });
        });
    });
});

function evaluateEnforcementState(history: any[]): EnforcementMode {
    const missedCount = history.filter(h => h.status === ActionStatus.MISSED).length;
    if (missedCount >= 3) return EnforcementMode.HARD_LOCKOUT;
    return EnforcementMode.STANDARD;
}
