import { Schema } from 'mongoose';

/**
 * V1 → V2 compatibility helpers.
 * Additive only: does not alter existing V2 field contracts used by APIs/UI.
 */
export const LEGACY_V1_PARTIAL_FILTER = {
  legacyPostgresId: { $type: 'string', $gt: '' },
} as const;

/** Unique V1 PK lookup within an organization (most business collections). */
export function applyOrgLegacyPostgresIdIndex(
  schema: Schema,
  indexName = 'uniq_org_legacyPostgresId',
): void {
  schema.index(
    { orgId: 1, legacyPostgresId: 1 },
    {
      unique: true,
      name: indexName,
      partialFilterExpression: LEGACY_V1_PARTIAL_FILTER,
    },
  );
}

/** Unique V1 PK when the collection has no orgId (rare). */
export function applyLegacyPostgresIdIndex(
  schema: Schema,
  indexName = 'uniq_legacyPostgresId',
): void {
  schema.index(
    { legacyPostgresId: 1 },
    {
      unique: true,
      name: indexName,
      partialFilterExpression: LEGACY_V1_PARTIAL_FILTER,
    },
  );
}
