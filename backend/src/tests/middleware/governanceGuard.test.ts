import { governanceGuard } from '../../middleware/governanceGuard';
import prisma from '../../db';
import { Request, Response, NextFunction } from 'express';

// Mock Prisma
jest.mock('../../db', () => ({
    user: {
        findUnique: jest.fn()
    }
}));

// Mock logger
global.console = { ...global.console, log: jest.fn(), warn: jest.fn(), error: jest.fn() };

describe('Governance Guard Middleware', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {
            method: 'POST',
            originalUrl: '/test',
            user: { userId: 'user-123' }
        } as any;

        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            setHeader: jest.fn(),
            sendStatus: jest.fn()
        };

        next = jest.fn();
        jest.clearAllMocks();
    });

    it('should block requests without user attached', async () => {
        req.user = undefined;
        await governanceGuard(req as any, res as Response, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'GOV_NO_ID' }));
    });

    it('should block if user entity is not found', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
        await governanceGuard(req as any, res as Response, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'GOV_NO_ENTITY' }));
    });

    it('should BLOCK mutations (POST) if user is locked out', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            locked_until: new Date(Date.now() + 100000), // Future
            enforcement_mode: 'HARD'
        });

        req.method = 'POST';
        await governanceGuard(req as any, res as Response, next);
        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ code: 'GOV_LOCKOUT' }));
        expect(next).not.toHaveBeenCalled();
    });

    it('should ALLOW read-only (GET) if user is locked out, but add warning header', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            locked_until: new Date(Date.now() + 100000), // Future
            enforcement_mode: 'HARD'
        });

        req.method = 'GET';
        await governanceGuard(req as any, res as Response, next);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.setHeader).toHaveBeenCalledWith('X-Iron-Governance-Status', 'LOCKED_READ_ONLY');
        expect(next).toHaveBeenCalled();
    });

    it('should ALLOW requests if user is NOT locked out', async () => {
        (prisma.user.findUnique as jest.Mock).mockResolvedValue({
            locked_until: null,
            enforcement_mode: 'SOFT'
        });

        await governanceGuard(req as any, res as Response, next);
        expect(next).toHaveBeenCalled();
        expect((req as any).governance).toBeDefined();
        expect((req as any).governance.mode).toBe('SOFT');
    });
});
