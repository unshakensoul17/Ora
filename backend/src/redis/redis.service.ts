import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
    private redis: Redis | null = null;

    async onModuleInit() {
        // Try TCP URL first (most reliable on Render)
        const redisUrl = process.env.REDIS_URL?.trim();

        if (redisUrl) {
            try {
                console.log('🌐 Connecting to Redis via TCP (ioredis)...');
                this.redis = new Redis(redisUrl, {
                    maxRetriesPerRequest: 3,
                    connectTimeout: 10000,
                    // Upstash requires TLS for rediss://
                    tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
                });

                this.redis.on('error', (err) => {
                    console.error('❌ Redis TCP Error:', err.message);
                });

                this.redis.on('connect', () => {
                    console.log('✅ Redis TCP connected');
                });

                await this.redis.ping();
            } catch (error) {
                console.error('❌ Redis TCP Initialization failed:', error.message);
            }
            return;
        }

        console.warn('⚠️ REDIS_URL not found. Caching/locking features will be disabled.');
    }

    isConfigured(): boolean {
        return !!this.redis && this.redis.status === 'ready';
    }

    // ============================================
    // LOCKING (for inventory holds)
    // ============================================

    async acquireItemLock(itemId: string, userId: string, ttlSeconds = 30): Promise<boolean> {
        if (!this.redis) return true;

        try {
            const lockKey = `lock:item:${itemId}`;
            const result = await this.redis.set(lockKey, userId, 'EX', ttlSeconds, 'NX');
            return result === 'OK';
        } catch (error) {
            console.error(`❌ Redis acquireItemLock failed [${itemId}]:`, error.message);
            return true;
        }
    }

    async releaseItemLock(itemId: string, userId: string): Promise<void> {
        if (!this.redis) return;

        try {
            const lockKey = `lock:item:${itemId}`;
            const currentHolder = await this.redis.get(lockKey);
            if (currentHolder === userId) {
                await this.redis.del(lockKey);
            }
        } catch (error) {
            console.error(`❌ Redis releaseItemLock failed [${itemId}]:`, error.message);
        }
    }

    async acquireHoldLock(
        itemId: string,
        dates: string[],
        userId: string,
        ttlSeconds: number,
    ): Promise<boolean> {
        if (!this.redis) return true;

        try {
            for (const date of dates) {
                const lockKey = `hold:${itemId}:${date}`;
                const result = await this.redis.set(lockKey, userId, 'EX', ttlSeconds, 'NX');
                if (result !== 'OK') {
                    await this.releaseHoldLock(itemId, dates.slice(0, dates.indexOf(date)));
                    return false;
                }
            }
            return true;
        } catch (error) {
            console.error(`❌ Redis acquireHoldLock failed [${itemId}]:`, error.message);
            return true;
        }
    }

    async releaseHoldLock(itemId: string, dates: string[]): Promise<void> {
        if (!this.redis) return;

        try {
            for (const date of dates) {
                const lockKey = `hold:${itemId}:${date}`;
                await this.redis.del(lockKey);
            }
        } catch (error) {
            console.error(`❌ Redis releaseHoldLock failed [${itemId}]:`, error.message);
        }
    }

    // ============================================
    // HOLD TTL TRACKING
    // ============================================

    async setHoldExpiry(bookingId: string, expiresAt: Date): Promise<void> {
        if (!this.redis) return;

        try {
            const ttl = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
            await this.redis.set(`hold:${bookingId}`, 'active', 'EX', ttl);
        } catch (error) {
            console.error(`❌ Redis setHoldExpiry failed [${bookingId}]:`, error.message);
        }
    }

    async isHoldActive(bookingId: string): Promise<boolean> {
        if (!this.redis) return true;

        try {
            const result = await this.redis.get(`hold:${bookingId}`);
            return result === 'active';
        } catch (error) {
            console.error(`❌ Redis isHoldActive failed [${bookingId}]:`, error.message);
            return true;
        }
    }

    async expireHold(bookingId: string): Promise<void> {
        if (!this.redis) return;
        try {
            await this.redis.del(`hold:${bookingId}`);
        } catch (error) {
            console.error(`❌ Redis expireHold failed [${bookingId}]:`, error.message);
        }
    }

    // ============================================
    // RATE LIMITING
    // ============================================

    async checkRateLimit(
        key: string,
        maxRequests: number,
        windowSeconds: number,
    ): Promise<boolean> {
        if (!this.redis) return true;

        try {
            const fullKey = `ratelimit:${key}`;
            const current = await this.redis.incr(fullKey);

            if (current === 1) {
                await this.redis.expire(fullKey, windowSeconds);
            }

            return current <= maxRequests;
        } catch (error) {
            console.error(`❌ Redis rate limit check failed [${key}]:`, error.message);
            return true;
        }
    }

    // ============================================
    // CACHING
    // ============================================

    async get<T>(key: string): Promise<T | null> {
        if (!this.redis) return null;
        try {
            const data = await this.redis.get(key);
            if (!data) return null;
            try {
                return JSON.parse(data) as T;
            } catch {
                return data as unknown as T;
            }
        } catch (error) {
            console.error(`❌ Redis GET failed [${key}]:`, error.message);
            return null;
        }
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        if (!this.redis) return;

        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
            if (ttlSeconds) {
                await this.redis.set(key, stringValue, 'EX', ttlSeconds);
            } else {
                await this.redis.set(key, stringValue);
            }
        } catch (error) {
            console.error(`❌ Redis SET failed [${key}]:`, error.message);
        }
    }

    async del(key: string): Promise<void> {
        if (!this.redis) return;
        try {
            await this.redis.del(key);
        } catch (error) {
            console.error(`❌ Redis DEL failed [${key}]:`, error.message);
        }
    }
}
