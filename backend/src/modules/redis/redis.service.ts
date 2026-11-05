import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis | null = null;
  status: 'disabled' | 'connected' | 'error' = 'disabled';
  private readonly counters = { gets: 0, hits: 0, misses: 0, sets: 0, errors: 0, totalMs: 0 };

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const url = this.config.get<string>('REDIS_URL');
    if (!url) {
      this.logger.log('REDIS_URL not set — cache and queues run in-process');
      return;
    }

    try {
      this.client = new Redis(url, { maxRetriesPerRequest: 2, lazyConnect: true });
      await this.client.connect();
      this.status = 'connected';
      this.logger.log('Redis connected');
    } catch (err) {
      this.status = 'error';
      this.client = null;
      this.logger.warn(`Redis unavailable (${(err as Error).message}) — using in-memory fallback`);
    }
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit().catch(() => undefined);
  }

  getClient(): Redis | null {
    return this.client;
  }

  async get(key: string): Promise<string | null> {
    const started = process.hrtime.bigint();
    this.counters.gets += 1;
    if (!this.client) {
      this.counters.misses += 1;
      return null;
    }
    try {
      const value = await this.client.get(key);
      if (value === null) this.counters.misses += 1;
      else this.counters.hits += 1;
      return value;
    } catch {
      this.counters.errors += 1;
      return null;
    } finally {
      this.counters.totalMs += Number(process.hrtime.bigint() - started) / 1e6;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    const started = process.hrtime.bigint();
    this.counters.sets += 1;
    if (!this.client) return;
    try {
      if (ttlSeconds) await this.client.set(key, value, 'EX', ttlSeconds);
      else await this.client.set(key, value);
    } catch {
      this.counters.errors += 1;
    } finally {
      this.counters.totalMs += Number(process.hrtime.bigint() - started) / 1e6;
    }
  }

  metrics() {
    const ops = this.counters.gets + this.counters.sets;
    return {
      status: this.status,
      gets: this.counters.gets,
      hits: this.counters.hits,
      misses: this.counters.misses,
      sets: this.counters.sets,
      errors: this.counters.errors,
      avgMs: ops ? Math.round((this.counters.totalMs / ops) * 100) / 100 : 0,
    };
  }

  async scanDelete(match: string): Promise<void> {
    if (!this.client || this.status !== 'connected') return;
    try {
      let cursor = '0';
      do {
        const [next, keys] = await this.client.scan(cursor, 'MATCH', match, 'COUNT', 100);
        cursor = next;
        if (keys.length) await this.client.del(...keys);
      } while (cursor !== '0');
    } catch {
      // A failed invalidation expires with the key TTL.
    }
  }

  /**
   * Cross-process lock. Returns false when Redis is connected and another
   * worker holds the lock, and false when Redis is unavailable so the caller
   * can fall back to its in-process guard.
   */
  async tryLock(name: string, ttlSeconds: number): Promise<boolean> {
    if (!this.client || this.status !== 'connected') return false;
    try {
      const ok = await this.client.set(`mrap:lock:${name}`, '1', 'EX', ttlSeconds, 'NX');
      return ok === 'OK';
    } catch {
      return false;
    }
  }

  async unlock(name: string): Promise<void> {
    if (!this.client || this.status !== 'connected') return;
    try {
      await this.client.del(`mrap:lock:${name}`);
    } catch {
      // The lock expires on its own.
    }
  }

  async getJson<T>(key: string): Promise<T | null> {
    const raw = await this.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async setJson(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      await this.set(key, JSON.stringify(value), ttlSeconds);
    } catch {
      // Ignore status-write failures.
    }
  }
}
