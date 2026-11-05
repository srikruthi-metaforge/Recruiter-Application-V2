import { TenantCacheService, cacheSegment, hashVariant } from './tenant-cache.service';
import { DEFAULT_JOB_OPTIONS, isDuplicateJobError, MAIL_SYNC_SCHEDULER_ID } from '../../jobs/job-options';

describe('tenant cache keys', () => {
  it('rejects segments that could widen a delete', () => {
    expect(cacheSegment('6ab4f38ff2e0e1823c038948')).toBe('6ab4f38ff2e0e1823c038948');
    expect(cacheSegment('org-a*')).toBeNull();
    expect(cacheSegment('org:other')).toBeNull();
    expect(cacheSegment('')).toBeNull();
  });

  it('keeps each organization on its own entry and drops only that organization', async () => {
    const redis = { status: 'disabled', get: async () => null, set: async () => undefined, scanDelete: async () => undefined };
    const cache = new TenantCacheService(redis as any);
    const orgA = '6ab4f38ff2e0e1823c038948';
    const orgB = '7ab4f38ff2e0e1823c038999';
    let loads = 0;
    const load = async () => ++loads;

    expect(await cache.remember(orgA, 'workspace', 'user-1', 30, load)).toBe(1);
    expect(await cache.remember(orgA, 'workspace', 'user-1', 30, load)).toBe(1);
    expect(await cache.remember(orgB, 'workspace', 'user-1', 30, load)).toBe(2);

    cache.invalidateOrg(orgA);
    expect(await cache.remember(orgA, 'workspace', 'user-1', 30, load)).toBe(3);
    expect(await cache.remember(orgB, 'workspace', 'user-1', 30, load)).toBe(2);
  });

  it('does not cache an unsafe org id', async () => {
    const redis = { status: 'disabled', get: async () => null, set: async () => undefined, scanDelete: async () => undefined };
    const cache = new TenantCacheService(redis as any);
    let loads = 0;
    expect(await cache.remember('bad org', 'workspace', 'user-1', 30, async () => ++loads)).toBe(1);
    expect(await cache.remember('bad org', 'workspace', 'user-1', 30, async () => ++loads)).toBe(2);
  });

  it('hashes variants without putting the raw user id in the digest source check', () => {
    expect(hashVariant('a')).not.toBe(hashVariant('b'));
  });
});

describe('background job policy', () => {
  it('retries with exponential backoff and keeps a stable scheduler id', () => {
    expect(DEFAULT_JOB_OPTIONS.attempts).toBeGreaterThanOrEqual(3);
    expect(DEFAULT_JOB_OPTIONS.backoff.type).toBe('exponential');
    expect(MAIL_SYNC_SCHEDULER_ID).toBe('mail-sync');
  });

  it('treats a duplicate job id as protection, not a failure', () => {
    expect(isDuplicateJobError(new Error('JobId mail-initial-backfill already exists'))).toBe(true);
    expect(isDuplicateJobError(new Error('connection refused'))).toBe(false);
  });
});
