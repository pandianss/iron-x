import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { Logger } from '../utils/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        if (err.statusCode >= 500) {
            Logger.error(`[AppError] ${err.message}`, { error: err });
        } else {
            Logger.warn(`[AppError] ${err.message}`);
        }

        return res.status(err.statusCode).json({
            status: 'error',
            error: err.message
        });
    }

    // Unexpected errors
    Logger.error('[Unhandled Error] ', { error: err });
    res.status(500).json({
        status: 'error',
        error: 'Internal Server Error'
    });
};
