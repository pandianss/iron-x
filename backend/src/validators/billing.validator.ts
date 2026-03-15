
import { z } from 'zod';

export const RazorpaySubscribeSchema = z.object({
    body: z.object({
        planId: z.string().min(1, "Plan ID is required"),
        successUrl: z.string().url().optional(),
        cancelUrl: z.string().url().optional()
    })
});

export const StripeCheckoutSchema = z.object({
    body: z.object({
        priceId: z.string().min(1, "Price ID is required"),
        successUrl: z.string().url().min(1, "Success URL is required"),
        cancelUrl: z.string().url().min(1, "Cancel URL is required")
    })
});

export const StripePortalSchema = z.object({
    body: z.object({
        returnUrl: z.string().url().min(1, "Return URL is required")
    })
});
