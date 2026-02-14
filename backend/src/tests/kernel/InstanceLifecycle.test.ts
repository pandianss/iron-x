import 'reflect-metadata';
import { InstanceLifecycle } from '../../kernel/InstanceLifecycle';
import { TestFactory } from '../factories/TestFactory';
import prisma from '../../db';

jest.mock('../../db', () => {
    const mockPrisma: any = {
        user: { findUnique: jest.fn() },
        policy: { findFirst: jest.fn() },
        action: { findMany: jest.fn() },
        actionInstance: { findMany: jest.fn(), createMany: jest.fn(), updateMany: jest.fn() }
    };
    mockPrisma.$transaction = jest.fn((callback: any) => callback(mockPrisma));

    return {
        __esModule: true,
        default: mockPrisma
    };
});

describe('InstanceLifecycle', () => {
    let lifecycle: InstanceLifecycle;

    beforeEach(() => {
        lifecycle = new InstanceLifecycle();
        jest.clearAllMocks();
    });

    describe('loadContext', () => {
        it('should load user context with default policy if none exists', async () => {
            const user = TestFactory.createUser({ role: null });
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
            (prisma.policy.findFirst as jest.Mock).mockResolvedValue(null);
            (prisma.actionInstance.findMany as jest.Mock).mockResolvedValue([]);

            const context = await lifecycle.loadContext(user.user_id);

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: { user_id: user.user_id },
                include: expect.any(Object)
            });
            expect(context.userId).toBe(user.user_id);
            expect(context.policy.rules.max_misses).toBe(3); // Default
        });

        it('should throw error if user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
            await expect(lifecycle.loadContext('bad-id')).rejects.toThrow('User bad-id not found');
        });
    });

    describe('materialize', () => {
        it('should create instances for active actions', async () => {
            const context = TestFactory.createContext();
            const actions = [TestFactory.createAction()];

            (prisma.action.findMany as jest.Mock).mockResolvedValue(actions);
            (prisma.actionInstance.findMany as jest.Mock).mockResolvedValue([]); // No existing instances

            await lifecycle.materialize(context as any);

            expect(prisma.actionInstance.createMany).toHaveBeenCalledWith({
                data: expect.arrayContaining([
                    expect.objectContaining({
                        action_id: actions[0].action_id,
                        user_id: context.userId,
                        status: 'PENDING'
                    })
                ])
            });
        });

        it('should NOT create duplicate instances', async () => {
            const context = TestFactory.createContext();
            const action = TestFactory.createAction();
            const existingInstance = TestFactory.createInstance({ action_id: action.action_id });

            (prisma.action.findMany as jest.Mock).mockResolvedValue([action]);
            (prisma.actionInstance.findMany as jest.Mock).mockResolvedValue([existingInstance]);

            await lifecycle.materialize(context as any);

            expect(prisma.actionInstance.createMany).not.toHaveBeenCalled();
        });
    });

    describe('detectMissed', () => {
        it('should return empty list if no instances are missed', async () => {
            const context = TestFactory.createContext();
            (prisma.actionInstance.findMany as jest.Mock).mockResolvedValue([]);

            const result = await lifecycle.detectMissed(context as any);

            expect(result).toHaveLength(0);
            expect(prisma.actionInstance.updateMany).not.toHaveBeenCalled();
        });

        it('should update status to MISSED for expired pending instances', async () => {
            const context = TestFactory.createContext();
            const missedInstance = TestFactory.createInstance({ status: 'PENDING' });

            (prisma.actionInstance.findMany as jest.Mock).mockResolvedValue([missedInstance]);

            const result = await lifecycle.detectMissed(context as any);

            expect(result).toContain(missedInstance.instance_id);
            expect(prisma.actionInstance.updateMany).toHaveBeenCalledWith({
                where: {
                    instance_id: { in: [missedInstance.instance_id] }
                },
                data: {
                    status: 'MISSED'
                }
            });
        });
    });
});
