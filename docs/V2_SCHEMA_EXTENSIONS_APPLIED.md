# V2 Schema Extensions Applied (V1 compatibility)

**Date:** 2026-10-31  
**Scope:** Additive Mongoose / MongoDB schema only  
**Not done:** V1 data import, API/UI rewrites, destructive DB changes

## What changed

### 1. Additive fields on existing collections
On: `users`, `clients`, `candidates`, `requirements`, `requirement_histories`, `submissions`, `submission_histories`, `interviews`, `interview_feedbacks`, `file_metadata`

| Field | Type | Purpose |
|---|---|---|
| `legacyPostgresId` | `string \| null` | V1 text PK; partial unique with `orgId` |
| `legacy` | `object \| null` | V1-only leftover attributes |

Existing V2 required fields, enums, and indexes are **unchanged**.

### 2. New collections (archive / ledger)
| Collection | Schema file | Purpose |
|---|---|---|
| `requirement_assignments` | `requirements/schemas/requirement-assignment.schema.ts` | Full V1 assignment history (ACTIVE/REVOKED/COMPLETED) |
| `email_ingestion_events` | `requirements/schemas/email-ingestion-event.schema.ts` | V1 email→JD automation ledger |

Registered in `RequirementsModule` + `AppModule` `MongooseModule.forFeature` only — **no new public API routes**.

### 3. Helper
`backend/src/database/legacy-v1.util.ts` — shared partial unique index helper.

### 4. Index migration (safe)
`migrations/20261031_001_v1_compat_schema_indexes.js`  
- Creates collections if missing  
- Creates additive indexes  
- Does **not** delete documents or drop V2 indexes  

```bash
node migrations/20261031_001_v1_compat_schema_indexes.js
```

## Preserved V2 features
Teams, RBAC, offers, notifications, attendance, AI, blacklist, saved searches, parsers, mail pipeline, existing controllers/services — untouched.

## Next (not this step)
ETL import of V1 Postgres rows into these shapes.
