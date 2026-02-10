import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import teamRoutes from './routes/teamRoutes';
import goalRoutes from './routes/goalRoutes';
import actionRoutes from './routes/actionRoutes';
import outcomeRoutes from './routes/outcomeRoutes';
import policyRoutes from './routes/policyRoutes';
import experienceRoutes from './routes/experienceRoutes';
import disciplineRoutes from './routes/disciplineRoutes';

import { apiLimiter, authLimiter } from './middleware/rateLimitMiddleware';
import { policyEnforcementMiddleware } from './middleware/policyEnforcementMiddleware';

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

app.use('/auth', authLimiter, authRoutes);
app.use(apiLimiter); // Apply global API limiter to subsequent routes

app.use('/user', userRoutes);
app.use('/admin', adminRoutes);
app.use('/team', teamRoutes);
app.use('/goals', goalRoutes);

// Apply policy enforcement to actions
app.use('/actions', policyEnforcementMiddleware, actionRoutes);

app.use('/outcomes', outcomeRoutes);
app.use('/policies', policyRoutes);
app.use('/experience', experienceRoutes);
app.use('/discipline', disciplineRoutes);


app.get('/', (req, res) => {
    res.send('Discipline Enforcement API');
});

export default app;
