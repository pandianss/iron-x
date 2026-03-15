import 'reflect-metadata';

// Mock DB before any imports that use it
jest.mock('../../db', () => ({
  __esModule: true,
  default: {
    auditLog: { count: jest.fn(), create: jest.fn() },
    user: { update: jest.fn(), findUnique: jest.fn() },
  },
}));

// Mock tsyringe container resolve
jest.mock('tsyringe', () => ({
  container: { resolve: jest.fn() },
  injectable: () => () => {},
  inject: () => () => {},
}));

import prisma from '../../db';
import { container } from 'tsyringe';
import { EnforcementObserver } from '../../governance/observers/EnforcementObserver';
import { DomainEventType } from '../../kernel/domain/types';

const makeViolationEvent = (enforcementMode: string, userId = 'user-1') => ({
  type: DomainEventType.VIOLATION_DETECTED,
  timestamp: new Date(),
  userId,
  payload: {
    instanceId: 'instance-1',
    reason: 'MISSED_ACTION',
    enforcementMode,
  },
});

describe('EnforcementObserver', () => {
  let observer: EnforcementObserver;

  beforeEach(() => {
    observer = new EnforcementObserver();
    jest.clearAllMocks();
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      current_discipline_score: 60,
    });
    (prisma.auditLog.create as jest.Mock).mockResolvedValue({});
    (prisma.user.update as jest.Mock).mockResolvedValue({});
  });

  // --- SOFT mode: no action ---
  it('does nothing for SOFT enforcement mode violations', async () => {
    (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);
    await observer.handle(makeViolationEvent('SOFT'));

    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
  });

  it('does nothing for NONE enforcement mode violations', async () => {
    await observer.handle(makeViolationEvent('NONE'));

    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.create).not.toHaveBeenCalled();
  });

  // --- First HARD violation: coaching pause ---
  it('applies coaching pause (no lockout) for first HARD violation (count = 0)', async () => {
    (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

    await observer.handle(makeViolationEvent('HARD'));

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      data: expect.objectContaining({
        locked_until: null,
        acknowledgment_required: true,
        enforcement_mode: 'SOFT',
      }),
    });

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'COACHING_PAUSE_APPLIED',
        target_user_id: 'user-1',
      }),
    });
  });

  it('applies coaching pause when count = 1 (current violation may already be logged)', async () => {
    (prisma.auditLog.count as jest.Mock).mockResolvedValue(1);

    await observer.handle(makeViolationEvent('HARD'));

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ locked_until: null }),
      })
    );
  });

  it('coaching pause sets locked_until to null — not a lockout', async () => {
    (prisma.auditLog.count as jest.Mock).mockResolvedValue(0);

    await observer.handle(makeViolationEvent('HARD'));

    const updateCall = (prisma.user.update as jest.Mock).mock.calls[0][0];
    expect(updateCall.data.locked_until).toBeNull();
  });

  // --- Repeat HARD violations: standard lockout ---
  it('applies hard lockout for repeat violations (count = 2)', async () => {
    (prisma.auditLog.count as jest.Mock).mockResolvedValue(2);
    const mockPolicyService = { applyEnforcement: jest.fn().mockResolvedValue(undefined) };
    (container.resolve as jest.Mock).mockReturnValue(mockPolicyService);

    await observer.handle(makeViolationEvent('HARD'));

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { user_id: 'user-1' },
      select: { current_discipline_score: true },
    });
    expect(mockPolicyService.applyEnforcement).toHaveBeenCalledWith('user-1', 60);
    // coaching path must NOT have been taken
    expect(prisma.auditLog.create).not.toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'COACHING_PAUSE_APPLIED' }) })
    );
  });

  it('ignores non-VIOLATION_DETECTED events gracefully', async () => {
    await observer.handle({
      type: 'SCORE_UPDATED' as any,
      timestamp: new Date(),
      userId: 'user-1',
      payload: {} as any,
    });

    expect(prisma.user.update).not.toHaveBeenCalled();
    expect(prisma.auditLog.count).not.toHaveBeenCalled();
  });
});
