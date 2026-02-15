import { Response, NextFunction } from 'express';
import prisma from '../db';
import { AuthRequest } from './authMiddleware';
import { DisciplinePolicy } from '../kernel/policies/DisciplinePolicy';
import { kernelEvents, DomainEventType } from '../kernel/events/bus';

/**
 * Governance Guard
 * 
 * Enforces kernel policies before any domain controller is reached.
 * 
 * Responsibilities:
 * 1. Verify User State (Active/Suspended)
 * 2. Enforce Lockouts (Hard Discipline Mode)
 * 3. Log Access to Audit Stream
 * 4. Inject Governance Context
 */
export const governanceGuard = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;

        // 1. Identity Assurance (Should be guaranteed by authenticateToken, but defensive check)
        if (!userId) {
            console.warn(`[GOVERNANCE] Blocked unauthenticated request to ${req.originalUrl}`);
            // Note: We can't emit with userId here as it's missing, but we can log context
            kernelEvents.emitEvent(DomainEventType.ACCESS_DENIED, {
                reason: 'No Identity',
                url: req.originalUrl
            }, 'unknown');
            return res.status(401).json({ error: 'Governance check failed: No identity', code: 'GOV_NO_ID' });
        }

        // 2. State Resolution
        // We fetch fresh state to ensure immediate enforcement of lockouts
        const userState = await prisma.user.findUnique({
            where: { user_id: userId },
            select: {
                locked_until: true,
                enforcement_mode: true,
                role: { select: { name: true } }
            }
        });

        if (!userState) {
            return res.status(401).json({ error: 'User entity not found', code: 'GOV_NO_ENTITY' });
        }

        // 3. Lockout Enforcement (Hard Mode)
        // If locked_until is in the future, we reject ALL modification requests
        // Read-only requests (GET) might be allowed depending on strictness, 
        // but for now, we block everything significant or follow strict rules.
        // *Refinement*: Usually we want to allow viewing the dashboard to see WHY they are locked.
        // But preventing *actions* is key.
        // For this phase, we replicate checkLockout logic: Block if locked.

        const isLocked = DisciplinePolicy.isLocked(userState.locked_until);

        if (isLocked) {
            // STRATEGY: Block all mutations (POST/PUT/DELETE) strictly. 
            // Allow GET for situational awareness (Dashboard/Cockpit).

            if (req.method !== 'GET') {
                kernelEvents.emitEvent(DomainEventType.LOCKOUT_ENFORCED, {
                    reason: 'Hard Lockout Active',
                    lockedUntil: userState.locked_until,
                    url: req.originalUrl,
                    method: req.method
                }, userId);

                return res.status(403).json({
                    error: 'OPERATIONAL_LOCKDOWN',
                    message: 'Governance Protocol Active: Your node is currently suspended due to discipline drift.',
                    locked_until: userState.locked_until,
                    code: 'GOV_LOCKOUT'
                });
            } else {
                // Annotate GET requests with the lockdown status
                res.setHeader('X-Iron-Governance-Status', 'RESTRICTED_LOCKED');
                res.setHeader('X-Iron-Locked-Until', userState.locked_until?.toISOString() || '');
            }
        }

        // 4. Audit Logging (Console for now, EventBus in Phase 4)
        console.log(`[GOVERNANCE] ALLOWED ${req.method} ${req.originalUrl} - User ${userId}`);

        // 5. Context Injection
        // We can attach more detailed policy info here later
        (req as any).governance = {
            mode: userState.enforcement_mode,
            isLocked
        };

        next();
    } catch (error) {
        console.error('[GOVERNANCE] Critical Failure', error);
        // Fail closed
        res.status(500).json({ error: 'Governance System Failure', code: 'GOV_SYS_ERR' });
    }
};
