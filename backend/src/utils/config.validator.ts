import { Logger } from './logger';

export class ConfigError extends Error {
    constructor(public missingVars: string[]) {
        super(`Missing required environment variables: ${missingVars.join(', ')}`);
        this.name = 'ConfigError';
    }
}

export const validateConfig = () => {
    const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];

    // In production, we might want more strict checks
    if (process.env.NODE_ENV === 'production') {
        requiredEnvVars.push('FRONTEND_URL', 'API_URL');
    }

    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missingEnvVars.length > 0) {
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'ci') {
            Logger.warn(`[Config] Missing environment variables in ${process.env.NODE_ENV} mode: ${missingEnvVars.join(', ')}`);
            return;
        }

        throw new ConfigError(missingEnvVars);
    }

    Logger.info(`[Config] Configuration validated for ${process.env.NODE_ENV || 'development'} mode.`);
};
