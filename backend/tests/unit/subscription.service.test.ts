import 'reflect-metadata';
import { container } from 'tsyringe';
import { SubscriptionService } from '../../src/modules/subscription/subscription.service';
import prisma from '../../src/db';
import { SubscriptionTier } from '@prisma/client';

jest.mock('../../src/db', () => ({
    __esModule: true,
    default: {
        subscription: {
            findUnique: jest.fn(),
            upsert: jest.fn(),
            update: jest.fn(),
        },
        action: { count: jest.fn() },
        goal: { count: jest.fn() },
        team: { count: jest.fn() },
    },
}));

describe('SubscriptionService', () => {
    let subscriptionService: SubscriptionService;

    beforeEach(() => {
        subscriptionService = container.resolve(SubscriptionService);
        jest.clearAllMocks();
    });

    it('should retrieve subscription for a user', async () => {
        const mockSub = { user_id: 'user-1', plan_tier: SubscriptionTier.FREE };
        (prisma.subscription.findUnique as jest.Mock).mockResolvedValue(mockSub);

        const sub = await subscriptionService.getSubscription('user-1');

        expect(sub).toEqual(mockSub);
        expect(prisma.subscription.findUnique).toHaveBeenCalledWith({
            where: { user_id: 'user-1' },
        });
    });

    it('should check action limits correctly', async () => {
        (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
            plan_tier: SubscriptionTier.FREE,
        });
        (prisma.action.count as jest.Mock).mockResolvedValue(5); // Limit is 3 for FREE

        const result = await subscriptionService.checkActionLimit('user-1');

        expect(result.allowed).toBe(false);
        expect(result.message).toContain('Plan limit reached');
    });

    it('should allow actions if under limit', async () => {
        (prisma.subscription.findUnique as jest.Mock).mockResolvedValue({
            plan_tier: SubscriptionTier.INDIVIDUAL_PRO,
        });
        (prisma.action.count as jest.Mock).mockResolvedValue(10); // Infinity for PRO

        const result = await subscriptionService.checkActionLimit('user-1');

        expect(result.allowed).toBe(true);
    });
});
