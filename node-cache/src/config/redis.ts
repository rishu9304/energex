import { createClient } from 'redis';

/**
 * Redis Configuration
 * 
 * Configures and exports Redis client for caching operations.
 * Handles connection, error handling, and provides utility methods.
 */

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

/**
 * Redis client instance
 */
export const redisClient = createClient({
    socket: {
        host: redisHost,
        port: redisPort,
    },
    ...(redisPassword && { password: redisPassword }),
});

/**
 * Redis connection event handlers
 */
redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
    console.log('Redis Client Connected');
});

redisClient.on('ready', () => {
    console.log('Redis Client Ready');
});

redisClient.on('end', () => {
    console.log('Redis Client Disconnected');
});

/**
 * Connect to Redis
 */
(async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
})();

/**
 * Cache utility functions
 */
export class CacheService {
    /**
     * Get value from cache
     */
    static async get(key: string): Promise<string | null> {
        try {
            return await redisClient.get(key);
        } catch (error) {
            console.error(`Error getting cache key ${key}:`, error);
            return null;
        }
    }

    /**
     * Set value in cache with TTL
     */
    static async set(key: string, value: string, ttl: number = 3600): Promise<boolean> {
        try {
            await redisClient.setEx(key, ttl, value);
            return true;
        } catch (error) {
            console.error(`Error setting cache key ${key}:`, error);
            return false;
        }
    }

    /**
     * Delete key from cache
     */
    static async del(key: string): Promise<boolean> {
        try {
            await redisClient.del(key);
            return true;
        } catch (error) {
            console.error(`Error deleting cache key ${key}:`, error);
            return false;
        }
    }

    /**
     * Check if key exists in cache
     */
    static async exists(key: string): Promise<boolean> {
        try {
            const result = await redisClient.exists(key);
            return result === 1;
        } catch (error) {
            console.error(`Error checking cache key ${key}:`, error);
            return false;
        }
    }

    /**
     * Clear all cache
     */
    static async flushAll(): Promise<boolean> {
        try {
            await redisClient.flushAll();
            return true;
        } catch (error) {
            console.error('Error flushing cache:', error);
            return false;
        }
    }
}
