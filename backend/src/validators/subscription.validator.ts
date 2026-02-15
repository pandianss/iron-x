
import { z } from 'zod';

export const AssignTierSchema = z.object({
    body: z.object({
        userId: z.string().uuid("Invalid user ID format"),
        tier: z.enum(['FREE', 'PRO', 'ENTERPRISE'])
    })
});
