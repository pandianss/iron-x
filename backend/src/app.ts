import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { container } from 'tsyringe';
import prisma from './db';
import authRoutes from './modules/auth/auth.routes';
import stripeRoutes from './modules/billing/stripe.routes';
import userRoutes from './modules/user/user.routes';
import adminRoutes from './routes/v1/adminRoutes';
import teamRoutes from './modules/team/team.routes';
import goalRoutes from './modules/goals/goal.routes';
import actionRoutes from './modules/actions/action.routes';
import outcomeRoutes from './modules/outcomes/outcome.routes';
import policyRoutes from './modules/policies/policy.routes';

import disciplineRoutes from './modules/discipline/discipline.routes';
import subscriptionRoutes from './modules/subscription/subscription.routes';

import ssoRoutes from './modules/auth/sso.routes';
import auditRoutes from './modules/audit/audit.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
// import securityRoutes from './modules/security/security.routes';
import organizationRoutes from './modules/organization/organization.routes';
// import integrationRoutes from './modules/integration/integration.routes';
// import opsRoutes from './modules/ops/ops.routes';

import { apiLimiter, authLimiter } from './middleware/rateLimitMiddleware';
import { policyEnforcementMiddleware } from './middleware/policyEnforcementMiddleware';
import { ipWhitelistMiddleware } from './middleware/ipWhitelistMiddleware';
import { apiKeyMiddleware } from './middleware/apiKeyMiddleware';
import { versionMiddleware } from './middleware/versionMiddleware';
// import { initializeWebhookListeners } from './modules/integration/webhook.listener';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './infrastructure/swagger';

dotenv.config();

// Register PrismaClient in the container
container.registerInstance('PrismaClient', prisma);

const app = express();

import { DisciplineSubscriber } from './modules/discipline/discipline.subscriber';

// Initialize domain event listeners for webhooks
// initializeWebhookListeners();

// Initialize internal subscribers
DisciplineSubscriber.initialize();

app.set('trust proxy', 1);

// Security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", process.env.API_URL || ""],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    },
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    dnsPrefetchControl: true,
    frameguard: { action: 'deny' },
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    ieNoOpen: true,
    noSniff: true,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xssFilter: true
}));

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            'http://localhost:5173',
            'http://localhost:3000'
        ].filter(Boolean);

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
    maxAge: 600
};

app.use(cors(corsOptions));

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
// v1Router.use('/trajectory', trajectoryRoutes);
v1Router.use('/discipline', disciplineRoutes);

// Mount V1 Router
v1Router.use('/subscription', subscriptionRoutes);
// v1Router.use('/compliance', complianceRoutes);
v1Router.use('/sso', ssoRoutes); // /api/v1/sso
v1Router.use('/audit', auditRoutes); // /api/v1/audit
v1Router.use('/analytics', analyticsRoutes); // /api/v1/analytics
// v1Router.use('/security', securityRoutes); // /api/v1/security
v1Router.use('/organizations', organizationRoutes); // /api/v1/organizations
// v1Router.use('/integration', integrationRoutes); // /api/v1/integration
// v1Router.use('/ops', opsRoutes); // /api/v1/ops

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1', v1Router);

// Stripe routes (can be outside v1Router if they have a different base path or specific middleware needs)
app.use('/api/v1/billing', stripeRoutes);

// Create HTTP server
import { createServer } from 'http';
import { SocketService } from './services/socket.service';

const httpServer = createServer(app);

// Initialize Socket Service
SocketService.getInstance().initialize(httpServer);

app.use(errorHandler);

export { app, httpServer };
