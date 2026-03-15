
import { z } from 'zod';

export const CreateOrgSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name required").max(100, "Name too long"),
        slug: z.string().min(1, "Slug required").regex(/^[a-z0-9-]+$/, "Slug must be alphanumeric/hyphens")
    })
});

export const AddOrgUserSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        role: z.enum(['ADMIN', 'ORG_ADMIN', 'USER']).optional()
    }),
    params: z.object({
        orgId: z.string().uuid("Invalid organization ID format")
    })
});

export const GetOrgSchema = z.object({
    params: z.object({
        slug: z.string().min(1, "Slug required")
    })
});
