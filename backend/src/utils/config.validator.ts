import { z } from 'zod';
import { Logger } from '../core/logger';

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
    PORT: z.coerce.number().min(1000).max(65535).default(3000),
    FRONTEND_URL: z.string().url().optional(),
    API_URL: z.string().url().optional(),
    REDIS_URL: z.string().optional(),
    STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
});

export type AppConfig = z.infer<typeof envSchema>;

let _config: AppConfig | null = null;

export const validateConfig = (): AppConfig => {
    const result = envSchema.safeParse(process.env);

    if (!result.success) {
        const isTest = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'ci';

        if (isTest) {
            Logger.warn('[Config] Validation warnings in test mode:');
            result.error.errors.forEach(err => {
                Logger.warn(`  - ${err.path.join('.')}: ${err.message}`);
            });
            return process.env as unknown as AppConfig;
        }

        Logger.error('[Config] ❌ Environment configuration is invalid:');
        result.error.errors.forEach(err => {
            Logger.error(`  - ${err.path.join('.')}: ${err.message}`);
        });
        process.exit(1);
    }

    Logger.info(`[Config] ✅ Configuration validated for ${result.data.NODE_ENV} mode.`);
    _config = result.data;
    return result.data;
};

export const getConfig = (): AppConfig => {
    if (!_config) throw new Error('Config not initialized. Call validateConfig() first.');
    return _config;
};
