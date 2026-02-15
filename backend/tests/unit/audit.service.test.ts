import 'reflect-metadata';
import { container } from 'tsyringe';
import { AuditService } from '../../src/modules/audit/audit.service';
import prisma from '../../src/db';

jest.mock('../../src/db', () => ({
    __esModule: true,
    default: {
        auditLog: {
            create: jest.fn(),
            findMany: jest.fn(),
        },
    },
}));

describe('AuditService', () => {
    let auditService: AuditService;

    beforeEach(() => {
        auditService = container.resolve(AuditService);
        jest.clearAllMocks();
    });

    it('should log an event correctly', async () => {
        const mockLog = {
            user_id: 'user-1',
            action: 'TEST_ACTION',
            entity_type: 'GOAL',
            entity_id: 'goal-1',
            metadata: { foo: 'bar' },
        };

        (prisma.auditLog.create as jest.Mock).mockResolvedValue({ id: 'log-1', ...mockLog });

        await auditService.logEvent(
            mockLog.user_id,
            mockLog.action,
            mockLog.entity_type as any,
            mockLog.entity_id
        );

        expect(prisma.auditLog.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                user_id: mockLog.user_id,
                action: mockLog.action,
                entity_type: mockLog.entity_type,
            }),
        });
    });

    it('should retrieve logs correctly', async () => {
        const mockLogs = [{ id: 'log-1', action: 'LOGIN' }];
        (prisma.auditLog.findMany as jest.Mock).mockResolvedValue(mockLogs);

        const logs = await auditService.getLogs({ userId: 'user-1' });

        expect(logs).toEqual(mockLogs);
        expect(prisma.auditLog.findMany).toHaveBeenCalled();
    });
});
