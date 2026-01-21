import { Injectable, OnModuleInit } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit {
    private redis: Redis | null = null;

    onModuleInit() {
        const url = process.env.UPSTASH_REDIS_REST_URL;
        const token = process.env.UPSTASH_REDIS_REST_TOKEN;

        if (!url || !token) {
            console.warn('Upstash Redis credentials not configured. Caching/locking features will use fallback.');
            return;
        }

        this.redis = new Redis({ url, token });
        console.log('✅ Upstash Redis client initialized');
    }

    isConfigured(): boolean {
        return !!this.redis;
    }

    // ============================================
    // LOCKING (for inventory holds)
    // ============================================

    /**
     * Acquire a lock on an inventory item during hold creation
     * Prevents race conditions when multiple users try to book same item
     */
    async acquireItemLock(itemId: string, userId: string, ttlSeconds = 30): Promise<boolean> {
        if (!this.redis) return true; // Allow if Redis not configured

        const lockKey = `lock:item:${itemId}`;
        const result = await this.redis.set(lockKey, userId, {
            nx: true, // Only set if not exists
            ex: ttlSeconds,
        });
        return result === 'OK';
    }

    /**
     * Release lock after hold creation completes
     */
    async releaseItemLock(itemId: string, userId: string): Promise<void> {
        if (!this.redis) return;

        const lockKey = `lock:item:${itemId}`;
        const currentHolder = await this.redis.get(lockKey);
        if (currentHolder === userId) {
            await this.redis.del(lockKey);
        }
    }

    /**
     * Acquire hold lock for specific dates (for booking service)
     * Locks all dates to prevent double-booking
     */
    async acquireHoldLock(
        itemId: string,
        dates: string[],
        userId: string,
        ttlSeconds: number,
    ): Promise<boolean> {
        if (!this.redis) return true; // Allow if Redis not configured

        // Try to lock all dates
        for (const date of dates) {
            const lockKey = `hold:${itemId}:${date}`;
            const result = await this.redis.set(lockKey, userId, {
                nx: true,
                ex: ttlSeconds,
            });
            if (result !== 'OK') {
                // Failed to acquire - release any locks we got
                await this.releaseHoldLock(itemId, dates.slice(0, dates.indexOf(date)));
                return false;
            }
        }
        return true;
    }

    /**
     * Release hold lock for specific dates
     */
    async releaseHoldLock(itemId: string, dates: string[]): Promise<void> {
        if (!this.redis) return;

        for (const date of dates) {
            const lockKey = `hold:${itemId}:${date}`;
            await this.redis.del(lockKey);
        }
    }

    // ============================================
    // HOLD TTL TRACKING
    // ============================================

    /**
     * Set a TTL key for tracking hold expiry
     */
    async setHoldExpiry(bookingId: string, expiresAt: Date): Promise<void> {
        if (!this.redis) return;

        const ttl = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
        await this.redis.set(`hold:${bookingId}`, 'active', { ex: ttl });
    }

    /**
     * Check if a hold is still active (not expired)
     */
    async isHoldActive(bookingId: string): Promise<boolean> {
        if (!this.redis) return true; // Assume active if Redis not configured

        const result = await this.redis.get(`hold:${bookingId}`);
        return result === 'active';
    }

    /**
     * Manually expire a hold (on cancellation)
     */
    async expireHold(bookingId: string): Promise<void> {
        if (!this.redis) return;
        await this.redis.del(`hold:${bookingId}`);
    }

    // ============================================
    // RATE LIMITING
    // ============================================

    /**
     * Check and increment rate limit counter
     * Returns true if under limit, false if exceeded
     */
    async checkRateLimit(
        key: string,
        maxRequests: number,
        windowSeconds: number,
    ): Promise<boolean> {
        if (!this.redis) return true; // Allow if Redis not configured

        const fullKey = `ratelimit:${key}`;
        const current = await this.redis.incr(fullKey);

        if (current === 1) {
            await this.redis.expire(fullKey, windowSeconds);
        }

        return current <= maxRequests;
    }

    // ============================================
    // CACHING
    // ============================================

    async get<T>(key: string): Promise<T | null> {
        if (!this.redis) return null;
        return await this.redis.get(key) as T | null;
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        if (!this.redis) return;

        if (ttlSeconds) {
            await this.redis.set(key, value, { ex: ttlSeconds });
        } else {
            await this.redis.set(key, value);
        }
    }

    async del(key: string): Promise<void> {
        if (!this.redis) return;
        await this.redis.del(key);
    }
}
