import { ScoringPolicy } from '../../kernel/policies/ScoringPolicy';

const makeInstance = (
  status: string,
  executedAt?: Date,
  scheduledEndTime?: Date
) => ({
  status,
  executed_at: executedAt,
  scheduled_end_time: scheduledEndTime,
});

const past = (minutesAgo: number) =>
  new Date(Date.now() - minutesAgo * 60 * 1000);

const future = (minutesFromNow: number) =>
  new Date(Date.now() + minutesFromNow * 60 * 1000);

describe('ScoringPolicy.calculateScore', () => {

  // --- Baseline ---
  it('returns 50 for empty instance list', () => {
    expect(ScoringPolicy.calculateScore([])).toBe(50);
  });

  it('returns 50 when all instances are PENDING (no resolved instances)', () => {
    const instances = [
      makeInstance('PENDING'),
      makeInstance('PENDING'),
    ];
    expect(ScoringPolicy.calculateScore(instances)).toBe(50);
  });

  // --- Perfect completion ---
  it('returns 100 when all instances completed on time', () => {
    const instances = [
      makeInstance('COMPLETED', past(10), future(50)), // executed before end
      makeInstance('COMPLETED', past(5),  future(55)),
    ];
    expect(ScoringPolicy.calculateScore(instances)).toBe(100);
  });

  it('returns 100 when completed with no timing data (assumed on time)', () => {
    const instances = [
      makeInstance('COMPLETED'),
      makeInstance('COMPLETED'),
    ];
    expect(ScoringPolicy.calculateScore(instances)).toBe(100);
  });

  // --- All missed ---
  it('returns 0 when all instances are MISSED', () => {
    const instances = [
      makeInstance('MISSED'),
      makeInstance('MISSED'),
      makeInstance('MISSED'),
    ];
    expect(ScoringPolicy.calculateScore(instances)).toBe(0);
  });

  // --- Late completions ---
  it('scores late completions at 70 per instance', () => {
    // 1 instance, completed late: score = (0/1)*100 + (1/1)*70 - (0/1)*30 = 70
    const instances = [
      makeInstance('COMPLETED', past(5), past(60)), // executed AFTER end time
    ];
    expect(ScoringPolicy.calculateScore(instances)).toBe(70);
  });

  it('on_time_rate < execution_rate when some completions are late', () => {
    // 2 completed: 1 on time, 1 late
    const instances = [
      makeInstance('COMPLETED', past(10), future(50)), // on time
      makeInstance('COMPLETED', past(5),  past(30)),   // late
    ];
    const score = ScoringPolicy.calculateScore(instances);
    // score = (1/2)*100 + (1/2)*70 = 85
    expect(score).toBe(85);
  });

  // --- Mixed ---
  it('calculates correctly for 50% completion, 50% missed', () => {
    const instances = [
      makeInstance('COMPLETED'),
      makeInstance('MISSED'),
    ];
    // (1/2)*100 + (0/2)*70 - (1/2)*30 = 50 - 15 = 35
    expect(ScoringPolicy.calculateScore(instances)).toBe(35);
  });

  it('PENDING instances do not count toward total', () => {
    const instances = [
      makeInstance('COMPLETED'),
      makeInstance('PENDING'), // excluded from total
    ];
    // total = 1; (1/1)*100 = 100
    expect(ScoringPolicy.calculateScore(instances)).toBe(100);
  });

  // --- Clamping ---
  it('never returns a score below 0', () => {
    const instances = Array(10).fill(makeInstance('MISSED'));
    expect(ScoringPolicy.calculateScore(instances)).toBeGreaterThanOrEqual(0);
  });

  it('never returns a score above 100', () => {
    const instances = Array(10).fill(makeInstance('COMPLETED'));
    expect(ScoringPolicy.calculateScore(instances)).toBeLessThanOrEqual(100);
  });
});
