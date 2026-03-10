import { Injectable, OnModuleInit } from '@nestjs/common';
import { Redis } from '@upstash/redis';

@Injectable()
export class RedisService implements OnModuleInit {
    private redis: Redis | null = null;

    async onModuleInit() {
        const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
        const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

        if (!url || !token) {
            console.warn('⚠️ Upstash Redis credentials not configured. Caching/locking features will use fallback.');
            return;
        }

        try {
            this.redis = new Redis({ url, token });

            // Test connection immediately
            const result = await this.redis.ping();
            if (result) {
                console.log('✅ Upstash Redis connection verified');
            }
        } catch (error) {
            console.error('❌ Upstash Redis initialization failed:', error.message);
            console.error('💡 Hint: Check if Render can reach the Upstash REST URL and if your Token is correct.');
            // We don't null it here, because it might be a transient network issue
        }
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

        try {
            const lockKey = `lock:item:${itemId}`;
            const result = await this.redis.set(lockKey, userId, {
                nx: true, // Only set if not exists
                ex: ttlSeconds,
            });
            return result === 'OK';
        } catch (error) {
            console.error(`❌ Redis acquireItemLock failed [${itemId}]:`, error.message);
            return true; // Don't block if Redis fails
        }
    }

    /**
     * Release lock after hold creation completes
     */
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

        try {
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
        } catch (error) {
            console.error(`❌ Redis acquireHoldLock failed [${itemId}]:`, error.message);
            return true;
        }
    }

    /**
     * Release hold lock for specific dates
     */
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

    /**
     * Set a TTL key for tracking hold expiry
     */
    async setHoldExpiry(bookingId: string, expiresAt: Date): Promise<void> {
        if (!this.redis) return;

        try {
            const ttl = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
            await this.redis.set(`hold:${bookingId}`, 'active', { ex: ttl });
        } catch (error) {
            console.error(`❌ Redis setHoldExpiry failed [${bookingId}]:`, error.message);
        }
    }

    /**
     * Check if a hold is still active (not expired)
     */
    async isHoldActive(bookingId: string): Promise<boolean> {
        if (!this.redis) return true; // Assume active if Redis not configured

        try {
            const result = await this.redis.get(`hold:${bookingId}`);
            return result === 'active';
        } catch (error) {
            console.error(`❌ Redis isHoldActive failed [${bookingId}]:`, error.message);
            return true;
        }
    }

    /**
     * Manually expire a hold (on cancellation)
     */
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

        try {
            const fullKey = `ratelimit:${key}`;
            const current = await this.redis.incr(fullKey);

            if (current === 1) {
                await this.redis.expire(fullKey, windowSeconds);
            }

            return current <= maxRequests;
        } catch (error) {
            console.error(`❌ Redis rate limit check failed [${key}]:`, error.message);
            return true; // Don't block user if Redis fails
        }
    }

    // ============================================
    // CACHING
    // ============================================

    async get<T>(key: string): Promise<T | null> {
        if (!this.redis) return null;
        try {
            return await this.redis.get(key) as T | null;
        } catch (error) {
            console.error(`❌ Redis GET failed [${key}]:`, error.message);
            return null;
        }
    }

    async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
        if (!this.redis) return;

        try {
            if (ttlSeconds) {
                await this.redis.set(key, value, { ex: ttlSeconds });
            } else {
                await this.redis.set(key, value);
            }
        } catch (error) {
            console.error(`❌ Redis SET failed [${key}]:`, error.message);
            // Optionally throw if it's a critical operation, but base set shouldn't crash
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
