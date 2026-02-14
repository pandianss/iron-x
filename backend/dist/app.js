"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const teamRoutes_1 = __importDefault(require("./routes/teamRoutes"));
const goalRoutes_1 = __importDefault(require("./routes/goalRoutes"));
const actionRoutes_1 = __importDefault(require("./routes/actionRoutes"));
const outcomeRoutes_1 = __importDefault(require("./routes/outcomeRoutes"));
const policyRoutes_1 = __importDefault(require("./routes/policyRoutes"));
const trajectoryRoutes_1 = __importDefault(require("./routes/trajectoryRoutes"));
const disciplineRoutes_1 = __importDefault(require("./routes/disciplineRoutes"));
const rateLimitMiddleware_1 = require("./middleware/rateLimitMiddleware");
const policyEnforcementMiddleware_1 = require("./middleware/policyEnforcementMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.set('trust proxy', 1);
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
if (process.env.NODE_ENV !== 'test') {
    app.use((0, morgan_1.default)('dev'));
}
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/auth', rateLimitMiddleware_1.authLimiter, authRoutes_1.default);
app.use(rateLimitMiddleware_1.apiLimiter); // Apply global API limiter to subsequent routes
app.use('/user', userRoutes_1.default);
app.use('/admin', adminRoutes_1.default);
app.use('/team', teamRoutes_1.default);
app.use('/goals', goalRoutes_1.default);
// Apply policy enforcement to actions
app.use('/actions', policyEnforcementMiddleware_1.policyEnforcementMiddleware, actionRoutes_1.default);
app.use('/outcomes', outcomeRoutes_1.default);
app.use('/policies', policyRoutes_1.default);
app.use('/trajectory', trajectoryRoutes_1.default);
app.use('/discipline', disciplineRoutes_1.default);
app.get('/', (req, res) => {
    res.send('Discipline Enforcement API');
});
exports.default = app;
