
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

/**
 * Enterprise IP Whitelisting Middleware (Placeholder/Logic)
 * In a full enterprise implementation, this would look up allowed IPs
 * from the Organization/Department settings in the database.
 */
export const ipWhitelistMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const allowedIps = process.env.ALLOWED_IPS;

    // If no whitelist is defined, allow all (default local/soft behavior)
    if (!allowedIps || allowedIps === '*') {
        return next();
    }

    const whitelist = allowedIps.split(',').map(ip => ip.trim());
    const clientIp = req.ip || req.socket.remoteAddress || '';

    // Check if client IP is in the whitelist (supporting simple equality for now)
    // Future: Add CIDR support (e.g. using ipaddr.js)
    if (whitelist.includes(clientIp) || clientIp === '::1' || clientIp === '127.0.0.1') {
        return next();
    }

    Logger.warn(`[Security] Blocked unauthorized IP: ${clientIp}`);
    res.status(403).json({
        message: 'Access denied: IP not authorized',
        reason: 'IP_NOT_WHITELISTED',
        ip: clientIp
    });
};
