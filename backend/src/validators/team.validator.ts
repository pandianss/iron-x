
import { z } from 'zod';

export const CreateTeamSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name required").max(100, "Name too long"),
        description: z.string().max(500).optional()
    })
});

export const InviteMemberSchema = z.object({
    params: z.object({
        teamId: z.string().uuid("Invalid team ID format")
    }),
    body: z.object({
        email: z.string().email("Invalid email format"),
        role: z.enum(['ADMIN', 'MEMBER', 'OBSERVER'])
    })
});
