import { Schema } from 'mongoose';

type Invalidate = (orgId: string) => void;

let invalidateOrg: Invalidate = () => undefined;

/** Registered by TenantCacheService once Redis (or the in-memory fallback) is ready. */
export function registerOrgCacheInvalidator(fn: Invalidate) {
  invalidateOrg = fn;
}

function orgIdOf(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null && 'toString' in value) return String(value);
  return '';
}

function invalidate(orgId: unknown) {
  const id = orgIdOf(orgId);
  if (id) invalidateOrg(id);
}

/**
 * Drops tenant cache entries after a write. Hooks read orgId from the document
 * or the query so one organization cannot clear another organization's keys.
 */
export function OrgCachePlugin(schema: Schema) {
  schema.post('save', function (doc: { orgId?: unknown }) {
    invalidate(doc?.orgId);
  });

  schema.post('insertMany', function (docs: any) {
    if (!Array.isArray(docs)) return;
    const seen = new Set<string>();
    for (const doc of docs) {
      const id = orgIdOf(doc?.orgId);
      if (id && !seen.has(id)) {
        seen.add(id);
        invalidateOrg(id);
      }
    }
  } as any);

  const fromQuery = function (this: { getQuery?: () => { orgId?: unknown } }, doc?: { orgId?: unknown }) {
    invalidate(doc?.orgId || this.getQuery?.()?.orgId);
  };

  schema.post('findOneAndUpdate', fromQuery);
  schema.post('findOneAndDelete', fromQuery);
  schema.post('updateOne', fromQuery);
  schema.post('updateMany', fromQuery);
  schema.post('deleteOne', fromQuery);
}
