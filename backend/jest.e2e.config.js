/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/*.e2e.test.ts'],
    transform: {
        '^.+\\.ts$': [
            'ts-jest',
            {
                tsconfig: 'tsconfig.json',
            },
        ],
    },
    verbose: true,
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.e2e.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^uuid$': '<rootDir>/src/tests/mocks/uuid.ts',
        '^ioredis$': '<rootDir>/src/tests/mocks/ioredis.ts',
        '^bullmq$': '<rootDir>/src/tests/mocks/bullmq.ts',
    },
    globalSetup: '<rootDir>/src/tests/globalSetup.e2e.ts',
    globalTeardown: '<rootDir>/src/tests/globalTeardown.e2e.ts',
};
