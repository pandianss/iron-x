import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { Logger } from '../utils/logger';
import { Prisma } from '@prisma/client';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        if (err.statusCode >= 500) {
            Logger.error(`[AppError] ${err.message}`, { error: err });
        } else {
            Logger.warn(`[AppError] ${err.message}`);
        }

        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    // Prisma Error Handling
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(400).json({
                status: 'error',
                message: `Duplicate field value: ${err.meta?.target}`
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                status: 'error',
                message: 'Record not found'
            });
        }
    }

    // Unexpected errors
    Logger.error('[Unhandled Error] ', { error: err });
    res.status(500).json({
        status: 'error',
        message: 'Internal Server Error'
    });
};
