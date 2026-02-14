"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionMiddleware = void 0;
const versionMiddleware = (req, res, next) => {
    res.setHeader('X-API-Version', '1.0');
    // We can also attach the version to the request object if needed for logging/analytics
    req.apiVersion = '1.0';
    next();
};
exports.versionMiddleware = versionMiddleware;
