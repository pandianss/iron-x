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
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("./modules/user/user.routes"));
const adminRoutes_1 = __importDefault(require("./routes/v1/adminRoutes"));
const team_routes_1 = __importDefault(require("./modules/team/team.routes"));
const goal_routes_1 = __importDefault(require("./modules/goals/goal.routes"));
const action_routes_1 = __importDefault(require("./modules/actions/action.routes"));
const outcome_routes_1 = __importDefault(require("./modules/outcomes/outcome.routes"));
const policy_routes_1 = __importDefault(require("./modules/policies/policy.routes"));
const trajectory_routes_1 = __importDefault(require("./modules/trajectory/trajectory.routes"));
const discipline_routes_1 = __importDefault(require("./modules/discipline/discipline.routes"));
const rateLimitMiddleware_1 = require("./middleware/rateLimitMiddleware");
const policyEnforcementMiddleware_1 = require("./middleware/policyEnforcementMiddleware");
const versionMiddleware_1 = require("./middleware/versionMiddleware");
const errorHandler_1 = require("./middleware/errorHandler");
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
// Global Middleware
app.use(versionMiddleware_1.versionMiddleware);
// API V1 Router
const v1Router = express_1.default.Router();
v1Router.use('/auth', rateLimitMiddleware_1.authLimiter, auth_routes_1.default);
v1Router.use(rateLimitMiddleware_1.apiLimiter); // Apply global API limiter to subsequent routes
v1Router.use('/user', user_routes_1.default);
v1Router.use('/admin', adminRoutes_1.default);
v1Router.use('/team', team_routes_1.default);
v1Router.use('/goals', goal_routes_1.default);
// Apply policy enforcement to actions
v1Router.use('/actions', policyEnforcementMiddleware_1.policyEnforcementMiddleware, action_routes_1.default);
v1Router.use('/outcomes', outcome_routes_1.default);
v1Router.use('/policies', policy_routes_1.default);
v1Router.use('/trajectory', trajectory_routes_1.default);
v1Router.use('/discipline', discipline_routes_1.default);
// Mount V1 Router
app.use('/api/v1', v1Router);
app.use(errorHandler_1.errorHandler);
exports.default = app;
