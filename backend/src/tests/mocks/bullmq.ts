module.exports = {
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
