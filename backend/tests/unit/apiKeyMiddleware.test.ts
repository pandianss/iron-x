import { Request, Response, NextFunction } from 'express';
import { apiKeyMiddleware } from '../../src/middleware/apiKeyMiddleware';
import prisma from '../../src/db';
import crypto from 'crypto';

jest.mock('../../src/db', () => ({
    __esModule: true,
    default: {
        apiKey: {
            findUnique: jest.fn(),
            update: jest.fn().mockResolvedValue({})
        }
    }
}));

describe('apiKeyMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();

    beforeEach(() => {
        mockRequest = {
            header: jest.fn().mockReturnValue('custom_api_key'),
            originalUrl: '/api/v1/protected-route',
        };
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
        jest.clearAllMocks();
    });

    it('should skip enforcement and call next() if no API key is provided', async () => {
        mockRequest.header = jest.fn().mockReturnValue(undefined);

        await apiKeyMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect(prisma.apiKey.findUnique).not.toHaveBeenCalled();
    });

    it('should return 401 if an invalid API key is provided', async () => {
        (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue(null);

        await apiKeyMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid API Key' });
        expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() and attach orgId if a valid API key is provided', async () => {
        const mockKey = {
            key_id: 'test_key_id',
            org_id: 'test_org_id',
            key_hash: crypto.createHash('sha256').update('custom_api_key').digest('hex'),
            expires_at: null,
        };
        (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue(mockKey);

        await apiKeyMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(nextFunction).toHaveBeenCalled();
        expect((mockRequest as any).orgId).toBe('test_org_id');
        expect(prisma.apiKey.update).toHaveBeenCalledWith(
            expect.objectContaining({
                where: { key_id: 'test_key_id' }
            })
        );
    });

    it('should return 401 if the provided API key is expired', async () => {
        const expiredKey = {
            key_id: 'test_key_id',
            org_id: 'test_org_id',
            key_hash: crypto.createHash('sha256').update('custom_api_key').digest('hex'),
            expires_at: new Date(Date.now() - 1000 * 60 * 60), // Expired 1 hour ago
        };
        (prisma.apiKey.findUnique as jest.Mock).mockResolvedValue(expiredKey);

        await apiKeyMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

        expect(mockResponse.status).toHaveBeenCalledWith(401);
        expect(mockResponse.json).toHaveBeenCalledWith({ message: 'API Key Expired' });
        expect(nextFunction).not.toHaveBeenCalled();
    });
});
