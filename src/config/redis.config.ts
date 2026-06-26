import { createClient } from 'redis';
import { env } from './env.config';
import { logger } from './logger.config';

// An in-memory fallback cache for when Redis is unavailable
const memoryCache = new Map<string, { value: string; expiry: number | null }>();

class RedisCacheService {
  private client: ReturnType<typeof createClient> | null = null;
  private isConnected = false;

  constructor() {
    if (env.REDIS_ENABLED) {
      this.client = createClient({ url: env.REDIS_URL });

      this.client.on('connect', () => {
        logger.info('🧠 Redis connecting...');
      });

      this.client.on('ready', () => {
        this.isConnected = true;
        logger.info('🧠 Redis Client Connected and Ready');
      });

      this.client.on('error', (err) => {
        logger.warn(`⚠️ Redis Client Error: ${err.message}. Falling back to in-memory cache.`);
        this.isConnected = false;
      });

      this.client.on('end', () => {
        logger.warn('⚠️ Redis Client connection closed. Falling back to in-memory cache.');
        this.isConnected = false;
      });
    } else {
      logger.info('🧠 Redis is disabled by configuration. Using in-memory cache.');
    }
  }

  public async connect(): Promise<void> {
    if (!env.REDIS_ENABLED || !this.client) return;

    try {
      await this.client.connect();
    } catch (error) {
      logger.warn(`⚠️ Redis failed to establish initial connection: ${error}. Using in-memory cache.`);
      this.isConnected = false;
    }
  }

  // Get a key
  public async get<T>(key: string): Promise<T | null> {
    if (this.isConnected && this.client) {
      try {
        const data = await this.client.get(key);
        return data ? (JSON.parse(data) as T) : null;
      } catch (error) {
        logger.error(`Redis GET error for key ${key}:`, error);
      }
    }

    // Memory Cache Fallback
    const cached = memoryCache.get(key);
    if (!cached) return null;

    if (cached.expiry && Date.now() > cached.expiry) {
      memoryCache.delete(key);
      return null;
    }

    return JSON.parse(cached.value) as T;
  }

  // Set a key with TTL (seconds)
  public async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    const stringifiedValue = JSON.stringify(value);

    if (this.isConnected && this.client) {
      try {
        if (ttlSeconds) {
          await this.client.set(key, stringifiedValue, { EX: ttlSeconds });
        } else {
          await this.client.set(key, stringifiedValue);
        }
        return;
      } catch (error) {
        logger.error(`Redis SET error for key ${key}:`, error);
      }
    }

    // Memory Cache Fallback
    const expiry = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    memoryCache.set(key, { value: stringifiedValue, expiry });
  }

  // Delete a key
  public async del(key: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        await this.client.del(key);
        return;
      } catch (error) {
        logger.error(`Redis DEL error for key ${key}:`, error);
      }
    }

    memoryCache.delete(key);
  }

  // Delete keys by pattern
  public async delByPattern(pattern: string): Promise<void> {
    if (this.isConnected && this.client) {
      try {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
        return;
      } catch (error) {
        logger.error(`Redis DEL by pattern error for pattern ${pattern}:`, error);
      }
    }

    // Memory Cache Fallback matching
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of memoryCache.keys()) {
      if (regex.test(key)) {
        memoryCache.delete(key);
      }
    }
  }

  // Check if Redis is active
  public getStatus(): { isEnabled: boolean; isConnected: boolean; type: 'redis' | 'memory' } {
    return {
      isEnabled: env.REDIS_ENABLED,
      isConnected: this.isConnected,
      type: this.isConnected ? 'redis' : 'memory',
    };
  }
}

export const redisCache = new RedisCacheService();
export default redisCache;
