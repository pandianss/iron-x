import 'reflect-metadata';
import { container } from 'tsyringe';
import { DisciplineStateService } from '../../services/disciplineState.service';

// Mock PrismaClient via DI token
const mockPrisma = {
  user: { findUnique: jest.fn() },
  actionInstance: { findMany: jest.fn() },
  disciplineScore: { findFirst: jest.fn(), upsert: jest.fn() },
};

beforeAll(() => {
  container.registerInstance('PrismaClient', mockPrisma as any);
});

beforeEach(() => {
  jest.clearAllMocks();
});

const makeInstance = (status: string, daysAgo = 1) => ({
  instance_id: `inst-${Math.random()}`,
  status,
  scheduled_start_time: new Date(Date.now() - daysAgo * 86400000),
  scheduled_end_time:   new Date(Date.now() - daysAgo * 86400000 + 3600000),
  executed_at: status === 'COMPLETED' ? new Date(Date.now() - daysAgo * 86400000 + 1800000) : null,
  completion_time_offset_minutes: null,
  action: { action_id: 'action-1', title: 'Morning Run', user_id: 'user-1' },
});

const baseUser = {
  user_id: 'user-1',
  current_discipline_score: 75,
  locked_until: null,
  role: null,
  disciplineExceptions: [],
};

describe('DisciplineStateService', () => {
  let service: DisciplineStateService;

  beforeEach(() => {
    service = container.resolve(DisciplineStateService);
    mockPrisma.user.findUnique.mockResolvedValue(baseUser);
    mockPrisma.actionInstance.findMany.mockResolvedValue([]);
  });

  // --- ONBOARDING classification ---
  it('classifies as ONBOARDING when fewer than 10 instances exist', async () => {
    const instances = Array(9).fill(null).map(() => makeInstance('COMPLETED'));
    mockPrisma.actionInstance.findMany.mockResolvedValue(instances);

    const state = await service.getUserDisciplineState('user-1');
    expect(state.classification).toBe('ONBOARDING');
  });

  it('classifies as ONBOARDING for a brand new user with 0 instances', async () => {
    mockPrisma.actionInstance.findMany.mockResolvedValue([]);

    const state = await service.getUserDisciplineState('user-1');
    expect(state.classification).toBe('ONBOARDING');
  });

  // --- Classification boundaries ---
  it('classifies as HIGH_RELIABILITY when score >= 90 and instances >= 10', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, current_discipline_score: 95 });
    const instances = Array(10).fill(null).map(() => makeInstance('COMPLETED'));
    mockPrisma.actionInstance.findMany.mockResolvedValue(instances);

    const state = await service.getUserDisciplineState('user-1');
    expect(state.classification).toBe('HIGH_RELIABILITY');
  });

  it('classifies as STABLE when score >= 70 and < 90 and instances >= 10', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, current_discipline_score: 75 });
    const instances = Array(10).fill(null).map(() => makeInstance('COMPLETED'));
    mockPrisma.actionInstance.findMany.mockResolvedValue(instances);

    const state = await service.getUserDisciplineState('user-1');
    expect(state.classification).toBe('HIGH_RELIABILITY');
  });

  it('classifies as RECOVERING when score < 70 and instances >= 10', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, current_discipline_score: 45 });
    const instances = Array(10).fill(null).map(() => makeInstance('MISSED'));
    mockPrisma.actionInstance.findMany.mockResolvedValue(instances);

    const state = await service.getUserDisciplineState('user-1');
    expect(state.classification).toBe('RECOVERING');
  });

  // --- Active constraints ---
  it('lockedUntil is null when locked_until is in the past', async () => {
    const pastDate = new Date(Date.now() - 10000);
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, locked_until: pastDate });

    const state = await service.getUserDisciplineState('user-1');
    expect(state.activeConstraints.lockedUntil).toBeNull();
  });

  it('lockedUntil is populated when locked_until is in the future', async () => {
    const futureDate = new Date(Date.now() + 3600000);
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, locked_until: futureDate });

    const state = await service.getUserDisciplineState('user-1');
    expect(state.activeConstraints.lockedUntil).toEqual(futureDate);
    expect(state.activeConstraints.reducedPrivileges).toContain('All Write Operations');
  });

  it('adds team admin restriction when score < 60', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ ...baseUser, current_discipline_score: 45 });
    const instances = Array(10).fill(null).map(() => makeInstance('MISSED'));
    mockPrisma.actionInstance.findMany.mockResolvedValue(instances);

    const state = await service.getUserDisciplineState('user-1');
    expect(state.activeConstraints.reducedPrivileges).toContain('Team Admin Access');
    expect(state.activeConstraints.frozenActions).toContain('New Goal Creation');
  });

  // --- Throws on missing user ---
  it('throws when user is not found', async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    await expect(service.getUserDisciplineState('ghost-user')).rejects.toThrow('User not found');
  });

  // --- Response shape ---
  it('returns all required fields in DisciplineMetrics shape', async () => {
    const state = await service.getUserDisciplineState('user-1');

    expect(state).toHaveProperty('score');
    expect(state).toHaveProperty('classification');
    expect(state).toHaveProperty('compositePressure');
    expect(state).toHaveProperty('driftVectors');
    expect(state).toHaveProperty('violationHorizon');
    expect(state).toHaveProperty('activeConstraints');
    expect(state).toHaveProperty('performanceMetrics');
    expect(Array.isArray(state.driftVectors)).toBe(true);
  });
});
