import { AuditObserver } from '../../src/governance/observers/AuditObserver';
import prisma from '../../src/db';
import { DomainEventType } from '../../src/kernel/domain/types';

jest.mock('../../src/db', () => ({
    __esModule: true,
    default: {
        auditLog: {
            create: jest.fn().mockResolvedValue({ log_id: 'test-log-id' })
        }
    }
}));

describe('AuditObserver', () => {
    let observer: AuditObserver;

    beforeEach(() => {
        observer = new AuditObserver();
        (prisma.auditLog.create as jest.Mock).mockClear();
    });

    it('should insert an audit record on handling a DomainEvent', async () => {
        const event = {
            type: DomainEventType.VIOLATION_DETECTED,
            userId: 'user-id-123',
            timestamp: new Date('2026-02-20T00:00:00Z'),
            payload: {
                reason: 'MISSED_ACTION',
                instanceId: 'instance-id-456'
            }
        };

        await observer.handle(event);

        expect(prisma.auditLog.create).toHaveBeenCalledTimes(1);
        const dataArg = (prisma.auditLog.create as jest.Mock).mock.calls[0][0].data;

        expect(dataArg.actor_id).toBe('user-id-123');
        expect(dataArg.action).toBe('VIOLATION_DETECTED');
        expect(JSON.parse(dataArg.details)).toEqual({
            reason: 'MISSED_ACTION',
            instanceId: 'instance-id-456'
        });
        expect(dataArg.timestamp).toEqual(new Date('2026-02-20T00:00:00Z'));
    });
});
