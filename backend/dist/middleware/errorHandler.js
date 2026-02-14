"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const AppError_1 = require("../utils/AppError");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError_1.AppError) {
        if (err.statusCode >= 500) {
            logger_1.Logger.error(`[AppError] ${err.message}`, { error: err });
        }
        else {
            logger_1.Logger.warn(`[AppError] ${err.message}`);
        }
        return res.status(err.statusCode).json({
            status: 'error',
            error: err.message
        });
    }
    // Unexpected errors
    logger_1.Logger.error('[Unhandled Error] ', { error: err });
    res.status(500).json({
        status: 'error',
        error: 'Internal Server Error'
    });
};
exports.errorHandler = errorHandler;
