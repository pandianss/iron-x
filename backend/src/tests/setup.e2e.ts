import 'reflect-metadata';

// Increase timeout for E2E tests
jest.setTimeout(30000);

// Mock BullMQ to avoid Redis requirement
jest.mock('bullmq', () => {
    return {
        Queue: jest.fn().mockImplementation(() => ({
            add: jest.fn(),
            on: jest.fn(),
            close: jest.fn(),
        })),
        Worker: jest.fn().mockImplementation(() => ({
            on: jest.fn(),
            close: jest.fn(),
            run: jest.fn(),
        })),
    };
});

beforeAll(async () => {
    // Database connection is handled in globalSetup or individual tests
});

afterAll(async () => {

});
