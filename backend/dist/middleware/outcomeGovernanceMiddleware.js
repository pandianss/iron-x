"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.outcomeGovernanceMiddleware = void 0;
const outcomeGovernanceMiddleware = (req, res, next) => {
    // 1. Log Access
    console.log(`[GOVERNANCE] Outcome Data Access: ${req.method} ${req.originalUrl} by ${req.ip}`);
    // 2. Add Disclaimer Header for Safeguards
    res.setHeader('X-Outcome-Disclaimer', 'Outcome data is for operational improvement only. Not for punitive HR use.');
    // 3. (Optional) RBAC checks could go here, but assumed handled by auth middleware
    next();
};
exports.outcomeGovernanceMiddleware = outcomeGovernanceMiddleware;
