import 'reflect-metadata';
import dotenv from 'dotenv';

// Load environment variables immediately
dotenv.config();

const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error(`FATAL: Missing required environment variables: ${missingEnvVars.join(', ')}`);
    process.exit(1);
}

import { app, httpServer } from './app';
import { startCronJobs } from './cron';
import { registerObservers } from './bootstrap/registerObservers';
import { Logger } from './utils/logger';

const port = process.env.PORT || 3000;

httpServer.listen(port, () => {
    Logger.info(`Server is running on port ${port}`);
    registerObservers();
    startCronJobs();
});

