import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import stripeRoutes from './modules/billing/stripe.routes';
import userRoutes from './modules/user/user.routes';
import adminRoutes from './routes/v1/adminRoutes';
import teamRoutes from './modules/team/team.routes';
import goalRoutes from './modules/goals/goal.routes';
import actionRoutes from './modules/actions/action.routes';
import outcomeRoutes from './modules/outcomes/outcome.routes';
import policyRoutes from './modules/policies/policy.routes';
import trajectoryRoutes from './modules/trajectory/trajectory.routes';
import disciplineRoutes from './modules/discipline/discipline.routes';
import subscriptionRoutes from './modules/subscription/subscription.routes';
import complianceRoutes from './modules/compliance/compliance.routes';
import ssoRoutes from './modules/auth/sso.routes';
import auditRoutes from './modules/audit/audit.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import securityRoutes from './modules/security/security.routes';
import organizationRoutes from './modules/organization/organization.routes';
import integrationRoutes from './modules/integration/integration.routes';
import opsRoutes from './modules/ops/ops.routes';

import { apiLimiter, authLimiter } from './middleware/rateLimitMiddleware';
import { policyEnforcementMiddleware } from './middleware/policyEnforcementMiddleware';
import { ipWhitelistMiddleware } from './middleware/ipWhitelistMiddleware';
import { apiKeyMiddleware } from './middleware/apiKeyMiddleware';
import { versionMiddleware } from './middleware/versionMiddleware';
import { initializeWebhookListeners } from './modules/integration/webhook.listener';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Initialize domain event listeners for webhooks
initializeWebhookListeners();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Middleware
app.use(ipWhitelistMiddleware);
app.use(apiKeyMiddleware);
app.use(versionMiddleware);

// API V1 Router
const v1Router = express.Router();

v1Router.use('/auth', authLimiter, authRoutes);
v1Router.use(apiLimiter); // Apply global API limiter to subsequent routes

v1Router.use('/user', userRoutes);
v1Router.use('/admin', adminRoutes);
v1Router.use('/team', teamRoutes);
v1Router.use('/goals', goalRoutes);

// Apply policy enforcement to actions
v1Router.use('/actions', policyEnforcementMiddleware, actionRoutes);

v1Router.use('/outcomes', outcomeRoutes);
v1Router.use('/policies', policyRoutes);
v1Router.use('/trajectory', trajectoryRoutes);
v1Router.use('/discipline', disciplineRoutes);

// Mount V1 Router
v1Router.use('/subscription', subscriptionRoutes);
v1Router.use('/compliance', complianceRoutes);
v1Router.use('/sso', ssoRoutes); // /api/v1/sso
v1Router.use('/audit', auditRoutes); // /api/v1/audit
v1Router.use('/analytics', analyticsRoutes); // /api/v1/analytics
v1Router.use('/security', securityRoutes); // /api/v1/security
v1Router.use('/organizations', organizationRoutes); // /api/v1/organizations
v1Router.use('/integration', integrationRoutes); // /api/v1/integration
v1Router.use('/ops', opsRoutes); // /api/v1/ops

app.use('/api/v1', v1Router);

// Stripe routes (can be outside v1Router if they have a different base path or specific middleware needs)
app.use('/api/v1/billing', stripeRoutes);

app.use(errorHandler);

export default app;
