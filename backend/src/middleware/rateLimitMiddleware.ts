import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Helper to create a new store instance with a unique prefix
const createStore = (prefix: string) => new RedisStore({
    sendCommand: (async (...args: string[]) => {
        return (redisClient as any).call(...args);
    }) as any,
    prefix: `rl:${prefix}:`,
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,
    store: createStore('auth'),
    message: {
        error: 'Too many authentication attempts. Try again in 15 minutes.',
        code: 'RATE_LIMITED',
        retryAfter: 900
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    keyGenerator: (req) => req.ip || 'unknown',
});

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000,        // 1 minute
    max: 100,
    store: createStore('api'),
    message: { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
});

// Tighter limiter for public developer API (key-authenticated, higher abuse potential)
export const publicApiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    store: createStore('public-api'),
    message: { error: 'API rate limit exceeded', code: 'RATE_LIMITED' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.headers['x-api-key'] as string || req.ip || 'unknown',
    validate: false,
});

export const logExecutionLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    store: createStore('log-exec'),
    message: { error: 'Logging rate limit exceeded' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const billingWebhookLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20, // Strict limit for webhooks to prevent DDoS
    store: createStore('billing-webhook'),
    message: { error: 'Webhook rate limit exceeded' },
    standardHeaders: true,
    legacyHeaders: false,
});

export const adminLimiter = rateLimit({
    windowMs: 15 * 1000,
    max: 30, // 2 requests per second average
    store: createStore('admin'),
    message: { error: 'Admin API rate limit exceeded' },
    standardHeaders: true,
    legacyHeaders: false,
});
