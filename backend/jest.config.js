module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['**/*.test.ts'],
    verbose: true,
    // setupFilesAfterEnv: ['./tests/setup.ts'], // Uncomment when setup file is ready
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
};
