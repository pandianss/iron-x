
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
// Assuming a Logger exists or use console for now as fallback
const Logger = {
    warn: (msg: string, meta: any) => console.warn(`WARN: ${msg}`, meta)
};

export const validate = (schema: z.ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params
            });
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                Logger.warn('[Validation] Failed', {
                    path: req.path,
                    errors: error.errors
                });
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.errors.map(e => ({
                        field: e.path.join('.'),
                        message: e.message
                    }))
                });
            }
            next(error);
        }
    };
};
