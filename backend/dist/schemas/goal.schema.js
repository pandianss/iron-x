"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGoalSchema = void 0;
const zod_1 = require("zod");
exports.createGoalSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string({
            message: 'Title is required'
        }).min(1, 'Title cannot be empty'),
        description: zod_1.z.string().optional(),
        deadline: zod_1.z.string().datetime().optional().or(zod_1.z.literal(''))
    })
});
