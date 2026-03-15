import 'reflect-metadata';
import { container } from 'tsyringe';
import { QuotaService } from '../../modules/subscription/quota.service';
import { SubscriptionService, SUBSCRIPTION_LIMITS } from '../../modules/subscription/subscription.service';
import { SubscriptionTier } from '@prisma/client';

const mockSubscriptionService = {
  getSubscription: jest.fn(),
  getAccountStatus: jest.fn(),
};

const mockPrisma = {
  action: { count: jest.fn() },
  goal:   { count: jest.fn() },
  team:   { count: jest.fn() },
  user:   { findUnique: jest.fn() },
  webhook:{ count: jest.fn() },
  apiKey: { count: jest.fn() },
};

beforeAll(() => {
  container.registerInstance('PrismaClient', mockPrisma as any);
  container.registerInstance(SubscriptionService, mockSubscriptionService as any);
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSubscriptionService.getAccountStatus.mockResolvedValue({ status: 'ACTIVE' });
});

describe('QuotaService', () => {
  let service: QuotaService;

  beforeEach(() => {
    service = container.resolve(QuotaService);
  });

  // --- HARD_LOCKED account ---
  it('denies all resources when account is HARD_LOCKED', async () => {
    mockSubscriptionService.getSubscription.mockResolvedValue({ plan_tier: SubscriptionTier.INDIVIDUAL_PRO });
    mockSubscriptionService.getAccountStatus.mockResolvedValue({
      status: 'HARD_LOCKED',
      message: 'Account locked due to payment failure',
    });

    const result = await service.checkQuota('user-1', 'ACTIONS');
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('locked');
  });

  // --- FREE tier limits ---
  it('blocks ACTIONS when FREE user is at limit', async () => {
    mockSubscriptionService.getSubscription.mockResolvedValue({ plan_tier: SubscriptionTier.FREE });
    const freeActionLimit = SUBSCRIPTION_LIMITS[SubscriptionTier.FREE].max_actions;
    mockPrisma.action.count.mockResolvedValue(freeActionLimit);

    const result = await service.checkQuota('user-1', 'ACTIONS');
    expect(result.allowed).toBe(false);
    expect(result.message).toContain('FREE');
  });

  it('allows ACTIONS when FREE user is under limit', async () => {
    mockSubscriptionService.getSubscription.mockResolvedValue({ plan_tier: SubscriptionTier.FREE });
    const freeActionLimit = SUBSCRIPTION_LIMITS[SubscriptionTier.FREE].max_actions;
    mockPrisma.action.count.mockResolvedValue(freeActionLimit - 1);

    const result = await service.checkQuota('user-1', 'ACTIONS');
    expect(result.allowed).toBe(true);
  });

  it('blocks GOALS when FREE user is at limit', async () => {
    mockSubscriptionService.getSubscription.mockResolvedValue({ plan_tier: SubscriptionTier.FREE });
    const freeGoalLimit = SUBSCRIPTION_LIMITS[SubscriptionTier.FREE].max_goals;
    mockPrisma.goal.count.mockResolvedValue(freeGoalLimit);

    const result = await service.checkQuota('user-1', 'GOALS');
    expect(result.allowed).toBe(false);
  });

  // --- PRO tier (higher limits) ---
  it('allows ACTIONS for PRO user well under limit', async () => {
    mockSubscriptionService.getSubscription.mockResolvedValue({ plan_tier: SubscriptionTier.INDIVIDUAL_PRO });
    mockPrisma.action.count.mockResolvedValue(50);

    const result = await service.checkQuota('user-1', 'ACTIONS');
    expect(result.allowed).toBe(true);
  });

  // --- TEAMS resource ---
  it('blocks TEAMS when user owns too many teams', async () => {
    mockSubscriptionService.getSubscription.mockResolvedValue({ plan_tier: SubscriptionTier.FREE });
    const freeTeamLimit = SUBSCRIPTION_LIMITS[SubscriptionTier.FREE].max_teams;
    mockPrisma.team.count.mockResolvedValue(freeTeamLimit);

    const result = await service.checkQuota('user-1', 'TEAMS');
    expect(result.allowed).toBe(false);
  });

  // --- Unknown resource ---
  it('allows unknown resource type (falls through switch safely)', async () => {
    mockSubscriptionService.getSubscription.mockResolvedValue({ plan_tier: SubscriptionTier.FREE });

    const result = await service.checkQuota('user-1', 'UNKNOWN_RESOURCE');
    // count = 0, limit = Infinity -> allowed
    expect(result.allowed).toBe(true);
  });
});
