# V1 → V2 ETL (standalone)

Migrates restored V1 Postgres (`staffing_db_v1_restore` in Docker) into V2 MongoDB.

**Does not modify** frontend/backend application source — scripts only.

## Prerequisites

1. Docker Postgres container `v1-postgres-restore` with dump restored (Step 1)
2. Mongo `metaforge_recruiter_v2` cleaned, with org + test logins kept
3. `npm install` in this folder (installs `pg` only)

## Commands

```powershell
cd F:\Recruiter-Appplication-V2\scripts\v1-to-v2-etl
npm install

# Step 2 — dry run (no Mongo writes)
npm run dry-run

# Step 3 — load data into Mongo
npm run apply
```

## Defaults

| Setting | Value |
|--------|--------|
| Postgres | `127.0.0.1:5433` / `staffing_db_v1_restore` / user `postgres` / pass `v1restore` |
| Mongo | `mongodb://127.0.0.1:27017` / `metaforge_recruiter_v2` |

Override with env: `V1_PG_HOST`, `V1_PG_PORT`, `V1_PG_PASSWORD`, `MONGODB_URI`, `MONGODB_DB_NAME`.

## Load order

users → clients → candidates → requirements → requirement_assignments → submissions → submission_histories → interviews → requirement_histories → email_ingestion_events

## Not in this step

- Resume file copy + `file_metadata` linking (**Step 4**)
- Changing Nest/React UI code
