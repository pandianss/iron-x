import prisma from '../db';

/**
 * Service for creating immutable audit logs.
 * Covers: Status changes, Enforcement actions, Lockouts, Manager interventions.
 */
export const AuditService = {
    /**
     * Log an event to the audit trail.
     * @param actorId - The user ID performing the action (System, User, or Manager). Use 'SYSTEM' for automated jobs if possible, but schema expects User relation. If system, maybe use a reserved ID or null if allowed, but schema has relation.
     * NOTE: Schema has `actor_id` as optional String? and relation. If we want "SYSTEM" string, we might need no relation or a specific system user.
     * For now, if actorId is not a UUID of a user, we should probably leave it null and put "SYSTEM" in details or create a System User. 
     * Let's assume for now automate jobs might not have a user ID. 
     * Update: Schema `actor` is `User?`. So if it's system, we leave actor_id null and specify in details or action.
     */
    logEvent: async (
        action: string,
        details: object | string,
        targetUserId?: string,
        actorId?: string
    ) => {
        try {
            const detailsStr = typeof details === 'string' ? details : JSON.stringify(details);

            await prisma.auditLog.create({
                data: {
                    action,
                    details: detailsStr,
                    target_user_id: targetUserId,
                    actor_id: actorId, // Nullable
                },
            });
            // console.log(`[AUDIT] ${action} - Target: ${targetUserId} - Actor: ${actorId}`);
        } catch (error) {
            console.error('Failed to create audit log', error);
            // Fail silent? or rethrow? For audit, maybe we should alert.
        }
    },
};
