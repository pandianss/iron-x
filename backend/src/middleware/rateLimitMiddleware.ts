
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});

export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 login/register requests per hour
    message: { message: 'Too many login attempts from this IP, please try again after an hour' }
});

export const logExecutionLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 log executions per minute (generous but prevents rapid-fire abuse)
    message: { message: 'Logging too fast, please slow down' }
});
