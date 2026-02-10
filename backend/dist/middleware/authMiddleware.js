"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const auth_1 = require("../utils/auth");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.sendStatus(401);
    }
    try {
        const user = (0, auth_1.verifyToken)(token);
        req.user = user;
        next();
    }
    catch (err) {
        return res.sendStatus(403);
    }
};
exports.authenticateToken = authenticateToken;
