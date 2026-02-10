import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const policyEnforcementMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    // Only apply to action creation/updates
    if (req.method !== 'POST' && req.method !== 'PUT') {
        return next();
    }

    // Specifically target action create/log endpoints
    // Adjust path checks based on actual routes. Assuming /actions or /schedule/instances/:id/log
    const isActionRequest = req.originalUrl.includes('/api/actions') || req.originalUrl.includes('/api/schedule/instances');
    if (!isActionRequest) {
        return next();
    }

    // Assuming auth middleware has populated req.user or we extract userId from body/params
    // Note: In a real app, use req.user.id from auth token. 
    // Here we might need to look for `userId` in body or params if not attached to req yet.
    // For MVP, we'll try to find userId in body.
    const userId = req.body.user_id || req.body.userId;

    if (!userId) {
        // If we can't identify user, we can't enforce policy. 
        // Allow proceeding or block depending on security posture. 
        // For now, allow (auth middleware should handle identity).
        return next();
    }

    try {
        // 1. Fetch User's Role & Policy
        const user = await prisma.user.findUnique({
            where: { user_id: userId },
            include: {
                role: {
                    include: { policy: true }
                }
            }
        });

        if (!user || !user.role || !user.role.policy) {
            // No policy assigned, proceed
            return next();
        }

        const policy = user.role.policy;
        const now = new Date();

        // 2. Check Exceptions
        const activeException = await prisma.disciplineException.findFirst({
            where: {
                user_id: userId,
                approved_by: { not: null },
                OR: [
                    { valid_until: null },
                    { valid_until: { gte: now } }
                ]
            }
        });

        if (activeException) {
            console.log(`[POLICY] Exception active for user ${userId}. Skipping enforcement.`);
            return next();
        }

        // 3. Evaluate Policy Rules
        // Example Rule JSON: { "max_misses_per_week": 3, "required_score": 50 }
        let rules: any = {};
        try {
            rules = JSON.parse(policy.rules);
        } catch (e) {
            console.error('Failed to parse policy rules', e);
        }

        // Check: lockout_if_score_below
        if (rules.lockout_if_score_below) {
            if (user.current_discipline_score < rules.lockout_if_score_below) {
                if (policy.enforcement_mode === 'HARD') {
                    return res.status(403).json({
                        error: 'Policy Violation: Discipline score too low for this action.',
                        policy: policy.name
                    });
                } else {
                    console.warn(`[POLICY_SOFT] User ${userId} score below threshold ${rules.lockout_if_score_below}`);
                    // Add warning header
                    res.setHeader('X-Policy-Warning', `Score below ${rules.lockout_if_score_below}`);
                }
            }
        }

        next();
    } catch (error) {
        console.error('Policy enforcement error:', error);
        next(); // Fail open to avoid blocking ops on system error, or fail closed? -> Fail open for MVP.
    }
};
