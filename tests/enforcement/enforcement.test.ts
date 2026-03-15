// tests/enforcement/enforcement.test.ts

describe('Enforcement Integrity', () => {

  // Helper mirrors EnforcementObserver logic
  function evaluateEnforcementResponse(
    violationCount: number,
    enforcementMode: string
  ): 'COACHING_PAUSE' | 'HARD_LOCKOUT' | 'NO_ACTION' {
    if (enforcementMode !== 'HARD') return 'NO_ACTION';
    if (violationCount <= 1) return 'COACHING_PAUSE';
    return 'HARD_LOCKOUT';
  }

  it('should return NO_ACTION for SOFT enforcement mode', () => {
    expect(evaluateEnforcementResponse(5, 'SOFT')).toBe('NO_ACTION');
  });

  it('should return COACHING_PAUSE for first HARD violation (count = 0)', () => {
    expect(evaluateEnforcementResponse(0, 'HARD')).toBe('COACHING_PAUSE');
  });

  it('should return COACHING_PAUSE for first HARD violation (count = 1, current may be logged)', () => {
    expect(evaluateEnforcementResponse(1, 'HARD')).toBe('COACHING_PAUSE');
  });

  it('should return HARD_LOCKOUT for repeat violations (count = 2)', () => {
    expect(evaluateEnforcementResponse(2, 'HARD')).toBe('HARD_LOCKOUT');
  });

  it('should return HARD_LOCKOUT for chronic violations (count = 10)', () => {
    expect(evaluateEnforcementResponse(10, 'HARD')).toBe('HARD_LOCKOUT');
  });
});
