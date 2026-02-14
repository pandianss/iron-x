import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import adminRoutes from './routes/v1/adminRoutes';
import teamRoutes from './modules/team/team.routes';
import goalRoutes from './modules/goals/goal.routes';
import actionRoutes from './modules/actions/action.routes';
import outcomeRoutes from './modules/outcomes/outcome.routes';
import policyRoutes from './modules/policies/policy.routes';
import trajectoryRoutes from './modules/trajectory/trajectory.routes';
import disciplineRoutes from './modules/discipline/discipline.routes';

import { apiLimiter, authLimiter } from './middleware/rateLimitMiddleware';
import { policyEnforcementMiddleware } from './middleware/policyEnforcementMiddleware';
import { versionMiddleware } from './middleware/versionMiddleware';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors());
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Global Middleware
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
app.use('/api/v1', v1Router);

app.use(errorHandler);

export default app;
