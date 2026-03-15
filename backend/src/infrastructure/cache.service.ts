import { singleton, inject } from 'tsyringe';
import { redisConnection } from './queue';
import { Logger } from '../core/logger';
import { MetricsService } from '../core/metrics.service';

interface CacheOptions {
    ttlSeconds?: number;
}

@singleton()
export class CacheService {
    private l1Cache: Map<string, { data: any, expires: number }> = new Map();
    private readonly DEFAULT_TTL = 300; // 5 minutes

    constructor(
        @inject(MetricsService) private metrics: MetricsService
    ) { }

    async get<T>(key: string): Promise<T | null> {
        // 1. Check L1
        const cached = this.l1Cache.get(key);
        if (cached && cached.expires > Date.now()) {
            this.metrics.recordCacheOp('L1', 'HIT');
            return cached.data as T;
        } else if (cached) {
            this.l1Cache.delete(key);
        }

        // 2. Check L2 (Redis)
        try {
            const redisData = await redisConnection.get(key);
            if (redisData) {
                const data = JSON.parse(redisData);
                // Backfill L1
                this.l1Cache.set(key, { data, expires: Date.now() + 60000 }); // 1m for L1 backfill
                this.metrics.recordCacheOp('L2', 'HIT');
                return data as T;
            }
        } catch (err) {
            Logger.error(`[Cache] Redis error: ${err}`);
        }

        this.metrics.recordCacheOp('TOTAL', 'MISS');
        return null;
    }

    async set(key: string, data: any, options: CacheOptions = {}): Promise<void> {
        const ttl = options.ttlSeconds || this.DEFAULT_TTL;
        
        // Update L1
        this.l1Cache.set(key, { 
            data, 
            expires: Date.now() + (Math.min(ttl, 60) * 1000) // L1 max 1m for safety
        });

        // Update L2
        try {
            await redisConnection.set(key, JSON.stringify(data), 'EX', ttl);
        } catch (err) {
            Logger.error(`[Cache] Redis set error: ${err}`);
        }
    }

    async invalidate(key: string): Promise<void> {
        this.l1Cache.delete(key);
        try {
            await redisConnection.del(key);
        } catch (err) {
            Logger.error(`[Cache] Redis del error: ${err}`);
        }
    }
}
