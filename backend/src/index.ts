import 'reflect-metadata';
import dotenv from 'dotenv';
import { validateConfig, ConfigError } from './utils/config.validator';
import { Logger } from './utils/logger';
import prisma from './db';

// Load environment variables immediately
dotenv.config();

try {
    validateConfig();
} catch (error) {
    if (error instanceof ConfigError) {
        console.error(`FATAL: ${error.message}`);
        process.exit(1);
    }
    throw error;
}

import { app, httpServer } from './app';
import { startCronJobs } from './cron';
import { registerObservers } from './bootstrap/registerObservers';

const port = process.env.PORT || 3000;

const server = httpServer.listen(port, () => {
    Logger.info(`Server is running on port ${port}`);
    registerObservers();
    startCronJobs();
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
    Logger.info(`[Shutdown] ${signal} received. Closing resources...`);

    server.close(async () => {
        Logger.info('[Shutdown] HTTP server closed.');

        try {
            await prisma.$disconnect();
            Logger.info('[Shutdown] Prisma disconnected.');
            process.exit(0);
        } catch (error) {
            Logger.error('[Shutdown] Error during disconnect:', error);
            process.exit(1);
        }
    });

    // Force shutdown after 10s
    setTimeout(() => {
        Logger.error('[Shutdown] Forced shutdown due to timeout.');
        process.exit(1);
    }, 10000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

