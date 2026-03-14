import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Shared store — rate limits persist across deploys and container restarts
const store = new RedisStore({
    sendCommand: (...args: string[]) => redisClient.call(...args),
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 5,
    store,
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
    store,
    message: { error: 'Rate limit exceeded', code: 'RATE_LIMITED' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip || 'unknown',
});

// Tighter limiter for public developer API (key-authenticated, higher abuse potential)
export const publicApiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    store,
    message: { error: 'API rate limit exceeded', code: 'RATE_LIMITED' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.headers['x-api-key'] as string || req.ip || 'unknown',
});

export const logExecutionLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    store,
    message: { error: 'Logging rate limit exceeded' },
    standardHeaders: true,
    legacyHeaders: false,
});
