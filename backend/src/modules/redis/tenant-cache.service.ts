import { createHash } from 'crypto';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { RedisService } from './redis.service';
import { registerOrgCacheInvalidator } from '../../database/plugins/org-cache.plugin';

const PREFIX = 'mrap:v2';
const MEMORY_LIMIT = 32;

interface MemoryEntry {
  raw: string;
  expiresAt: number;
}

/** Keep cache key segments free of wildcards so one tenant cannot match another. */
export function cacheSegment(value: unknown): string | null {
  const clean = String(value ?? '').trim();
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(clean)) return null;
  return clean;
}

export function hashVariant(value: string): string {
  return createHash('sha256').update(value).digest('hex').slice(0, 32);
}

@Injectable()
export class TenantCacheService implements OnModuleInit {
  private readonly logger = new Logger(TenantCacheService.name);
  private readonly memory = new Map<string, MemoryEntry>();
  private readonly inflight = new Map<string, Promise<unknown>>();
  private readonly pendingScans = new Set<string>();

  constructor(private readonly redis: RedisService) {}

  onModuleInit() {
    registerOrgCacheInvalidator((orgId) => this.invalidateOrg(orgId));
  }

  /**
   * Read-through cache. An org id that is not a single safe segment bypasses
   * the cache and loads from the database, so a bad key cannot hit another tenant.
   */
  async remember<T>(orgId: unknown, scope: string, variant: string, ttlSeconds: number, loader: () => Promise<T>): Promise<T> {
    const key = this.key(orgId, scope, variant);
    if (!key) return loader();

    const cached = await this.read(key);
    if (cached !== undefined) return cached as T;

    const existing = this.inflight.get(key);
    if (existing) return existing as Promise<T>;

    const pending = (async () => {
      const value = await loader();
      await this.write(key, value, ttlSeconds);
      return value;
    })();
    this.inflight.set(key, pending);
    try {
      return await pending;
    } finally {
      this.inflight.delete(key);
    }
  }

  /** Drop workspace and analytics entries for one organization. */
  invalidateOrg(orgId: unknown) {
    const org = cacheSegment(orgId);
    if (!org) return;
    this.dropMemory((key) => key.startsWith(`${PREFIX}:${org}:workspace:`) || key.startsWith(`${PREFIX}:${org}:analytics:`));
    void this.scan(`${PREFIX}:${org}:workspace:*`);
    void this.scan(`${PREFIX}:${org}:analytics:*`);
  }

  /** Drop one user's notification entries inside one organization. */
  async invalidateNotifications(orgId: unknown, userId: unknown) {
    const org = cacheSegment(orgId);
    const user = cacheSegment(userId);
    if (!org || !user) return;
    const prefix = `${PREFIX}:${org}:notifications:${user}:`;
    this.dropMemory((key) => key.startsWith(prefix));
    await this.scan(`${prefix}*`);
  }

  private key(orgId: unknown, scope: string, variant: string, ownerId?: unknown): string | null {
    const org = cacheSegment(orgId);
    const scopeSeg = cacheSegment(scope);
    if (!org || !scopeSeg) return null;
    const owner = ownerId === undefined ? '' : cacheSegment(ownerId);
    if (ownerId !== undefined && !owner) return null;
    const tail = hashVariant(variant);
    return owner
      ? `${PREFIX}:${org}:${scopeSeg}:${owner}:${tail}`
      : `${PREFIX}:${org}:${scopeSeg}:${tail}`;
  }

  /** Notification reads include the user id in the key, not only the variant hash. */
  async rememberForUser<T>(
    orgId: unknown,
    userId: unknown,
    variant: string,
    ttlSeconds: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    const key = this.key(orgId, 'notifications', variant, userId);
    if (!key) return loader();
    const cached = await this.read(key);
    if (cached !== undefined) return cached as T;
    const existing = this.inflight.get(key);
    if (existing) return existing as Promise<T>;
    const pending = (async () => {
      const value = await loader();
      await this.write(key, value, ttlSeconds);
      return value;
    })();
    this.inflight.set(key, pending);
    try {
      return await pending;
    } finally {
      this.inflight.delete(key);
    }
  }

  private async read(key: string): Promise<unknown | undefined> {
    if (this.redis.status === 'connected') {
      const raw = await this.redis.get(key);
      if (!raw) return undefined;
      try {
        return JSON.parse(raw);
      } catch {
        return undefined;
      }
    }
    const now = Date.now();
    const local = this.memory.get(key);
    if (local && local.expiresAt > now) {
      try {
        return JSON.parse(local.raw);
      } catch {
        this.memory.delete(key);
      }
    } else if (local) {
      this.memory.delete(key);
    }
    return undefined;
  }

  private async write(key: string, value: unknown, ttlSeconds: number) {
    let raw: string;
    try {
      raw = JSON.stringify(value);
    } catch (err) {
      this.logger.warn(`Skipped cache write (${(err as Error).message})`);
      return;
    }
    if (!raw) return;
    if (this.redis.status === 'connected') {
      await this.redis.set(key, raw, ttlSeconds);
      return;
    }
    this.rememberMemory(key, raw, ttlSeconds);
  }

  private rememberMemory(key: string, raw: string, ttlSeconds: number) {
    if (this.memory.size >= MEMORY_LIMIT && !this.memory.has(key)) {
      const oldest = this.memory.keys().next().value;
      if (oldest) this.memory.delete(oldest);
    }
    this.memory.set(key, { raw, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  private dropMemory(match: (key: string) => boolean) {
    for (const key of this.memory.keys()) {
      if (match(key)) this.memory.delete(key);
    }
  }

  private async scan(match: string) {
    if (this.pendingScans.has(match)) return;
    this.pendingScans.add(match);
    try {
      await this.redis.scanDelete(match);
    } finally {
      this.pendingScans.delete(match);
    }
  }
}
