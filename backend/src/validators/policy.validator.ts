
import { z } from 'zod';

export const CreatePolicySchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name required"),
        description: z.string().optional(),
        rules: z.record(z.any()), // JSON rules
        thresholds: z.record(z.number())
    })
});
