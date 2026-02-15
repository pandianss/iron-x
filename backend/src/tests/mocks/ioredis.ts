const RedisMock = require('redis-mock');

// redis-mock exports { createClient: ... } usually, or similar.
// But we are mocking 'ioredis' which makes a class instance.
// We'll return a class that behaves like ioredis but uses redis-mock internally or just stubs.

class Redis {
    private client: any;
    public status: string = 'ready';

    constructor() {
        this.client = RedisMock.createClient();
    }
    async info() { return "redis_version:6.0.0"; }
    // Proxy methods to redis-mock client if needed, or just stub basic ones
    on(event: string, callback: (...args: unknown[]) => void) { return this; }
    async quit() { return 'OK'; }
    async disconnect() { return 'OK'; }

    // BullMQ needs these often
    async defineCommand() { return; }
}

export default Redis;
