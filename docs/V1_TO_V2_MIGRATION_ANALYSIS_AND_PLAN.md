# V1 → V2 Migration Analysis & Plan

**Status:** ANALYSIS ONLY — no database or application changes in this step  
**Sources:**
- V1: `V1_database_analysis/V1_PostgreSQL_Database_Analysis.md` (`staffing_db`, analyzed 2026-10-31)
- V2: Mongoose schemas + `docs/V2_MONGODB_INVENTORY_FOR_V1_MIGRATION.md` + Nest modules / frontend workflows  
**Current V2 DB state:** emptied for clean import (collections + indexes retained); bootstrap login users may exist separately

---

## 0. Executive summary

| | V1 PostgreSQL | V2 MongoDB |
|---|---|---|
| Database | `staffing_db` (~58 MB + ~1.2 GB resumes on disk) | `metaforge_recruiter_v2` |
| Core tables / collections | **14** tables | **26** Mongoose collections + `counters` / `job_locks` |
| Candidates | **20,967** | Target: import all into `candidates` |
| Users / recruiters | **26** (LEAD 18, RECRUITER 8) | Target: `users` (+ V2 roles/org) |
| Clients | **110** | `clients` |
| Requirements | **1,799** | `requirements` |
| Submissions | **1,036** | `submissions` |
| Interviews | **45** legacy + **40** rounds | Unify → `interviews` (+ feedback) |
| Activity / history | assignments, activities, status history | Split across V2 history/audit collections |

**Verdict:** V1 business history can be migrated into V2 **without dropping V2 features**, if we:

1. Keep **current V2 Mongoose schemas as the runtime contract** (APIs/UI keep working).
2. Add **additive** fields / optional nested `legacy` payloads for V1-only attributes.
3. Introduce **1–2 optional archive collections** for V1 structures V2 does not model as first-class tables (assignment history ledger, email ingestion ledger) — or map them into existing history collections.
4. Run an **ordered ETL** with ID maps, enum maps, resume file copy, and validation gates.

---

## 1. V1 database understanding (from uploaded report)

### 1.1 Identity

- Host `192.168.1.190:5432`, DB `staffing_db`, PostgreSQL 16.15  
- **14** tables, **~31,413** rows, no views/triggers/procedures  
- PKs are **text** IDs (generators like `SUB-…`, `CLIENT-…`, `REQ-…`)  
- Resumes: `candidates.resume_url` → filesystem `…/uploads/resumes/` (**5,330** files, ~1.2 GB), not DB BLOBs  

### 1.2 Tables & volumes (must preserve)

| V1 table | Rows | Preserve? |
|---|---:|---|
| `users` | 26 | **Yes** — recruiter/lead accounts |
| `candidates` | 20,967 | **Yes** — full repository |
| `clients` | 110 | **Yes** |
| `requirements` | 1,799 | **Yes** |
| `requirement_assignments` | 1,044 | **Yes** — assignment history |
| `requirement_activities` | 4,923 | **Yes** — recruiter activity |
| `submissions` | 1,036 | **Yes** |
| `candidate_status_history` | 138 | **Yes** — submission status audit |
| `interviews` | 45 | **Yes** — merge with rounds |
| `interview_rounds` | 40 | **Yes** — merge with interviews |
| `email_ingestion_events` | 1,285 | **Yes** (history / dedupe) |
| `communication_logs` | 0 | Structure only / skip data |
| `offer_letters` / `offer_management` | 0 | Structure only / skip data |

### 1.3 Core V1 join path (must remain valid after migrate)

```
users
  └── created_by → candidates
clients → requirements → submissions → candidates
                         ├── submitted_by / assigned_lead / forwarded_by → users
                         ├── interviews / interview_rounds
                         └── candidate_status_history
requirements ← requirement_assignments (recruiter_id, assigned_by)
requirements ← requirement_activities (actor_id)
```

### 1.4 V1 enums (must map to V2)

| V1 enum | Values |
|---|---|
| `UserRole` | ADMIN, RECRUITER, LEAD, CANDIDATE |
| `SubmissionStatus` | SUBMITTED, INTERVIEW, SELECTED, REJECTED, SUBMITTED_TO_LEAD, SUBMITTED_TO_CLIENT |
| `RequirementStatus` | OPEN, ASSIGNED, SUBMITTED, INTERVIEW, SELECTED, REJECTED, CLOSED |
| `RequirementAssignmentStatus` | UNASSIGNED, ASSIGNED |
| `AssignmentStatus` | ACTIVE, REVOKED, COMPLETED |
| `RequirementPriority` | HIGH, MEDIUM, LOW |
| Interview rounds/types | L1/L2/FINAL; PHONE/VIDEO/ONSITE |

---

## 2. V2 application understanding

### 2.1 Stack & data model

- NestJS + Mongoose → MongoDB `metaforge_recruiter_v2`
- Multi-tenant: almost every document needs **`orgId`**
- Soft delete: **`deletedAt`**
- Document version: **`schemaVersion`**
- Business IDs + Mongo `_id` (ObjectId)
- Data scoping plugin filters by org + role + soft-delete

### 2.2 V2 collections relevant to V1 history

| V2 collection | Role in app |
|---|---|
| `organizations` | Tenant root (V1 has no org — create one MetaForge org) |
| `users` | Login + ownership |
| `roles_permissions` | RBAC matrix |
| `teams` | Lead ↔ recruiters (V1 has no teams table) |
| `clients` | Client master |
| `requirements` | Jobs + embedded assignee arrays |
| `requirement_histories` | Requirement change log |
| `candidates` | Candidate repository |
| `candidate_documents` / `file_metadata` | Resume & docs |
| `submissions` | Candidate↔requirement pipeline |
| `submission_histories` | Stage transitions |
| `interviews` / `interview_feedbacks` | Scheduling + feedback |
| `offers` | Offer lifecycle (V2 feature; V1 empty) |
| `activity_logs` | Cross-entity audit |
| `notifications`, attendance, AI, blacklist, saved_searches | **V2-only features — keep empty or regenerate** |

### 2.3 V2 workflows / frontend capabilities to preserve

Must keep working after migration (no feature removal):

- Auth (password / OTP), role-based nav
- Candidate repository (add/edit/search/filter), resume attach
- Requirements (create, assign lead/recruiters, mail ingestion)
- Submissions (to lead → client), stage moves
- Interviews schedule / feedback
- Offers
- Clients & user/team management
- Analytics / reports (can be recalculated from facts)
- Attendance / notifications / AI parse-match (V2-native; no V1 source required)
- Permissions matrix

### 2.4 V2 APIs (modules)

Organizations, Auth, Users, Clients, Requirements, Candidates, Submissions, Interviews, Offers, Notifications, Analytics, Audit, Teams, Files, AI, Blacklist, Saved Searches, Email Templates, Workspace, Recruiter Attendance, Resume/JD parsers, Mail extraction — **all stay**; migration must feed the collections those APIs already read.

---

## 3. V1 ↔ V2 comparison

### 3.1 Entity mapping (table → collection)

| V1 table | V2 target | Fit |
|---|---|---|
| `users` | `users` (+ `organizations`, `roles_permissions`) | Map with role + password transform |
| `clients` | `clients` | Good with field reshape |
| `candidates` | `candidates` (+ `file_metadata`, `candidate_documents`) | Good with transforms; **phone uniqueness risk** |
| `requirements` | `requirements` | Good; assignees from assignments |
| `requirement_assignments` | `requirements.assignedRecruiterIds` **+ history store** | **Structural mismatch** |
| `requirement_activities` | `requirement_histories` and/or `activity_logs` | Map actions |
| `submissions` | `submissions` | Good with status enum map |
| `candidate_status_history` | `submission_histories` | Good |
| `interviews` + `interview_rounds` | `interviews` (+ `interview_feedbacks`) | **Dual-model merge** |
| `email_ingestion_events` | Requirements source fields **+ optional ledger collection** | Partial |
| `offer_*` / `communication_logs` | `offers` / skip | Empty — no data loss |

### 3.2 Field mapping — Users

| V1 | V2 | Notes |
|---|---|---|
| `id` | `legacyPostgresId` (+ new ObjectId `_id`) | Keep map |
| `email` | `email` | Unique per org |
| `password` | `passwordHash` | Re-verify/migrate hash (likely bcrypt → Argon2id on first login or batch) |
| `firstName`+`lastName` | `name` | Concatenate |
| `role` ADMIN/RECRUITER/LEAD/CANDIDATE | `role` admin/recruiter/lead/(skip or map CANDIDATE) | V1 has **0 ADMIN, 0 CANDIDATE** in live counts |
| `avatar` | `avatarUrl` | |
| `phone` | `phone` | |
| `isActive` | `active` | |
| `lastLoginAt` | `lastLoginAt` | |
| — | `orgId`, `userId`, `teamId`, `capabilities`, OTP fields | V2-required / defaults |
| `location`, `bio`, `submitting_to`, tokens | `legacy.profile` or ignore for UI | Preserve in nested legacy if needed |

**Gap:** V2 has `superadmin`, `devteam`, `client` roles with no V1 equivalent — leave unused or for ops accounts only.

### 3.3 Field mapping — Candidates (critical)

| V1 | V2 target field | Transform |
|---|---|---|
| `id` | `legacyPostgresId` | Required for FK maps |
| `candidate_ref` | `candidateId` **or** `legacy.candidateRef` | Prefer keep human ref; also drive `counters` |
| `name` | `name` | Direct |
| `email` | `email` | Lowercase |
| `phone` / `phone_normalized` | `phone` | Prefer normalized; **42 shared phones** vs V2 unique `(orgId,phone,deletedAt)` |
| `skills` + `technologies` | `skills[]` | Merge/dedupe arrays |
| `education[]` | `legacy.education` or `qualification` | V2 has single `qualification` string — **preserve array in legacy** |
| `total_experience` | `totalExperienceYears` | int → number |
| `relevant_experience` | `relevantExperienceYears` | parse text → number |
| `current_company` | `currentCompany` | |
| `current_location` / `preferred_location` | same | |
| `notice_period` | `noticePeriodDays` | parse text → days |
| `current_salary` / `expected_salary` | `currentCtc` / `expectedCtc` | parse currency text → number |
| `linkedin_url` | `linkedInUrl` | |
| `offer_in_hand` (+ amount/company/details) | `offerInHand` + `legacy.offerInHand*` | Enum coerce No/Yes/… |
| `available_for_interview` | `interviewAvailability` | |
| `reason_for_job_change` | `reasonForChange` | |
| `notes` | `notes` | |
| `highest_qualification` | `qualification` | |
| `resume_url` | via `file_metadata` → `resumeFileId` + `resumeFileName` | Copy files from V1 disk |
| `source_platform` / `source_platform_id` | `legacy.source*` | V2 schema has no source field today — **additive** |
| `created_by` | `sourcedByRecruiterId` | Via user ID map; **16,750 candidates lack created_by** → need fallback user/system |
| `is_active` | `deletedAt` null vs set | |
| `created_at` / `updated_at` | `createdAt` / `updatedAt` | Preserve timestamps |
| — | `orgId`, `status`, `schemaVersion` | Defaults: status from submissions or `New`/`Submitted` |

### 3.4 Field mapping — Clients

| V1 | V2 | Notes |
|---|---|---|
| `id` | `legacyPostgresId` | |
| `client_code` / `id` | `clientId` | Generate if code empty (all codes empty in V1) |
| `name` | `clientName` | Unique per org |
| `poc_*` | `pocContacts[{name,email,phone}]` | |
| `industry` | `domain` | |
| `is_active` | `status` Active/Inactive | |
| `location` | `legacy.location` | Not first-class on V2 Client |

### 3.5 Field mapping — Requirements

| V1 | V2 | Notes |
|---|---|---|
| `id` | `legacyPostgresId` | |
| `requirement_id` | `reqCode` | Unique |
| `client_id` | `clientId` + `clientName` | Resolve map |
| `role_title` | `title` | |
| `location` | `location` | |
| `skills` / `technologies` | `skillsRequired` / `mandatorySkills` | Merge strategy |
| `priority` HIGH/MEDIUM/LOW | same (+ V2 Urgent unused) | |
| `status` | `status` | Map OPEN/ASSIGNED/SUBMITTED/… → V2 strings |
| `assignment` UNASSIGNED/ASSIGNED | `assignmentStatus` | Map to Unassigned/Assigned/… |
| `open_positions` | `openings` | |
| `submissions_count` | `submissionsCount` | Recalculate after load preferred |
| `overall_budget` / yearly / currency | `budgetRange` / `budgetText` | |
| `experience` / `experience_level` | `experienceRange` / `experienceLevel` | Parse ranges |
| `employment_type`, `work_mode`, `notice_period` | same-named V2 fields | |
| `client_jd_id` | `sourceClientJdId` | |
| email source fields | `sourceMessageId`, `sourceSubject`, … | |
| `is_deleted` / `deleted_at` | `deletedAt` | |
| Display names (creator/assigner/recruiter) | denorm or ignore | Prefer resolve from assignments |
| ACTIVE `requirement_assignments` | `assignedRecruiterIds[]` | Collapse current assignees |
| Lead | `assignedLeadId` | Infer from LEAD assigner / submission leads |

### 3.6 Field mapping — Submissions

| V1 | V2 | Notes |
|---|---|---|
| `id` / `submission_ref` | `legacyPostgresId` / `submissionId` | Prefer `SUB-####` |
| `candidate_id`, `requirement_id`, `clientId` | ObjectId refs | Via maps |
| `submitted_by` | `recruiterId` | |
| `assigned_lead_id` | `leadId` | |
| `status` | `stage` | **Enum map required** (see §4) |
| `submitted_on` | `submittedAt` | |
| `forwarded_on` | `clientForwardedAt` | |
| `rejection_reason` | `rejectionReason` | |
| Extra V1 fields (SO number, client feedback, interview snapshot, offer-in-hand on submission) | `legacy.*` | Preserve without breaking V2 stage UI |
| — | `leadApprovalStatus`, `matchScore` | Defaults from status |

### 3.7 Interviews

| V1 | V2 |
|---|---|
| Prefer `interview_rounds` when present; else `interviews` | `interviews` |
| `round` / `round_type` | `round` (string e.g. L1 Technical) |
| `scheduled_at` | `dateTime` |
| `mode`, `meeting_link`, `notes`, status | map |
| `interviewer_*` | required in V2 — default placeholder if missing |
| `feedback` / `rating` / `final_decision` | `interview_feedbacks` |
| `recruiter_id` (legacy only) | `legacy.recruiterId` |
| Dedupe when `legacy_interview_id` links both tables | One V2 interview doc |

### 3.8 Missing collections / structures

| Gap | V1 has | V2 today | Recommendation |
|---|---|---|---|
| Assignment **history** (revoked etc.) | `requirement_assignments` 1,044 | Only current `assignedRecruiterIds[]` | **A)** New `requirement_assignments` collection (additive) **or** **B)** Fold each row into `requirement_histories` with action `ASSIGNED`/`REVOKED` |
| Email ingestion ledger | `email_ingestion_events` 1,285 | Partial fields on `requirements` | Keep `idempotencyKey` on requirements; optional `email_ingestion_events` archive collection |
| Candidate education array / technologies / source | Yes | Partial | Additive `legacy` on candidate |
| Global phone uniqueness | Soft | Hard unique index | Pre-clean or soft-delete duplicates / suffix phones |
| Teams | No | Yes | Optional: auto-create teams by lead from assignments |
| Organizations | No | Required | Single org for all V1 data |
| Offers / comm logs | Empty tables | V2 collections exist | No import |
| V2 attendance / AI / notifications / blacklist | N/A | Yes | Leave empty — features remain |

### 3.9 Incompatible data structures (must resolve in ETL)

1. **ID type:** V1 text PK → V2 ObjectId + business string + `legacyPostgresId`  
2. **Tenancy:** inject one `orgId` everywhere  
3. **Submission status ↔ stage enums** differ in naming and granularity  
4. **Requirement status / assignment enums** differ  
5. **Assignments:** relational history vs embedded array  
6. **Dual interview tables** → single collection  
7. **Resume:** filename on disk → `file_metadata` + storage copy into `STORAGE_ROOT`  
8. **Phone uniqueness** vs V1 duplicate phones  
9. **Candidates without `created_by`** (~80%) vs V2 required `sourcedByRecruiterId`  
10. **Password hashes** algorithm migration  
11. **Salary / notice / experience** often **text** in V1 vs **numbers** in V2  
12. **V2 unique** `(candidateId, requirementId)` already clean in V1 (0 dupes) — good  

---

## 4. Enum mapping (proposed)

### 4.1 Roles

| V1 | V2 |
|---|---|
| LEAD | `lead` |
| RECRUITER | `recruiter` |
| ADMIN (if any) | `admin` |
| CANDIDATE (if any) | **Do not import as app user** (or skip) |

### 4.2 Submission status → V2 `stage`

| V1 `SubmissionStatus` | V2 `stage` | `leadApprovalStatus` hint |
|---|---|---|
| SUBMITTED | `Submitted` | Pending |
| SUBMITTED_TO_LEAD | `Submitted to Lead` | Pending |
| SUBMITTED_TO_CLIENT | `Submitted to Client` | Forwarded/Approved |
| INTERVIEW | `Interview Scheduled` | Approved |
| SELECTED | `Offered` or `Placed` (confirm business rule) | Approved |
| REJECTED | `Rejected` | Rejected |

> Confirm with product: V1 `SELECTED` (4 rows) → V2 `Offered` vs `Placed`.

### 4.3 Requirement status / assignment

| V1 | V2 suggestion |
|---|---|
| OPEN | Open |
| ASSIGNED | Open + assignmentStatus Assigned |
| SUBMITTED / INTERVIEW / SELECTED | Keep readable status string or map to Open/Closed |
| REJECTED / CLOSED | Closed |
| assignment UNASSIGNED/ASSIGNED | Unassigned / Assigned |

Exact V2 free-text `status` allows flexible mapping; prefer **stable map table in ETL config**.

### 4.4 Interview round / mode

| V1 | V2 |
|---|---|
| L1 / L2 / FINAL | `L1 Technical` / `L2 Technical` / `Final` (or keep short codes) |
| PHONE / VIDEO / ONSITE | Phone / Online / Onsite |

---

## 5. Target MongoDB schema design (preserve V1 + keep V2 features)

### 5.1 Principle

- **Do not replace** V2 schemas used by APIs/UI.  
- **Extend additively** with optional fields (Mongoose `@Prop` optional / Mixed).  
- Store irreconcilable extras under **`legacy: { ... }`** per document.  
- Always store **`legacyPostgresId: string`** (indexed, unique per collection where needed).

### 5.2 Additive fields on existing collections (recommended)

| Collection | Add |
|---|---|
| All migrated entities | `legacyPostgresId: string` (indexed) |
| `users` | `legacy: { location?, bio?, submittingTo?, v1Role? }` |
| `candidates` | `legacy: { candidateRef?, education?, technologies?, sourcePlatform?, sourcePlatformId?, experienceLabel?, salariesRaw?, offerInHandDetails?, phoneNormalized? }` |
| `clients` | `legacy: { location?, v1Id? }` |
| `requirements` | `legacy: { experienceRaw?, slaDays?, demandType?, poc fields?, creator names? }` |
| `submissions` | `legacy: { soNumber?, clientFeedback?, interviewSnapshot?, offerInHand*, forwardedBy? }` |
| `interviews` | `legacy: { v1InterviewId?, v1RoundId?, recruiterId?, rating?, finalDecision? }` |

These keep V2 screens working while retaining full V1 fidelity for reports/audit.

### 5.3 Optional new collections (only if product wants first-class history UI later)

| Collection | Purpose | Source |
|---|---|---|
| `requirement_assignments` | Full assignment ledger (ACTIVE/REVOKED) | V1 `requirement_assignments` |
| `email_ingestion_events` | Idempotent mail→JD ledger | V1 same |

If **not** added now: still preserve data by writing equivalent rows into `requirement_histories` / embedding idempotency on `requirements`.

### 5.4 V2-only collections — unchanged

Leave schemas and features as-is; no V1 load required:

`notifications`, `recruiter_login_histories`, `daily_attendance_reports`, `ai_*`, `candidate_blacklist`, `saved_searches`, `email_templates`, `user_audit_logs` (start fresh), `teams` (optional synthesize), `offers` (empty OK).

### 5.5 What “complete recruiter activity history” maps to

| V1 activity | V2 destination |
|---|---|
| Candidates added | `candidates.sourcedByRecruiterId` + timestamps |
| Submissions | `submissions.recruiterId` + stages |
| Assignments | `assignedRecruiterIds` + assignment history store |
| Interviews | `interviews` |
| Status changes | `submission_histories` |
| Requirement timeline | `requirement_histories` / `activity_logs` |
| Performance metrics | Recalculate into `recruiter_analytics` **after** load |

---

## 6. Migration plan (before modifying production data)

### Phase 0 — Preconditions (done / confirm)

- [x] V1 analysis report  
- [x] V2 schema inventory  
- [x] V2 data wipe for clean target (dev)  
- [ ] Freeze plan for V1 writes during final cutover  
- [ ] Backup V1 Postgres + resume disk + (any) V2  
- [ ] Confirm enum decisions (especially SELECTED → Offered/Placed)  
- [ ] Confirm password strategy (force reset vs silent bcrypt→Argon2)  
- [ ] Confirm handling of candidates missing `created_by` and duplicate phones  

### Phase 1 — Mapping workbook & ETL design (no prod write)

1. Build Excel/JSON mapping: every V1 column → V2 path / legacy / drop.  
2. Implement **ID map store** (Postgres id → ObjectId) for users, clients, candidates, requirements, submissions, interviews.  
3. Implement enum maps + parsers (salary, notice, experience).  
4. Dry-run transforms on sample 100 candidates / 50 submissions.  

### Phase 2 — Schema additive migration (code, non-breaking)

1. Add optional `legacyPostgresId` + `legacy` props to Mongoose schemas (backward compatible).  
2. Add unique indexes on `legacyPostgresId` where useful.  
3. Optionally add `requirement_assignments` / `email_ingestion_events` modules **only if** product wants them visible.  
4. Deploy schema changes **before** data load (empty fields OK).  

### Phase 3 — Staging load order

1. `organizations` (single MetaForge)  
2. `roles_permissions` (V2 defaults)  
3. `users` (26 recruiters/leads) — ID map  
4. Optional `teams` synthesis  
5. `clients` (110)  
6. Resume files → storage + `file_metadata`  
7. `candidates` (20,967) + `candidate_documents`  
8. `requirements` (1,799)  
9. Apply **current** assignees from ACTIVE `requirement_assignments`  
10. Archive full assignment history  
11. `submissions` (1,036)  
12. `submission_histories` ← `candidate_status_history`  
13. `requirement_histories` / `activity_logs` ← `requirement_activities`  
14. `interviews` + `interview_feedbacks` ← merge interviews/rounds  
15. `email_ingestion_events` archive or requirement source fields  
16. Reset `counters` for candidateId sequence  
17. Recalculate denorm counts + optional `recruiter_analytics`  

### Phase 4 — Validation gates (go / no-go)

| Check | Pass criteria |
|---|---|
| Counts | users 26, clients 110, candidates 20967, requirements 1799, submissions 1036 (± intentional skips) |
| FK integrity | Every submission’s candidate/requirement/client/recruiter resolves |
| Assignment coverage | ACTIVE assignees appear on requirements |
| Interviews | ≥ distinct submissions covered (≈36–40) after merge/dedupe |
| Histories | status history 138 → submission_histories; activities 4923 accounted for |
| Resumes | file_metadata count ≈ files successfully copied; sample download works |
| Login | All 26 users authenticate; roles correct |
| V2 features smoke | Add candidate, submit, schedule interview, assign requirement, analytics page loads |
| Unique index errors | Zero unexpected duplicate key failures (phones handled) |

### Phase 5 — Production cutover

1. V1 read-only freeze  
2. Final delta export (or full reload if volume allows)  
3. Load into production Mongo  
4. Point recruiters to V2 URL  
5. Keep V1 read-only for hypercare window  
6. Monitor missing links / login / resume access  

### Phase 6 — Post-migrate

- Recalculate analytics  
- Optional password reset campaign  
- Do **not** delete V1 until sign-off  

---

## 7. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| Duplicate phones vs unique index | Candidate load failures | Detect groups; keep one active, soft-delete or uniquify others with legacy note |
| Missing `created_by` | Cannot satisfy `sourcedByRecruiterId` | Assign designated system/lead user; store null creator in `legacy` |
| Password hash format | Login failures | Dual verify (bcrypt+Argon2) already in V2 auth; migrate on login |
| SELECTED/Offered ambiguity | Wrong pipeline stage | Business sign-off on map |
| Resume path mismatch | Broken downloads | Copy 5,330 files; rewrite metadata; verify sample |
| Assignment history loss | Recruiter performance disputes | Persist full assignment ledger |
| Large activity payload | History bloat | Map activities carefully; avoid duplicating huge metadata blindly |
| Teams missing | Lead UI incomplete | Synthesize teams from lead↔recruiter submission/assignment patterns |

---

## 8. What will NOT be done in migration (by design)

- Removing or rewriting V2 APIs/UI features  
- Dropping V2-only collections  
- Inventing offers/comms history (V1 empty)  
- Forcing V1 `CANDIDATE` role users into V2 app roles without decision  
- Merging duplicate candidates automatically (report only; manual later)  

---

## 9. Recommended decision checklist (needed before implementation)

1. Single org name/slug for all V1 data? (**MetaForge** default)  
2. `SELECTED` → `Offered` or `Placed`?  
3. New collections for assignments + email events, or fold into histories only?  
4. Password: silent migrate vs force reset for 26 users?  
5. Fallback owner user for orphans (`created_by` null)?  
6. Keep V1 `candidate_ref` as V2 `candidateId` display id?  
7. Soft-delete strategy for phone-collision losers?  

---

## 10. Next step (when you approve implementation)

1. Lock decisions in §9  
2. Implement additive schema fields (non-breaking)  
3. Build ETL scripts against read-only V1 + empty/staging V2  
4. Staging dry-run + validation report  
5. Production cutover playbook  

---

*End of analysis & migration plan. No database or application runtime changes were made by this document.*
