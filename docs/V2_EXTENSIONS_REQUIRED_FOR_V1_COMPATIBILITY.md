# What To Do: V2 Extensions + Exact V1→V2 Migrate Matrix

**Goal:** Hold **complete V1 historical records** in V2 MongoDB **without breaking V2 features**.  
**Sources:** V1 `staffing_db` analysis + V2 Mongoose/Mongo inventory + migration plan.  
**Rule:** Do **not** reshape V2 to look like Postgres. **Extend V2 additively** and **ETL-map** V1 into it.

---

## 1. What we should do (strategy)

| Do | Don’t |
|---|---|
| Keep all current V2 collections & APIs | Don’t replace V2 schemas with V1 table layouts |
| Add only **optional** fields / 1–2 archive collections | Don’t remove V2-only features (attendance, AI, teams, notifications…) |
| Transform V1 rows → V2 document shape | Don’t raw-dump Postgres into Mongo |
| Store V1 PKs as `legacyPostgresId` | Don’t reuse V1 text IDs as Mongo `_id` |
| Put leftover V1-only attributes in `legacy{}` | Don’t force every V1 column onto the UI schema |

**Outcome:** V2 app keeps working; recruiters keep V1 history.

---

## 2. Accurate migrate matrix (all 14 V1 tables)

| V1 table | Rows | Accurately migrates to V2? | V2 target | Notes |
|---|---:|---|---|---|
| `users` | 26 | **Yes (with transform)** | `users` + `organizations` + `roles_permissions` | Role map LEAD→lead, RECRUITER→recruiter; name = first+last; password hash migrate |
| `clients` | 110 | **Yes (with transform)** | `clients` | POC → `pocContacts[]`; generate `clientId` |
| `candidates` | 20,967 | **Yes (with transform + extensions)** | `candidates` + `file_metadata` + `candidate_documents` | Resume files copy; phone dup risk; orphan `created_by` |
| `requirements` | 1,799 | **Yes (with transform)** | `requirements` | `requirement_id`→`reqCode`; status/assignment enum map |
| `requirement_assignments` | 1,044 | **Partial on current V2** | Current assignees → `requirements.assignedRecruiterIds` | **Full history needs extension** (see §4) |
| `requirement_activities` | 4,923 | **Yes (with transform)** | `requirement_histories` and/or `activity_logs` | Action/summary → history docs |
| `submissions` | 1,036 | **Yes (with transform)** | `submissions` | Status→stage map; extra cols → `legacy` |
| `candidate_status_history` | 138 | **Yes (with transform)** | `submission_histories` | old/new status → previousStage/newStage |
| `interviews` | 45 | **Yes (merge)** | `interviews` (+ feedback) | Merge with rounds; dedupe |
| `interview_rounds` | 40 | **Yes (merge)** | `interviews` (+ `interview_feedbacks`) | Prefer rounds when linked |
| `email_ingestion_events` | 1,285 | **Partial on current V2** | Partial → requirement source fields | **Full ledger needs extension** (see §4) |
| `communication_logs` | 0 | N/A (empty) | skip / keep V2 notifications empty | No data loss |
| `offer_letters` | 0 | N/A (empty) | V2 `offers` stays empty | No data loss |
| `offer_management` | 0 | N/A (empty) | V2 `offers` stays empty | No data loss |

**Resumes (not a SQL table):** 5,330 files on V1 disk → copy into V2 `STORAGE_ROOT` + `file_metadata` + link `candidates.resumeFileId`.

---

## 3. What already matches well enough (no new collection needed)

These V1 concepts already have a V2 home. Only **ETL + field mapping** required:

| Business data | V2 collection(s) |
|---|---|
| Recruiter / lead accounts | `users` |
| Clients | `clients` |
| Candidate repository | `candidates` |
| Requirements / JDs | `requirements` |
| Submissions | `submissions` |
| Submission status changes | `submission_histories` |
| Interviews (+ feedback/rating) | `interviews`, `interview_feedbacks` |
| Requirement timeline actions | `requirement_histories` / `activity_logs` |
| Current assignees on a requirement | `requirements.assignedRecruiterIds` (+ `assignedLeadId`) |

---

## 4. What is missing in V2 today (extensions required)

### 4.1 Must-have additive fields (on existing collections)

Apply to **all migrated entities** at minimum:

```
legacyPostgresId: string   // V1 PK; indexed; unique per collection recommended
legacy?: object            // V1-only leftover fields (optional nested bag)
orgId: ObjectId            // set for every imported doc (V1 has no org)
schemaVersion: 1
```

| Collection | Extra additive fields needed for fidelity |
|---|---|
| `users` | `legacy`: location, bio, submitting_to, v1Role; keep V2 role/capabilities |
| `candidates` | `legacy`: candidateRef (if not used as candidateId), education[], technologies[], sourcePlatform, sourcePlatformId, experienceLabel, raw salaries/notice, offerInHandDetails, phoneNormalized |
| `clients` | `legacy`: location; map industry→domain |
| `requirements` | `legacy`: slaDays, demandType, POC text fields, display names, experience raw string, monthly/yearly budget raw |
| `submissions` | `legacy`: soNumber, clientFeedback, interview snapshot fields, offer-in-hand on submission, forwardedBy |
| `interviews` | `legacy`: v1InterviewId, v1RoundId, recruiterId, rating, finalDecision (if not in feedback doc) |

**Why:** Without these, you can load “enough for UI,” but you **lose** some V1 columns. With them, history is complete and V2 screens still use current fields.

### 4.2 Structural gaps (choose one approach each)

| Missing vs V1 | Rows at risk | Required extension |
|---|---:|---|
| Full **assignment history** (ACTIVE/REVOKED), not only current assignees | 1,044 | **Option A (recommended):** new collection `requirement_assignments` mirroring V1 ledger **or** **Option B:** one `requirement_histories` doc per assignment event |
| Full **email ingestion ledger** (idempotency/status/payload) | 1,285 | **Option A:** new collection `email_ingestion_events` **or** **Option B:** only stamp `requirements.idempotencyKey` / sourceMessageId (loses event history detail) |
| Dual interview models | 45+40 | **No new collection** — merge into `interviews` + `interview_feedbacks` with dedupe rules |

### 4.3 Data-quality extensions / ETL rules (not schema, but required)

| Issue | V1 fact | V2 constraint | What to implement |
|---|---|---|---|
| Phone collisions | 42 phones shared | unique `(orgId, phone, deletedAt)` | Pre-migration resolver: keep one active; soft-delete or uniquify others; store original in `legacy` |
| Missing creator | 16,750 candidates without `created_by` | `sourcedByRecruiterId` required | Assign fallback system/lead user; record null in `legacy.createdByMissing=true` |
| Text → number | salaries, notice, experience often text | numeric fields | Parsers + keep raw in `legacy` |
| Passwords | V1 `password` hashes | V2 Argon2id | Keep hash; rely on V2 dual-verify + rehash on login, or force reset |
| Enums | V1 status enums | V2 stage/status strings | Fixed map tables in ETL |
| IDs | text PKs | ObjectId refs | ID map tables during import |

### 4.4 Optional V2 synthesis (preserve UX, not in V1)

| V2 feature | V1 source | Action |
|---|---|---|
| `organizations` | none | Create 1 org (e.g. MetaForge) for all V1 rows |
| `roles_permissions` | none | Seed V2 default matrix |
| `teams` | none | Optional: build teams from lead↔recruiter patterns |
| `recruiter_analytics` | derived | Recalculate after import |
| `counters` | sequences | Set candidate sequence from max imported id |

---

## 5. Preserve V2 features (do not touch / leave empty)

These stay as-is. **No V1 data required.** Migration must **not** delete or redesign them:

| V2 collection / feature | Preserve how |
|---|---|
| Teams, RBAC, workspace | Keep schemas/APIs; seed permissions |
| `file_metadata` / private storage | Use for migrated resumes + future uploads |
| `offers` | Keep empty (V1 offers tables empty) |
| `notifications` | Keep feature; start empty or regenerate |
| Attendance (`recruiter_login_histories`, `daily_attendance_reports`) | V2-only; untouched |
| AI (`ai_parsing_jobs`, `ai_match_scores`) | V2-only; untouched |
| `candidate_blacklist`, `saved_searches`, `email_templates` | V2-only; untouched |
| Mail extraction / parsers / OTP login | Keep code paths; wire to migrated requirements/users |

**Preserving V2 = additive schema only + ETL into existing shapes.**

---

## 6. Implementation order (accurate work breakdown)

### Step A — Schema extensions (code, backward compatible)

1. Add `legacyPostgresId` (+ index) and optional `legacy` to:  
   User, Client, Candidate, Requirement, Submission, Interview (+ histories if useful).  
2. Decide and implement **one** of:
   - new `requirement_assignments` schema/module, **or** history-only mapping.  
3. Decide and implement **one** of:
   - new `email_ingestion_events` schema/module, **or** requirement-field-only.  
4. Do **not** change existing required V2 API response contracts except to ignore unknown legacy fields.

### Step B — ETL (data)

1. Export V1 read-only.  
2. Load in order: org → roles → users → clients → files → candidates → requirements → current assignees → assignment history → submissions → submission_histories → requirement histories/activities → interviews/feedback → email events.  
3. Build ID maps; apply enum maps; copy resumes.  
4. Validate counts + FK integrity + login smoke test.

### Step C — Cutover

Freeze V1 writes → final sync → switch users to V2 → hypercare.

---

## 7. What “complete V1 in V2” means after extensions

| Must be true after migration | How |
|---|---|
| All 26 recruiters/leads can log in | `users` mapped |
| All ~20,967 candidates visible | `candidates` + legacy fields |
| Client-wise requirements intact | `clients` + `requirements` |
| Submissions client/req/candidate linked | `submissions` with ObjectId maps |
| Interview history intact | merged `interviews` |
| Recruiter “who added / who submitted / who assigned” intact | user refs + assignment ledger |
| Activity / status history intact | `submission_histories` + `requirement_histories`/`activity_logs` |
| Resumes open in V2 | files + `file_metadata` |
| V2 features still work | schemas/APIs unchanged except additive |

---

## 8. Direct answers

**Q: Are V2 schemas already matching V1 tables?**  
**A: No** — not column-for-column. Core business entities align; structures differ.

**Q: Can V2 hold complete V1 records while keeping V2 features?**  
**A: Yes** — by additive extensions (`legacyPostgresId`/`legacy` + assignment & email history strategy) + ETL mapping. Not by raw dump.

**Q: What must we implement on V2 Mongo/schemas before full migrate?**  
**A:**  
1) Additive legacy ID/fields on existing collections  
2) Assignment-history strategy (new collection **or** history docs)  
3) Email-ingestion strategy (new collection **or** partial)  
4) ETL rules for phones, orphan creators, enums, resumes, passwords  

**Q: What migrates accurately today with only transforms?**  
**A:** users, clients, candidates (core), requirements, submissions, status history, interviews (merged), activities (into histories).  

**Q: What is incomplete without extensions?**  
**A:** Full assignment ledger, full email-ingestion event ledger, V1-only candidate/submission columns, resume binaries.

---

*This is the authoritative “what to build” checklist before coding the migration.*
