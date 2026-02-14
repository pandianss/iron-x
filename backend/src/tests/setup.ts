import 'reflect-metadata';
import { Logger } from '../utils/logger';

// Mock Logger to avoid cluttering test output
jest.mock('../utils/logger', () => ({
    Logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
    },
}));

beforeAll(() => {
    // Global setup
});

afterAll(() => {
    // Global teardown
});
