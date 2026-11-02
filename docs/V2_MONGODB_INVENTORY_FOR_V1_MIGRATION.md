# Recruiter Application V2 — MongoDB Inventory for V1 → V2 Migration

**Purpose:** Read-only inventory of the live V2 MongoDB database and all Mongoose schemas, so V1 (PostgreSQL) data can be mapped into matching V2 collections without loss or mismatch.

**Captured at:** 2026-10-31 (local live database scan)  
**Scope:** Identification only — no application code or database data was modified for this document.

---

## 1. Existing V2 MongoDB Database

| Item | Value |
|---|---|
| **Database name** | `metaforge_recruiter_v2` |
| **MongoDB server version** | **8.3.9** (64-bit) |
| **Server host (live scan)** | `DESKTOP-KNQD153` — `C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe` |
| **Connection URI (configured)** | `mongodb://127.0.0.1:27017` (no auth in local `.env`) |
| **Configured DB name** | `metaforge_recruiter_v2` |
| **Total collections** | **28** (0 views) |
| **Total documents (objects)** | **50,097** |
| **Data size** | **1,846,974,279 bytes** (~1.72 GiB logical) |
| **Storage size** | **611,913,728 bytes** (~583 MiB) |
| **Index size** | **7,729,152 bytes** (~7.4 MiB) |
| **Total size (storage+index)** | **619,642,880 bytes** (~591 MiB) |
| **Total indexes** | **138** |
| **Avg object size** | ~36,868 bytes |

### 1.1 Connection configuration locations

| Location | Role |
|---|---|
| `backend/.env` | Live local config: `MONGODB_URI`, `MONGODB_DB_NAME` |
| `.env.example` | Template defaults: `mongodb://localhost:27017/metaforge_recruiter_v2`, DB `metaforge_recruiter_v2` |
| `backend/src/app.module.ts` | NestJS `MongooseModule.forRootAsync` — reads `MONGODB_URI` / `MONGODB_DB_NAME`, defaults to `metaforge_recruiter_v2` |
| `migrate-mongo-config.js` | Migration runner DB URL + `databaseName` |
| `docker-compose.yml` | Service env: `MONGODB_URI=mongodb://mongo:27017/metaforge_recruiter_v2`, image `mongo:7` |
| `migrations/20261029_001_unique_candidate_ids.js` | Standalone script defaults: URI `mongodb://127.0.0.1:27017`, DB `metaforge_recruiter_v2` |

### 1.2 Database-level notes relevant to migration

- **No collection-level JSON Schema validators** were found (`validator` empty on all 28 collections). Validation is enforced by **Mongoose schemas** + unique indexes, not MongoDB `$jsonSchema`.
- Soft-delete pattern: many collections use `deletedAt: Date | null` (null = active). App plugin `DataScopePlugin` auto-filters `deletedAt: null` and scopes by `orgId`.
- Multi-tenant key: almost all business collections require **`orgId` → Organization**.
- Document versioning field: **`schemaVersion`** (default `1`) on most business collections (see migration `migrations/20260922_001_add_schema_version.js`).
- **No `legacyId` / `postgresId` / `v1Id` fields exist today** on candidates (0 documents). Migration should **introduce** a legacy ID field (recommended) rather than overwrite Mongo `_id`.
- Operational (non-Mongoose) collections present: `counters`, `job_locks`.
- `changelog` (migrate-mongo tracking collection) was **not** present at scan time.
- Docker Compose pins Mongo **7**; this live host is Mongo **8.3.9** — note the environment difference for production planning.

---

## 2. Complete MongoDB Collection Inventory

Discovered via `listCollections()` on live DB — **do not assume count from code alone**.

| # | Collection | Type | Est. docs | Size (bytes) | Indexes | Mongoose model | App-used | Historical data? |
|---|---|---|---:|---:|---:|---|---|---|
| 1 | `organizations` | collection | 1 | 160 | 3 | Organization | Yes | Seed/config |
| 2 | `users` | collection | 40 | 17,161 | 6 | User | Yes | Yes (accounts) |
| 3 | `roles_permissions` | collection | 6 | 2,683 | 3 | RolePermission | Yes | Config |
| 4 | `teams` | collection | 3 | 751 | 4 | Team | Yes | Yes |
| 5 | `clients` | collection | 113 | 52,707 | 5 | Client | Yes | Yes |
| 6 | `requirements` | collection | 777 | 51,991,940 | 15 | Requirement | Yes | Yes |
| 7 | `requirement_histories` | collection | 27,003 | 1,779,500,163 | 3 | RequirementHistory | Yes | Yes (largest) |
| 8 | `candidates` | collection | **17,322** | 13,108,877 | 7 | Candidate | Yes | **Yes (core repo)** |
| 9 | `candidate_documents` | collection | 48 | 10,128 | 3 | CandidateDocumentRecord | Yes | Yes |
| 10 | `candidate_blacklist` | collection | 0 | 0 | 6 | CandidateBlacklist | Yes | Empty |
| 11 | `submissions` | collection | 344 | 134,241 | 6 | Submission | Yes | Yes |
| 12 | `submission_histories` | collection | 225 | 56,092 | 3 | SubmissionHistory | Yes | Yes |
| 13 | `interviews` | collection | 56 | 34,614 | 5 | Interview | Yes | Yes |
| 14 | `interview_feedbacks` | collection | 2 | 744 | 3 | InterviewFeedback | Yes | Yes |
| 15 | `offers` | collection | 4 | 1,379 | 4 | Offer | Yes | Yes |
| 16 | `file_metadata` | collection | 141 | 73,431 | 3 | FileMetadata | Yes | Yes (resume meta) |
| 17 | `notifications` | collection | 2,119 | 715,131 | 6 | Notification | Yes | Yes (TTL 90d) |
| 18 | `activity_logs` | collection | 1,502 | 1,021,209 | 5 | ActivityLog | Yes | Yes (TTL 3y) |
| 19 | `user_audit_logs` | collection | 37 | 18,736 | 8 | UserAuditLog | Yes | Yes |
| 20 | `recruiter_analytics` | collection | 0 | 0 | 3 | RecruiterAnalytics | Yes | Empty / derivable |
| 21 | `recruiter_login_histories` | collection | 340 | 199,610 | 15 | RecruiterLoginHistory | Yes | V2-only ops |
| 22 | `daily_attendance_reports` | collection | 5 | 22,580 | 4 | DailyAttendanceReport | Yes | V2-only ops |
| 23 | `email_templates` | collection | 0 | 0 | 4 | EmailTemplate | Yes | Empty |
| 24 | `saved_searches` | collection | 0 | 0 | 5 | SavedSearch | Yes | Empty / user prefs |
| 25 | `ai_parsing_jobs` | collection | 7 | 11,332 | 4 | AIParsingJob | Yes | V2 AI feature |
| 26 | `ai_match_scores` | collection | 1 | 531 | 3 | AIMatchScore | Yes | V2 AI feature |
| 27 | `counters` | collection | 1 | 79 | 1 | *(no schema)* | Yes (candidate ID seq) | Operational |
| 28 | `job_locks` | collection | 0 | 0 | 1 | *(no schema)* | Yes (mail poll lease) | Operational |

### 2.1 Collection types

- All 28 are standard **collections** (not timeseries, not views, not capped).
- TTL indexes exist on `notifications.createdAt` (90 days) and `activity_logs.createdAt` (3 years).

### 2.2 Primary identity patterns

| Pattern | Collections |
|---|---|
| MongoDB `_id` = ObjectId | All collections |
| Business string ID + `_id` | `users.userId`, `clients.clientId`, `candidates.candidateId`, `submissions.submissionId`, `interviews.interviewId`, `offers.offerId`, `requirements.reqCode`, `teams.teamId`, `file_metadata.fileId`, `ai_parsing_jobs.jobId` |
| Counter-backed sequence | `counters` `_id` like `candidateId:<orgObjectId>` → `{ seq, orgId }` |
| Date-key uniqueness | `daily_attendance_reports.reportDate`, `user_audit_logs` (`date` + `userId`) |

### 2.3 `_id` type

- Live documents use standard BSON **ObjectId** for `_id` across scanned collections.
- Mongoose schemas do not override `_id` (except embedded `RecruiterAttendanceSnapshot` with `_id: false`).

### 2.4 Schema validation rules (MongoDB level)

- **None** configured on any collection (`options.validator` empty).
- Enforcement = Mongoose `@Prop` required/enum/defaults + unique/compound indexes listed in §4.

---

## 3. Complete Mongoose Schema Analysis

### 3.1 Schema file map

| Schema class | Collection | File |
|---|---|---|
| Organization | `organizations` | `backend/src/modules/organizations/schemas/organization.schema.ts` |
| User | `users` | `backend/src/modules/users/schemas/user.schema.ts` |
| RolePermission | `roles_permissions` | `backend/src/modules/users/schemas/role-permission.schema.ts` |
| Team | `teams` | `backend/src/modules/teams/schemas/team.schema.ts` |
| Client | `clients` | `backend/src/modules/clients/schemas/client.schema.ts` |
| Requirement | `requirements` | `backend/src/modules/requirements/schemas/requirement.schema.ts` |
| RequirementHistory | `requirement_histories` | `backend/src/modules/requirements/schemas/requirement-history.schema.ts` |
| Candidate | `candidates` | `backend/src/modules/candidates/schemas/candidate.schema.ts` |
| CandidateDocumentRecord | `candidate_documents` | `backend/src/modules/candidates/schemas/candidate-document.schema.ts` |
| CandidateBlacklist | `candidate_blacklist` | `backend/src/modules/candidate-blacklist/schemas/candidate-blacklist.schema.ts` |
| Submission | `submissions` | `backend/src/modules/submissions/schemas/submission.schema.ts` |
| SubmissionHistory | `submission_histories` | `backend/src/modules/submissions/schemas/submission-history.schema.ts` |
| Interview | `interviews` | `backend/src/modules/interviews/schemas/interview.schema.ts` |
| InterviewFeedback | `interview_feedbacks` | `backend/src/modules/interviews/schemas/interview-feedback.schema.ts` |
| Offer | `offers` | `backend/src/modules/offers/schemas/offer.schema.ts` |
| FileMetadata | `file_metadata` | `backend/src/modules/files/schemas/file-metadata.schema.ts` |
| Notification | `notifications` | `backend/src/modules/notifications/schemas/notification.schema.ts` |
| ActivityLog | `activity_logs` | `backend/src/modules/audit/schemas/activity-log.schema.ts` |
| UserAuditLog | `user_audit_logs` | `backend/src/modules/audit/schemas/user-audit-log.schema.ts` |
| RecruiterAnalytics | `recruiter_analytics` | `backend/src/modules/analytics/schemas/recruiter-analytics.schema.ts` |
| RecruiterLoginHistory | `recruiter_login_histories` | `backend/src/modules/recruiter-attendance/schemas/recruiter-login-history.schema.ts` |
| DailyAttendanceReport | `daily_attendance_reports` | `backend/src/modules/recruiter-attendance/schemas/daily-attendance-report.schema.ts` |
| EmailTemplate | `email_templates` | `backend/src/modules/email-templates/schemas/email-template.schema.ts` |
| SavedSearch | `saved_searches` | `backend/src/modules/saved-searches/schemas/saved-search.schema.ts` |
| AIParsingJob | `ai_parsing_jobs` | `backend/src/modules/ai/schemas/ai-parse-job.schema.ts` |
| AIMatchScore | `ai_match_scores` | `backend/src/modules/ai/schemas/ai-match-score.schema.ts` |

**Not modeled in Mongoose but present in DB:** `counters`, `job_locks`.

**Timestamps:** All listed schemas use `{ timestamps: true }` except where noted — Mongoose adds `createdAt` / `updatedAt`.

**Soft-delete:** `deletedAt` on User, Team, Client, Requirement, Candidate, CandidateDocument, CandidateBlacklist, Submission, Interview, Offer, FileMetadata, EmailTemplate, SavedSearch, RecruiterLoginHistory.

**Version field:** `schemaVersion` (number, default 1) on most business schemas (not on attendance/audit session schemas).

---

### 3.2 Field dictionaries (target shape for migration)

Below is the **current V2 Mongoose contract** — this is the shape V1 data should be transformed **into** for application compatibility.

#### `organizations`

| Field | Type | Required | Default / enum | Notes |
|---|---|---|---|---|
| `_id` | ObjectId | auto | | Primary key |
| `name` | string | yes | unique | |
| `slug` | string | yes | unique, lowercase | |
| `tier` | string | | `Professional`; enum Starter/Professional/Enterprise | |
| `active` | boolean | | true | |
| `schemaVersion` | number | | 1 | |
| `createdAt`/`updatedAt` | Date | auto | | |

#### `users`

| Field | Type | Required | Default / enum | Refs |
|---|---|---|---|---|
| `orgId` | ObjectId | yes | | Organization |
| `userId` | string | yes | | business id |
| `name` | string | yes | | |
| `email` | string | yes | lowercase | unique per org+deletedAt |
| `passwordHash` | string | yes | | |
| `role` | string | yes | `recruiter`; enum superadmin/admin/lead/recruiter/devteam/client | |
| `teamId` | ObjectId | | null | Team |
| `clientId` | ObjectId | | null | Client (client-role users) |
| `avatarUrl` | string | | null | |
| `phone` | string | | null | |
| `active` | boolean | | true | |
| `capabilities` | object | | `{}` | |
| `lastLoginAt` | Date | | null | |
| `loginOtpHash` / `loginOtpExpires` / `loginOtpAttempts` / `loginOtpLastSentAt` | mixed | | OTP flow | V2-only |
| `deletedAt` | Date | | null | soft delete |
| `schemaVersion` | number | | 1 | |

#### `roles_permissions`

| Field | Type | Required | Notes |
|---|---|---|---|
| `orgId` | ObjectId | yes | |
| `roleCode` | string | yes | unique with orgId |
| `roleName` | string | yes | |
| `permissions` | string[] | | default `[]` |
| `schemaVersion` | number | | 1 |

#### `teams`

| Field | Type | Required | Refs |
|---|---|---|---|
| `orgId` | ObjectId | yes | Organization |
| `teamId` | string | yes | unique per org |
| `teamName` | string | yes | |
| `leadId` | ObjectId | yes | User |
| `recruiterIds` | ObjectId[] | | User[] |
| `active` | boolean | | true |
| `deletedAt` | Date | | null |
| `schemaVersion` | number | | 1 |

#### `clients`

| Field | Type | Required | Default / enum |
|---|---|---|---|
| `orgId` | ObjectId | yes | |
| `clientId` | string | yes | unique per org |
| `clientName` | string | yes | unique per org |
| `domain` | string | | `Information Technology` |
| `tier` | string | | `Tier-1`; Tier-1/Tier-2/Enterprise/Global |
| `status` | string | | `Active`; Active/On Hold/Inactive/Archived |
| `slaDays` | number | | 5 |
| `pocContacts` | array of `{name,email,phone?,designation?}` | | `[]` |
| `accountLeadId` | ObjectId → User | | null |
| `deliveryGapScore` | number | | 0 |
| `agreementsUrl` | string | | null |
| `deletedAt` / `schemaVersion` | | | null / 1 |

**Live-data note:** some client docs also contain older fields (`contactPersons`, `industry`, `address`) not in current schema — dual-shape risk similar to candidates.

#### `requirements`

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `orgId` | ObjectId | yes | |
| `reqCode` | string | yes | unique per org |
| `title` | string | yes | |
| `clientId` | ObjectId → Client | yes | |
| `clientName` | string | yes | denormalized |
| `priority` | string | | Medium; High/Medium/Low/Urgent |
| `status` | string | | Open |
| `assignmentStatus` | string | | Unassigned; Unassigned/Assigned/In Progress/Closed |
| `openings` | number | | 1 |
| `submissionsCount` / `interviewsCount` / `placedCount` | number | | denormalized counters |
| `budgetRange` | `{min,max,currency}` | | `{0,0,INR}` |
| `budgetText` | string | | null |
| `assignedLeadId` | ObjectId → User | | null |
| `assignedRecruiterIds` | ObjectId[] → User | | `[]` |
| `skillsRequired` | string[] | | |
| `experienceRange` | `{min,max}` | | |
| `location` | string | | Hybrid |
| `emailArrivedTime` | Date | | now |
| Mail/source fields | strings/arrays/dates | | `clientEmail`, `toEmails`, `ccEmails`, `sourceMessageId`, `sourceClientJdId`, `sourceSubject`, `sourceEmailBody`/`Html` (select:false), thread fields, `idempotencyKey`, etc. |
| `deletedAt` / `schemaVersion` | | | |

#### `candidates` (**migration critical**)

| Field (Mongoose / target) | Type | Required | Default / enum | Notes |
|---|---|---|---|---|
| `orgId` | ObjectId | **yes** | | Organization |
| `candidateId` | string | **yes** | plain digits e.g. `"20834"` | unique per org when `deletedAt` null |
| `name` | string | **yes** | | **Current schema** |
| `email` | string | **yes** | lowercase | unique per org+deletedAt |
| `phone` | string | **yes** | | unique per org+deletedAt |
| `linkedInUrl` | string | | null | |
| `currentCompany` | string | | null | |
| `qualification` | string | | null | |
| `totalExperienceYears` | number | | 0 | |
| `relevantExperienceYears` | number | | 0 | |
| `currentCtc` | number | | 0 | |
| `expectedCtc` | number | | 0 | |
| `noticePeriodDays` | number | | 30 | |
| `currentLocation` | string | | null | |
| `preferredLocation` | string | | null | singular in schema |
| `offerInHand` | string | | No; No/Yes/In Pipeline/Multiple | |
| `interviewAvailability` | string | | null | |
| `reasonForChange` | string | | null | |
| `notes` | string | | null | |
| `skills` | string[] | | `[]` | |
| `resumeFileId` | ObjectId → FileMetadata | | null | |
| `resumeFileName` | string | | null | |
| `sourcedByRecruiterId` | ObjectId → User | **yes** | | recruiter association |
| `status` | string | | New; New/Parsed/Submitted/Interviewing/Offered/Placed | |
| `deletedAt` | Date | | null | |
| `schemaVersion` | number | | 1 | |
| `createdAt`/`updatedAt` | Date | auto | | |

**Indexes (schema + live):**  
- unique `(orgId, phone, deletedAt)`  
- unique `(orgId, email, deletedAt)`  
- `(orgId, skills, totalExperienceYears, deletedAt)`  
- `(orgId, noticePeriodDays, currentLocation, deletedAt)`  
- unique partial `uniq_org_candidateId_active` on `(orgId, candidateId)` where `deletedAt: null`

#### `candidate_documents`

| Field | Type | Required | Enum / refs |
|---|---|---|---|
| `orgId` | ObjectId | yes | |
| `candidateId` | ObjectId → Candidate | yes | |
| `documentType` | string | yes | Resume / Offer Letter / Government ID / Degree Certificate / Payslip |
| `fileMetadataId` | ObjectId → FileMetadata | yes | |
| `isPrimaryResume` | boolean | | false |
| `deletedAt` / `schemaVersion` | | | |

#### `submissions`

| Field | Type | Required | Default / enum | Refs |
|---|---|---|---|---|
| `orgId` | ObjectId | yes | | |
| `submissionId` | string | yes | | business id |
| `candidateId` | ObjectId | yes | | Candidate |
| `requirementId` | ObjectId | yes | | Requirement |
| `clientId` | ObjectId | yes | | Client |
| `recruiterId` | ObjectId | yes | | User |
| `leadId` | ObjectId | | null | User |
| `stage` | string | | Submitted; Submitted…Rejected | |
| `leadApprovalStatus` | string | | Pending; Pending/Approved/Rejected/Forwarded | |
| `matchScore` | number | | 0 | |
| `submittedAt` | Date | | now | |
| `leadApprovedAt` / `clientForwardedAt` | Date | | null | |
| `rejectionReason` | string | | null | |
| `deletedAt` / `schemaVersion` | | | | |

Unique: `(orgId, candidateId, requirementId, deletedAt)`.

#### `interviews`

| Field | Type | Required | Notes |
|---|---|---|---|
| `orgId` | ObjectId | yes | |
| `interviewId` | string | yes | |
| `submissionId` / `candidateId` / `requirementId` | ObjectId | yes | refs |
| `round` | string | | default `L1 Technical` |
| `dateTime` | Date | yes | |
| `durationMinutes` | number | | 60 |
| `mode` | string | | Online |
| `meetingUrl` | string | | null |
| `interviewerName` / `interviewerEmail` | string | yes | |
| `status` | string | | Scheduled |
| `notes`, `candidateEmail`, `candidatePhone` | string | | |
| `reminderSent` / `emailSent` / `whatsappSent` | boolean | | false |
| `whatsappUrl` | string | | null |
| `deletedAt` / `schemaVersion` | | | |

#### Other schemas (summary)

| Collection | Key fields / notes |
|---|---|
| `submission_histories` | `submissionId`, `previousStage`, `newStage`, `performedBy`, `notes` |
| `requirement_histories` | `requirementId`, `action`, `previousValue`/`newValue` objects, `performedBy`, `reason` |
| `interview_feedbacks` | `interviewId`, scores, `recommendation` enum Passed/Rejected/Hold |
| `offers` | `offerId`, submission/candidate/requirement refs, `offeredCtc`, dates, status enum |
| `file_metadata` | `fileId`, storage provider S3/LOCAL/MINIO, `storageKey`, `uploadedBy`, checksum, scanStatus |
| `notifications` | typed events, `entityId`/`entityType`, `readAt`, TTL 90d |
| `activity_logs` | audit trail, category enum, TTL 3y |
| `user_audit_logs` | daily login session rollup; unique `(date, userId)` |
| `recruiter_analytics` | daily per-recruiter counts (empty today; can recalculate post-migrate) |
| `email_templates` | name/subject/bodyHtml/variables/category |
| `saved_searches` | user filters; `collection` enum candidates/requirements |
| `ai_*` | V2-only; leave empty or regenerate |
| `recruiter_login_histories` / `daily_attendance_reports` | V2 attendance; not needed from V1 Postgres |

### 3.3 ObjectId reference graph (migration order hint)

```
organizations
    └── users, roles_permissions, teams, clients, file_metadata
            └── candidates (sourcedByRecruiterId → users, resumeFileId → file_metadata)
            └── requirements (clientId → clients, assigned* → users)
                    └── submissions (candidate, requirement, client, recruiter, lead)
                            └── interviews → interview_feedbacks
                            └── offers
                            └── submission_histories
                    └── requirement_histories
            └── candidate_documents
            └── candidate_blacklist
            └── notifications, activity_logs, analytics, AI collections
```

---

## 4. Existing Indexes & Unique Constraints (live)

Full live index dump was captured. Highlights for migration safety:

| Collection | Critical unique / TTL constraints |
|---|---|
| `candidates` | unique email/phone per org+deletedAt; unique active `candidateId` per org |
| `users` | unique email / userId per org+deletedAt |
| `clients` | unique clientId / clientName per org+deletedAt |
| `requirements` | unique reqCode; unique partial `(clientId, sourceClientJdId)` when JD id present |
| `submissions` | unique `(candidateId, requirementId)` per org+deletedAt |
| `offers` | unique submission per org+deletedAt |
| `file_metadata` | unique `(orgId, fileId)` |
| `teams` | unique teamId per org |
| `roles_permissions` | unique roleCode per org |
| `ai_parsing_jobs` | unique jobId per org |
| `notifications` | TTL 7,776,000s (90 days) on `createdAt` |
| `activity_logs` | TTL 94,608,000s (3 years) on `createdAt` |
| `daily_attendance_reports` | unique `reportDate` |
| `user_audit_logs` | unique `(date, userId)` |
| `recruiter_login_histories` | unique `sessionId` |

---

## 5. Existing Document Analysis (live)

### 5.1 Volume snapshot

See §2 table. Largest collections by document count / size:

1. **`requirement_histories`** — 27,003 docs, ~1.78 GB (dominates DB size; often stores large `newValue`/`previousValue`)
2. **`candidates`** — 17,322 docs
3. **`notifications`** — 2,119
4. **`activity_logs`** — 1,502
5. **`requirements`** — 777 (~52 MB; email bodies inflate size)

### 5.2 Critical finding: dual document shapes in `candidates`

Live `candidates` is **not uniform** with the current Mongoose schema.

| Shape | Approx docs | Typical fields |
|---|---:|---|
| **Legacy / imported shape** | **17,250** | `fullName`, `primarySkills`, `secondarySkills`, `preferredLocations` (array), `currentCtcLpa`, `expectedCtcLpa`, `resumeFileUrl`, `source` — **missing** `name`, `skills`, `status`, `sourcedByRecruiterId` |
| **Current V2 schema shape** | **72** | `name`, `skills`, `status`, `sourcedByRecruiterId`, `resumeFileId`, `currentCtc`, `expectedCtc`, `preferredLocation` |
| Overlap (`name` + `fullName`) | **0** | mutually exclusive |

Other candidate field presence (exact counts):

| Field | Present in N docs |
|---|---:|
| `_id`, `orgId`, `candidateId`, `email`, `phone`, `totalExperienceYears`, `currentLocation`, `noticePeriodDays`, `deletedAt`, `schemaVersion`, `createdAt`, `updatedAt` | 17,322 |
| `fullName`, `primarySkills`, `secondarySkills`, `preferredLocations`, `currentCtcLpa`, `expectedCtcLpa`, `resumeFileUrl`, `source` | 17,250 |
| `name`, `skills`, `status`, `sourcedByRecruiterId`, `resumeFileId`, … | 72 |
| `legacyId` / `postgresId` | **0** |

`source` distribution: Manual 17,152 · Portal 98 · null 72  
`status` distribution: null 17,250 · Parsed 57 · Submitted 8 · New 7  

**Migration implication:** Before / while loading V1 data, decide whether to:

1. Normalize existing 17,250 docs into current schema fields (`fullName`→`name`, skills merge, CTC fields, resume URL→`file_metadata`, set `sourcedByRecruiterId`/`status`), **and**
2. Insert V1 Postgres rows into the **same current schema**, storing `legacyPostgresId` for traceability.

### 5.3 Related volumes for candidates

| Metric | Value |
|---|---:|
| Candidates with non-null `resumeFileId` | 48 |
| Candidates with non-empty `resumeFileUrl` | 755 |
| `candidate_documents` rows | 48 |
| Distinct candidates referenced by `submissions` | 270 |
| Distinct candidates referenced by `interviews` | 16 |
| Candidate ID counter (`counters`) | `seq: 17392` for org `6ab4f38ff2e0e1823c038948` |

### 5.4 Other collections — structure notes

- **`submissions`**: live docs may include extra denormalized `reqCode`; stages follow schema enums.
- **`clients`**: mix of schema fields (`pocContacts`, `domain`, `tier`) and older fields (`contactPersons`, `industry`, `address`).
- **`requirements`**: rich mail-ingestion metadata; large bodies on some docs.
- Empty app collections (`candidate_blacklist`, `email_templates`, `saved_searches`, `recruiter_analytics`, `job_locks`) are fine for V1 migrate — leave empty unless V1 has equivalent data.

---

## 6. Candidate Repository Analysis (focused)

### 6.1 Collection names

| Role | Collection |
|---|---|
| Candidate master | **`candidates`** |
| Attached docs | **`candidate_documents`** |
| Resume/file blobs metadata | **`file_metadata`** (+ files on disk/`STORAGE_ROOT`) |
| Blacklist | **`candidate_blacklist`** |
| ID sequence | **`counters`** (`candidateId:<orgId>`) |
| Downstream | `submissions`, `interviews`, `offers`, `ai_*` |

### 6.2 Identifiers

| Identifier | Present? | Notes |
|---|---|---|
| Mongo `_id` | Yes | ObjectId |
| Business `candidateId` | Yes (all 17,322) | Plain numeric string preferred (`formatCandidateId`); legacy `CAND-#####` accepted by parser util |
| `legacyId` / `postgresId` | **No** | Must be added for V1 traceability |
| Email / phone | Yes | Unique constraints when `deletedAt` null |

Business ID rules: `backend/src/common/candidate-id.util.ts` — increasing integers, ignore junk > 9,999,999.

### 6.3 Profile / skills / experience / location / status

| Concern | Current schema field | Live dominant field |
|---|---|---|
| Display name | `name` | `fullName` (17,250) |
| Skills | `skills[]` | `primarySkills` + `secondarySkills` |
| Experience | `totalExperienceYears`, `relevantExperienceYears` | total always; relevant mostly on 72 |
| Location | `currentLocation`, `preferredLocation` | `preferredLocations` (array) on legacy |
| CTC | `currentCtc`, `expectedCtc` | `currentCtcLpa`, `expectedCtcLpa` (often null) |
| Status | `status` enum | **missing on 17,250** |
| Recruiter | `sourcedByRecruiterId` | **missing on 17,250** |
| Resume | `resumeFileId` + `resumeFileName` | mostly `resumeFileUrl` (often null) |
| Created | `createdAt` / `updatedAt` | present on all |

### 6.4 Relationships

```
Candidate._id
  ├── candidate_documents.candidateId
  ├── submissions.candidateId
  ├── interviews.candidateId
  ├── offers.candidateId
  ├── candidate_blacklist.candidateId (optional)
  ├── ai_match_scores.candidateId / ai_parsing_jobs.candidateId
  ├── resumeFileId → file_metadata._id
  └── sourcedByRecruiterId → users._id
```

---

## 7. Migration-oriented conclusions (clarity only)

1. **Target database** for V1 load: `metaforge_recruiter_v2`.
2. **Authoritative field contracts** are the Mongoose schemas in §3 — not the older live candidate field names.
3. **Existing DB already holds ~17.3k candidates**, but most do **not** match current schema; plan a **normalize-existing + import-V1** strategy (or replace after backup), or risk app breakage (required `name`, `sourcedByRecruiterId`, unique indexes).
4. **Always keep Postgres primary keys** in a new field (e.g. `legacyPostgresId`) and build `oldId → ObjectId` maps for FKs (candidates, clients, users, requirements, submissions, interviews).
5. **Migrate in dependency order** (§3.3). Recalculate denormalized counters (`requirements.submissionsCount`, `recruiter_analytics`) after facts load.
6. **Resumes:** migrate binary files into V2 storage + `file_metadata`, then link `resumeFileId` / `candidate_documents` — do not rely on V1 URLs alone.
7. **V2-only collections** (attendance, AI, notifications TTL, saved searches) need not come from V1; leave empty or regenerate.
8. **Validate** post-load: counts, unique index conflicts (email/phone), referential integrity, recruiter metric spot-checks.

---

## 8. Appendix — Source of truth checklist

| Source | Used for |
|---|---|
| Live MongoDB `metaforge_recruiter_v2` | Counts, sizes, indexes, real document shapes |
| `backend/src/modules/**/schemas/*.ts` | Target schema contracts |
| `backend/src/app.module.ts` + feature modules | Registered models |
| `migrate-mongo-config.js`, `.env.example`, `docker-compose.yml` | Connection defaults |
| `migrations/20260922_001_add_schema_version.js` | Known collection name list at schemaVersion rollout |
| `migrations/20261029_001_unique_candidate_ids.js` | Candidate ID + `counters` behavior |

---

*End of inventory. Next recommended step (when you ask): produce a V1 Postgres table → V2 collection field-mapping workbook against this document.*
