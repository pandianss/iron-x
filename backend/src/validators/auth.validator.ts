
import { z } from 'zod';

export const LoginSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(8, "Password must be at least 8 characters")
    })
});

export const RegisterSchema = z.object({
    body: z.object({
        email: z.string().email("Invalid email format"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        timezone: z.string().optional()
    })
});

export const VerifyMFASchema = z.object({
    body: z.object({
        token: z.string().length(6, "MFA token must be 6 digits")
    })
});
