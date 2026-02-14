"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateResource = void 0;
const zod_1 = require("zod");
const AppError_1 = require("../utils/AppError");
const validateResource = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    }
    catch (e) {
        if (e instanceof zod_1.ZodError) {
            // Map Zod errors to a readable format
            const message = e.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
            next(new AppError_1.BadRequestError(message));
        }
        else {
            next(e);
        }
    }
};
exports.validateResource = validateResource;
