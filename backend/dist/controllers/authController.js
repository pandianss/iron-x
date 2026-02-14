"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../utils/auth");
const register = async (req, res) => {
    const { email, password, timezone } = req.body;
    try {
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
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
        try {
            const { PolicyService } = await Promise.resolve().then(() => __importStar(require('../services/policyService')));
            await PolicyService.assignDefaultRole(user.user_id);
        }
        catch (e) {
            console.error('Failed to assign default role:', e);
            // Don't fail registration, but log critical error
        }
        const token = (0, auth_1.generateToken)(user.user_id);
        res.status(201).json({ token, user: { id: user.user_id, email: user.email } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db_1.default.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = await (0, auth_1.comparePassword)(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = (0, auth_1.generateToken)(user.user_id);
        res.json({ token, user: { id: user.user_id, email: user.email } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.login = login;
