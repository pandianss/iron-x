import 'reflect-metadata';
import { container } from 'tsyringe';
import { TrustTierService, TrustTier } from '../../services/trustTier.service';

const mockPrisma = {
  user: { findUnique: jest.fn(), update: jest.fn() },
  disciplineScore: { findMany: jest.fn() },
};

beforeAll(() => {
  container.registerInstance('PrismaClient', mockPrisma as any);
});

beforeEach(() => {
  jest.clearAllMocks();
  mockPrisma.user.update.mockResolvedValue({});
});

const makeScores = (score: number, count: number) =>
  Array(count).fill(null).map((_, i) => ({
    date: new Date(Date.now() - i * 86400000),
    score,
  }));

describe('TrustTierService', () => {
  let service: TrustTierService;

  beforeEach(() => {
    service = container.resolve(TrustTierService);
  });

  // --- Demotion ---
  it('demotes STANDARD → PROVISIONAL when score < 50', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      trust_tier: TrustTier.STANDARD,
      current_discipline_score: 45,
      created_at: new Date(),
    });
    mockPrisma.disciplineScore.findMany.mockResolvedValue([]);

    const result = await service.evaluateTierUpdate('user-1');
    expect(result).toBe(TrustTier.PROVISIONAL);
    expect(mockPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ trust_tier: TrustTier.PROVISIONAL }) })
    );
  });

  it('demotes TRUSTED → STANDARD when score < 50', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      trust_tier: TrustTier.TRUSTED,
      current_discipline_score: 40,
      created_at: new Date(),
    });
    mockPrisma.disciplineScore.findMany.mockResolvedValue([]);

    const result = await service.evaluateTierUpdate('user-1');
    expect(result).toBe(TrustTier.STANDARD);
  });

  it('does not demote PROVISIONAL (already floor)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      trust_tier: TrustTier.PROVISIONAL,
      current_discipline_score: 30,
      created_at: new Date(),
    });
    mockPrisma.disciplineScore.findMany.mockResolvedValue([]);

    await service.evaluateTierUpdate('user-1');
    // Should not call update for demotion from PROVISIONAL
    const updateCalls = (mockPrisma.user.update as jest.Mock).mock.calls;
    const demotionCall = updateCalls.find(c => c[0]?.data?.trust_tier === TrustTier.PROVISIONAL);
    expect(demotionCall).toBeUndefined();
  });

  // --- Promotion to TRUSTED ---
  it('promotes STANDARD → TRUSTED when DS >= 85 sustained for 30 days', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      trust_tier: TrustTier.STANDARD,
      current_discipline_score: 90,
      created_at: new Date(Date.now() - 60 * 86400000),
    });
    mockPrisma.disciplineScore.findMany.mockResolvedValue(makeScores(88, 30));

    const result = await service.evaluateTierUpdate('user-1');
    expect(result).toBe(TrustTier.TRUSTED);
  });

  it('does NOT promote to TRUSTED if score dips below 85 in the 30-day window', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      trust_tier: TrustTier.STANDARD,
      current_discipline_score: 87,
      created_at: new Date(Date.now() - 60 * 86400000),
    });
    // Mix of high and low scores in the window
    const scores = [...makeScores(90, 15), ...makeScores(70, 15)];
    mockPrisma.disciplineScore.findMany.mockResolvedValue(scores);

    const result = await service.evaluateTierUpdate('user-1');
    expect(result).not.toBe(TrustTier.TRUSTED);
  });

  // --- Promotion to AUTONOMOUS ---
  it('promotes TRUSTED → AUTONOMOUS when DS >= 90 sustained for 60 days', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      trust_tier: TrustTier.TRUSTED,
      current_discipline_score: 95,
      created_at: new Date(Date.now() - 90 * 86400000),
    });
    mockPrisma.disciplineScore.findMany.mockResolvedValue(makeScores(92, 60));

    const result = await service.evaluateTierUpdate('user-1');
    expect(result).toBe(TrustTier.AUTONOMOUS);
  });

  it('does NOT promote PROVISIONAL → AUTONOMOUS directly', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      trust_tier: TrustTier.PROVISIONAL,
      current_discipline_score: 98,
      created_at: new Date(Date.now() - 90 * 86400000),
    });
    mockPrisma.disciplineScore.findMany.mockResolvedValue(makeScores(95, 60));

    const result = await service.evaluateTierUpdate('user-1');
    expect(result).not.toBe(TrustTier.AUTONOMOUS);
  });
});
