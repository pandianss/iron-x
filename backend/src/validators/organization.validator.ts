
import { z } from 'zod';

export const CreateOrgSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name required").max(100, "Name too long"),
        slug: z.string().min(1, "Slug required").regex(/^[a-z0-9-]+$/, "Slug must be alphanumeric/hyphens")
    })
});
