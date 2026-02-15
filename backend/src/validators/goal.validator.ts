
import { z } from 'zod';

export const CreateGoalSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title required").max(200, "Title too long"),
        description: z.string().max(1000).optional(),
        deadline: z.string().datetime().optional()
    })
});
