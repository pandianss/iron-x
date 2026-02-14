import { z } from 'zod';

export const createGoalSchema = z.object({
    body: z.object({
        title: z.string({
            message: 'Title is required'
        }).min(1, 'Title cannot be empty'),
        description: z.string().optional(),
        deadline: z.string().datetime().optional().or(z.literal(''))
    })
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>['body'];
