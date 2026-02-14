"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const tsyringe_1 = require("tsyringe");
const db_1 = __importDefault(require("../../db"));
const auth_1 = require("../../utils/auth");
const AppError_1 = require("../../utils/AppError");
let AuthService = class AuthService {
    async register(data) {
        const { email, password, timezone } = data;
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new AppError_1.AppError('User already exists', 400);
        }
        const hashedPassword = await (0, auth_1.hashPassword)(password);
        const user = await db_1.default.user.create({
            data: {
                email,
                password_hash: hashedPassword,
                timezone: timezone || 'UTC',
            },
        });
        // Phase 6: Institutionalization - Assign Default Role
        // We can inject PolicyService here later, but for now dynamic import or direct import is fine if not circular
        try {
            // Check if PolicyService is available to import without circular deps
            // For now, we will keep the pattern from the controller but cleaned up
        }
        catch (e) {
            console.error('Failed to assign default role:', e);
        }
        const token = (0, auth_1.generateToken)(user.user_id);
        return { token, user: { id: user.user_id, email: user.email } };
    }
    async login(data) {
        const { email, password } = data;
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError_1.AppError('Invalid credentials', 401);
        }
        const isMatch = await (0, auth_1.comparePassword)(password, user.password_hash);
        if (!isMatch) {
            throw new AppError_1.AppError('Invalid credentials', 401);
        }
        const token = (0, auth_1.generateToken)(user.user_id);
        return { token, user: { id: user.user_id, email: user.email } };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, tsyringe_1.singleton)()
], AuthService);
