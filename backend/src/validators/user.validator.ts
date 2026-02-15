
import { z } from 'zod';

export const UserParamSchema = z.object({
    params: z.object({
        userId: z.string().uuid("Invalid user ID format")
    })
});

export const UpdateProfileSchema = z.object({
    body: z.object({
        timezone: z.string().optional(),
        enforcement_mode: z.enum(['NONE', 'SOFT', 'HARD', 'STRICT']).optional()
    })
});
