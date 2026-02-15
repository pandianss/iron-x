
import { z } from 'zod';

export const CreateActionSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title required").max(200, "Title too long"),
        description: z.string().max(1000).optional(),
        goal_id: z.string().uuid("Invalid goal ID format").optional(),
        window_start_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
        window_duration_minutes: z.number().int().min(5).max(480),
        is_strict: z.boolean().optional()
    })
});

export const GetActionSchema = z.object({
    params: z.object({
        actionId: z.string().uuid("Invalid action ID format")
    })
});
