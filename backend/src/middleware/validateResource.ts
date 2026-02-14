import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/AppError';

export const validateResource = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e: any) {
        if (e instanceof ZodError) {
            // Map Zod errors to a readable format
            const message = e.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join(', ');
            next(new BadRequestError(message));
        } else {
            next(e);
        }
    }
};
