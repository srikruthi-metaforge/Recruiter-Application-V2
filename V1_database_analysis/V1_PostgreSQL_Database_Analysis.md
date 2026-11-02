# V1 PostgreSQL Database Analysis — Recruiter App (`staffing_db`)

**Analysis type:** READ-ONLY (SELECT / catalog inspection only)  
**Analyzed at:** 2026-10-31 15:38 IST  
**Host:** `192.168.1.190:5432`  
**Database:** `staffing_db`  
**PostgreSQL version:** 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)  
**Database size:** 58 MB  
**Connected role used for analysis:** `root` (read queries only)  
**Application impact:** None — no writes, no schema changes, no migrations, no app restarts  

> This document reports the **actual** live database structure and counts discovered from PostgreSQL system catalogs and `COUNT(*)` queries. Nothing was assumed from application code alone (Prisma schema was used only as secondary cross-check).

---

## 1. Database identity

| Property | Value |
|----------|-------|
| Database name | `staffing_db` |
| Schemas with application objects | `public` only (besides system schemas) |
| Base tables | **14** |
| Views | **0** |
| Triggers | **0** |
| Stored procedures | **0** (`prokind = procedure`) |
| Functions | **9** (all ID/ref generators) |
| Enum types | **10** |
| Sequences | **9** |

### Schemas

| Schema | Notes |
|--------|--------|
| `public` | All application tables, enums, sequences, functions |

---

## 2. Complete table inventory and record counts

Exact `COUNT(*)` at analysis time:

| # | Table | Row count | Historical business data? | Primary key |
|---|-------|-----------|---------------------------|-------------|
| 1 | `candidates` | **20,967** | Yes — candidate repository | `id` |
| 2 | `candidate_status_history` | **138** | Yes — submission status audit | `id` |
| 3 | `clients` | **110** | Yes — client master | `id` |
| 4 | `communication_logs` | **0** | Intended for email/comm logs (empty) | `id` |
| 5 | `email_ingestion_events` | **1,285** | Yes — inbound JD email automation | `id` |
| 6 | `interview_rounds` | **40** | Yes — newer interview rounds model | `id` |
| 7 | `interviews` | **45** | Yes — legacy interview model | `id` |
| 8 | `offer_letters` | **0** | Intended offer letters (empty) | `id` |
| 9 | `offer_management` | **0** | Intended offer mgmt (empty) | `id` |
| 10 | `requirement_activities` | **4,923** | Yes — recruiter/requirement activity log | `id` |
| 11 | `requirement_assignments` | **1,044** | Yes — recruiter assignments | `id` |
| 12 | `requirements` | **1,799** | Yes — job requirements | `id` |
| 13 | `submissions` | **1,036** | Yes — candidate→requirement submissions | `id` |
| 14 | `users` | **26** | Yes — recruiters/leads (app users) | `id` |

**Total tables:** 14  
**Total rows across all tables:** ~31,413

---

## 3. Relationship map (entity overview)

```
users (recruiters / leads)
  │
  ├── created_by ──────────────► candidates
  ├── submitted_by / assigned_lead / forwarded_by ──► submissions
  ├── recruiter_id ────────────► interviews
  ├── recruiter_id / assigned_by ► requirement_assignments
  └── actor_id ────────────────► requirement_activities
                                 candidate_status_history

clients
  └── client_id ───────────────► requirements
        └── requirement_id ────► submissions
              ├── candidate_id ► candidates
              ├── "clientId" ──► clients  (denormalized; matches requirement.client_id for all 1036 rows)
              ├── interviews (legacy)
              ├── interview_rounds
              ├── candidate_status_history
              ├── offer_letters / offer_management (empty)
              └── communication_logs (empty)

email_ingestion_events ── (logical link via requirement_pk / requirement_code; no FK)
```

### How a candidate is identified as submitted to a requirement + client

1. A row in **`submissions`** links:
   - `candidate_id` → `candidates.id`
   - `requirement_id` → `requirements.id`
   - `"clientId"` → `clients.id` (column is camelCase in PostgreSQL)
2. Client is also reachable via `requirements.client_id`.
3. At analysis time: **all 1,036** submissions have `"clientId"` set, and **all match** the parent requirement’s `client_id`.
4. There is **no unique constraint** on `(candidate_id, requirement_id)`, but **0 duplicate pairs** exist currently (app likely enforces uniqueness in code).
5. Human-readable IDs: `submission_ref` / `id` like `SUB-1092`; requirement business id `requirements.requirement_id` like `REQ-2026-10-31-002`; candidate `candidate_ref` like `CAND-2026-10-31-030`.

---

## 4. Enumerations (actual DB enums)

| Enum | Values |
|------|--------|
| `AssignmentStatus` | ACTIVE, REVOKED, COMPLETED |
| `CommunicationLogStatus` | QUEUED, SENT, FAILED |
| `InterviewRoundType` | L1, L2, FINAL |
| `InterviewType` | PHONE, VIDEO, ONSITE |
| `OfferLetterStatus` | DRAFT, RELEASED, ACCEPTED, DECLINED |
| `RequirementAssignmentStatus` | UNASSIGNED, ASSIGNED |
| `RequirementPriority` | HIGH, MEDIUM, LOW |
| `RequirementStatus` | OPEN, ASSIGNED, SUBMITTED, INTERVIEW, SELECTED, REJECTED, CLOSED |
| `SubmissionStatus` | SUBMITTED, INTERVIEW, SELECTED, REJECTED, SUBMITTED_TO_LEAD, SUBMITTED_TO_CLIENT |
| `UserRole` | ADMIN, RECRUITER, LEAD, CANDIDATE |

---

## 5. Sequences

| Sequence | last_value (at analysis) |
|----------|--------------------------|
| `global_candidate_ref_seq` | 16,869 |
| `global_client_pk_seq` | 111 |
| `global_interview_pk_seq` | 60 |
| `global_offer_letter_pk_seq` | 4 |
| `global_requirement_activity_pk_seq` | 5,013 |
| `global_requirement_assignment_pk_seq` | 1,111 |
| `global_requirement_pk_seq` | 1,828 |
| `global_submission_pk_seq` | 1,092 |
| `global_user_code_seq` | 26 |

All sequences: `bigint`, start 1, increment 1, no cycle.

---

## 6. Functions (no stored procedures)

All are **plpgsql ID generators** (no business mutation procedures):

| Function | Purpose (from definition) |
|----------|---------------------------|
| `generate_candidate_ref()` | `CAND-` + sequence (note: many stored refs also use date-style `CAND-YYYY-MM-DD-NNN`) |
| `generate_client_pk()` | `CLIENT-` + zero-padded sequence |
| `generate_interview_pk()` | `int-` + padded sequence |
| `generate_offer_letter_pk()` | `off-` + padded sequence |
| `generate_requirement_activity_pk()` | `req_act-` + padded sequence |
| `generate_requirement_assignment_pk()` | `req_ass-` + padded sequence |
| `generate_requirement_pk()` | `REQ-` + padded sequence (business `requirement_id` is separate) |
| `generate_submission_pk()` | `SUB-` + padded sequence |
| `generate_user_id()` | user id generator |

**Views:** none  
**Triggers:** none  
**Stored procedures:** none  

---

## 7. Primary keys

Every table uses a single-column PK `id` (`text`).

---

## 8. Foreign keys (24)

| From table | Column(s) | To table | On delete |
|------------|-----------|----------|-----------|
| `candidate_status_history` | `changed_by_id` | `users.id` | SET NULL |
| `candidate_status_history` | `submission_id` | `submissions.id` | CASCADE |
| `candidates` | `created_by` | `users.id` | SET NULL |
| `communication_logs` | `requirement_id` | `requirements.id` | CASCADE |
| `communication_logs` | `submission_id` | `submissions.id` | SET NULL |
| `interview_rounds` | `reschedule_of_id` | `interview_rounds.id` | SET NULL |
| `interview_rounds` | `submission_id` | `submissions.id` | CASCADE |
| `interviews` | `recruiter_id` | `users.id` | CASCADE |
| `interviews` | `submission_id` | `submissions.id` | CASCADE |
| `offer_letters` | `released_by_id` | `users.id` | SET NULL |
| `offer_letters` | `submission_id` | `submissions.id` | CASCADE |
| `offer_management` | `submission_id` | `submissions.id` | CASCADE |
| `requirement_activities` | `actor_id` | `users.id` | SET NULL |
| `requirement_activities` | `requirement_id` | `requirements.id` | CASCADE |
| `requirement_assignments` | `assigned_by` | `users.id` | RESTRICT |
| `requirement_assignments` | `recruiter_id` | `users.id` | RESTRICT |
| `requirement_assignments` | `requirement_id` | `requirements.id` | CASCADE |
| `requirements` | `client_id` | `clients.id` | CASCADE |
| `submissions` | `assigned_lead_id` | `users.id` | SET NULL |
| `submissions` | `candidate_id` | `candidates.id` | CASCADE |
| `submissions` | `"clientId"` | `clients.id` | SET NULL |
| `submissions` | `forwarded_by` | `users.id` | SET NULL |
| `submissions` | `requirement_id` | `requirements.id` | CASCADE |
| `submissions` | `submitted_by` | `users.id` | RESTRICT |

---

## 9. Unique indexes / uniqueness (actual)

PostgreSQL unique indexes discovered (act as unique constraints):

| Table | Unique on |
|-------|-----------|
| `candidates` | `email`, `candidate_ref`, `id` |
| `clients` | `client_code` (nullable unique), `id` |
| `email_ingestion_events` | `idempotency_key`, `id` |
| `interview_rounds` | `legacy_interview_id`, `id` |
| `offer_letters` | `submission_id`, `id` |
| `offer_management` | `submission_id`, `legacy_offer_letter_id`, `id` |
| `requirements` | `requirement_id`, `id` |
| `submissions` | `submission_ref`, `id` |
| `users` | `email`, `id` |

---

## 10. Indexes

53 indexes total in `public` (including PKs/uniques). Notable non-PK indexes:

- `candidates`: `phone_normalized`, `created_by`, `created_at DESC`, `updated_at DESC`
- `submissions`: `candidate_id`, `requirement_id`, `status`, `assigned_lead_id`, `submitted_by+submitted_on DESC`, `updated_at DESC`
- `requirements`: `client_id`, `is_deleted+created_at`, `is_deleted+status`, `source_email_graph_message_id`, `updated_at DESC`
- `interviews`: `submission_id`, `recruiter_id`, `recruiter_id+scheduled_at`, `scheduled_at`
- `requirement_assignments`: `recruiter_id+status`, `requirement_id+status+assigned_on`
- `email_ingestion_events`: `graph_message_id`, `status`

Full index definitions were captured from `pg_indexes` during analysis.

---

## 11. Complete column structures

### Table `candidate_status_history` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO |  |
| 2 | `submission_id` | `text` | NO |  |
| 3 | `old_status` | `text` | YES |  |
| 4 | `new_status` | `text` | NO |  |
| 5 | `changed_by_id` | `text` | YES |  |
| 6 | `reason` | `text` | YES |  |
| 7 | `metadata` | `jsonb` | YES |  |
| 8 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |

### Table `candidates` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO |  |
| 2 | `name` | `text` | NO |  |
| 3 | `email` | `text` | NO |  |
| 4 | `phone` | `text` | YES |  |
| 5 | `current_company` | `text` | YES |  |
| 6 | `experience_label` | `text` | YES |  |
| 7 | `total_experience` | `int4` | YES |  |
| 8 | `skills` | `_text` | YES |  |
| 9 | `technologies` | `_text` | YES |  |
| 10 | `education` | `_text` | YES |  |
| 11 | `current_location` | `text` | YES |  |
| 12 | `preferred_location` | `text` | YES |  |
| 13 | `notice_period` | `text` | YES |  |
| 14 | `current_salary` | `text` | YES |  |
| 15 | `expected_salary` | `text` | YES |  |
| 16 | `resume_url` | `text` | YES |  |
| 17 | `source_platform` | `text` | YES |  |
| 18 | `source_platform_id` | `text` | YES |  |
| 19 | `is_active` | `bool` | NO | true |
| 20 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 21 | `updated_at` | `timestamp` | NO |  |
| 22 | `phone_normalized` | `text` | YES |  |
| 23 | `available_for_interview` | `text` | YES |  |
| 24 | `highest_qualification` | `text` | YES |  |
| 25 | `linkedin_url` | `text` | YES |  |
| 26 | `offer_in_hand` | `text` | YES |  |
| 27 | `reason_for_job_change` | `text` | YES |  |
| 28 | `relevant_experience` | `text` | YES |  |
| 29 | `notes` | `text` | YES |  |
| 30 | `offer_in_hand_amount` | `text` | YES |  |
| 31 | `offer_in_hand_company` | `text` | YES |  |
| 32 | `offer_in_hand_details` | `jsonb` | YES |  |
| 33 | `candidate_ref` | `text` | YES | generate_candidate_ref() |
| 34 | `created_by` | `text` | YES |  |

### Table `clients` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO | generate_client_pk() |
| 2 | `name` | `text` | NO |  |
| 3 | `poc_name` | `text` | NO |  |
| 4 | `poc_email` | `text` | NO |  |
| 5 | `poc_phone` | `text` | YES |  |
| 6 | `industry` | `text` | YES |  |
| 7 | `location` | `text` | YES |  |
| 8 | `is_active` | `bool` | NO | true |
| 9 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 10 | `updated_at` | `timestamp` | NO |  |
| 11 | `client_code` | `text` | YES |  |

### Table `communication_logs` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO |  |
| 2 | `type` | `text` | NO |  |
| 3 | `recipient` | `text` | NO |  |
| 4 | `subject` | `text` | YES |  |
| 5 | `status` | `CommunicationLogStatus` | NO |  |
| 6 | `provider_message_id` | `text` | YES |  |
| 7 | `requirement_id` | `text` | YES |  |
| 8 | `submission_id` | `text` | YES |  |
| 9 | `body` | `text` | YES |  |
| 10 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |

### Table `email_ingestion_events` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO |  |
| 2 | `idempotency_key` | `text` | NO |  |
| 3 | `graph_message_id` | `text` | YES |  |
| 4 | `internet_message_id` | `text` | YES |  |
| 5 | `source` | `text` | NO | 'EMAIL_AUTOMATION'::text |
| 6 | `status` | `text` | NO | 'PENDING'::text |
| 7 | `error_message` | `text` | YES |  |
| 8 | `requirement_pk` | `text` | YES |  |
| 9 | `requirement_code` | `text` | YES |  |
| 10 | `payload` | `jsonb` | YES |  |
| 11 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 12 | `updated_at` | `timestamp` | NO |  |

### Table `interview_rounds` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO |  |
| 2 | `submission_id` | `text` | NO |  |
| 3 | `legacy_interview_id` | `text` | YES |  |
| 4 | `round_type` | `InterviewRoundType` | NO |  |
| 5 | `timezone` | `text` | YES |  |
| 6 | `interviewer_name` | `text` | YES |  |
| 7 | `interviewer_email` | `text` | YES |  |
| 8 | `mode` | `text` | NO |  |
| 9 | `status` | `text` | NO |  |
| 10 | `scheduled_at` | `timestamp` | NO |  |
| 11 | `location` | `text` | YES |  |
| 12 | `meeting_link` | `text` | YES |  |
| 13 | `notes` | `text` | YES |  |
| 14 | `feedback` | `text` | YES |  |
| 15 | `rating` | `int4` | YES |  |
| 16 | `final_decision` | `SubmissionStatus` | YES |  |
| 17 | `reschedule_count` | `int4` | NO | 0 |
| 18 | `reschedule_history` | `jsonb` | YES |  |
| 19 | `reschedule_of_id` | `text` | YES |  |
| 20 | `candidate_confirmed_at` | `timestamp` | YES |  |
| 21 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 22 | `updated_at` | `timestamp` | NO |  |

### Table `interviews` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO | generate_interview_pk() |
| 2 | `submission_id` | `text` | NO |  |
| 3 | `recruiter_id` | `text` | NO |  |
| 4 | `round` | `text` | NO |  |
| 5 | `mode` | `text` | NO |  |
| 6 | `status` | `text` | NO |  |
| 7 | `scheduled_at` | `timestamp` | NO |  |
| 8 | `location` | `text` | YES |  |
| 9 | `meeting_link` | `text` | YES |  |
| 10 | `notes` | `text` | YES |  |
| 11 | `feedback` | `text` | YES |  |
| 12 | `rating` | `int4` | YES |  |
| 13 | `final_decision` | `SubmissionStatus` | YES |  |
| 14 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 15 | `updated_at` | `timestamp` | NO |  |

### Table `offer_letters` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO | generate_offer_letter_pk() |
| 2 | `submission_id` | `text` | NO |  |
| 3 | `status` | `OfferLetterStatus` | NO | 'DRAFT'::"OfferLetterStatus" |
| 4 | `position_title` | `text` | YES |  |
| 5 | `compensation` | `text` | YES |  |
| 6 | `joining_date` | `timestamp` | YES |  |
| 7 | `valid_until` | `timestamp` | YES |  |
| 8 | `terms` | `text` | YES |  |
| 9 | `letter_content` | `text` | YES |  |
| 10 | `released_at` | `timestamp` | YES |  |
| 11 | `released_by_id` | `text` | YES |  |
| 12 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 13 | `updated_at` | `timestamp` | NO |  |
| 14 | `accepted_joining_date` | `timestamp` | YES |  |
| 15 | `decline_reason` | `text` | YES |  |

### Table `offer_management` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO |  |
| 2 | `submission_id` | `text` | NO |  |
| 3 | `legacy_offer_letter_id` | `text` | YES |  |
| 4 | `status` | `OfferLetterStatus` | NO | 'DRAFT'::"OfferLetterStatus" |
| 5 | `offered_ctc` | `numeric` | YES |  |
| 6 | `currency` | `text` | YES |  |
| 7 | `hr_notes` | `text` | YES |  |
| 8 | `offer_expiry_date` | `timestamp` | YES |  |
| 9 | `accepted_at` | `timestamp` | YES |  |
| 10 | `declined_at` | `timestamp` | YES |  |
| 11 | `position_title` | `text` | YES |  |
| 12 | `compensation` | `text` | YES |  |
| 13 | `joining_date` | `timestamp` | YES |  |
| 14 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 15 | `updated_at` | `timestamp` | NO |  |

### Table `requirement_activities` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO | generate_requirement_activity_pk() |
| 2 | `requirement_id` | `text` | NO |  |
| 3 | `actor_id` | `text` | YES |  |
| 4 | `action` | `text` | NO |  |
| 5 | `summary` | `text` | NO |  |
| 6 | `metadata` | `jsonb` | YES |  |
| 7 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |

### Table `requirement_assignments` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO | generate_requirement_assignment_pk() |
| 2 | `requirement_id` | `text` | NO |  |
| 3 | `recruiter_id` | `text` | NO |  |
| 4 | `assigned_by` | `text` | NO |  |
| 5 | `assigned_on` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 6 | `status` | `AssignmentStatus` | NO | 'ACTIVE'::"AssignmentStatus" |
| 7 | `notes` | `text` | YES |  |
| 8 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 9 | `updated_at` | `timestamp` | NO |  |

### Table `requirements` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO | generate_requirement_pk() |
| 2 | `requirement_id` | `text` | NO |  |
| 3 | `client_id` | `text` | NO |  |
| 4 | `client_lead_poc` | `text` | NO |  |
| 5 | `client_poc` | `text` | YES |  |
| 6 | `role_title` | `text` | NO |  |
| 7 | `location` | `text` | NO |  |
| 8 | `experience` | `text` | YES |  |
| 9 | `experience_level` | `text` | YES |  |
| 10 | `employment_type` | `text` | YES |  |
| 11 | `work_mode` | `text` | YES |  |
| 12 | `notice_period` | `text` | YES |  |
| 13 | `skills` | `_text` | YES |  |
| 14 | `technologies` | `_text` | YES |  |
| 15 | `priority` | `RequirementPriority` | NO | 'MEDIUM'::"RequirementPriority" |
| 16 | `open_positions` | `int4` | YES |  |
| 17 | `sla_days` | `int4` | NO | 10 |
| 18 | `submitting_to` | `text` | YES |  |
| 19 | `client_jd_id` | `text` | YES |  |
| 20 | `status` | `RequirementStatus` | NO | 'OPEN'::"RequirementStatus" |
| 21 | `assignment` | `RequirementAssignmentStatus` | NO | 'UNASSIGNED'::"RequirementAssignmentStatus" |
| 22 | `submissions_count` | `int4` | NO | 0 |
| 23 | `is_deleted` | `bool` | NO | false |
| 24 | `deleted_at` | `timestamp` | YES |  |
| 25 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 26 | `updated_at` | `timestamp` | NO |  |
| 27 | `overall_budget` | `float8` | YES |  |
| 28 | `closed_date` | `timestamp` | YES |  |
| 29 | `demand_type` | `text` | YES |  |
| 30 | `internal_poc` | `text` | YES |  |
| 31 | `budget_currency` | `text` | NO | 'INR'::text |
| 32 | `monthly_budget_inr` | `float8` | YES |  |
| 33 | `yearly_budget_inr` | `float8` | YES |  |
| 34 | `assigned_to_recruiter_name` | `text` | YES |  |
| 35 | `assignment_assigner_name` | `text` | YES |  |
| 36 | `requirement_creator_name` | `text` | YES |  |
| 37 | `source_email_graph_message_id` | `text` | YES |  |
| 38 | `source_email_internet_message_id` | `text` | YES |  |
| 39 | `source_email_mailbox` | `text` | YES |  |
| 40 | `source_email_subject` | `text` | YES |  |

### Table `submissions` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO | generate_submission_pk() |
| 2 | `requirement_id` | `text` | NO |  |
| 3 | `candidate_id` | `text` | NO |  |
| 4 | `submitted_by` | `text` | NO |  |
| 5 | `submitted_on` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 6 | `status` | `SubmissionStatus` | NO | 'SUBMITTED'::"SubmissionStatus" |
| 7 | `reason_for_job_change` | `text` | YES |  |
| 8 | `offer_in_hand` | `text` | YES |  |
| 9 | `relevant_experience` | `text` | YES |  |
| 10 | `so_number` | `text` | YES |  |
| 11 | `client_feedback` | `text` | YES |  |
| 12 | `client_decision_date` | `timestamp` | YES |  |
| 13 | `interview_date` | `timestamp` | YES |  |
| 14 | `interview_location` | `text` | YES |  |
| 15 | `interview_type` | `InterviewType` | YES |  |
| 16 | `selected_date` | `timestamp` | YES |  |
| 17 | `rejection_reason` | `text` | YES |  |
| 18 | `email_sent` | `bool` | NO | false |
| 19 | `email_sent_date` | `timestamp` | YES |  |
| 20 | `created_at` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 21 | `updated_at` | `timestamp` | NO |  |
| 22 | `clientId` | `text` | YES |  |
| 23 | `offer_in_hand_amount` | `text` | YES |  |
| 24 | `offer_in_hand_company` | `text` | YES |  |
| 25 | `offer_in_hand_details` | `jsonb` | YES |  |
| 26 | `submission_ref` | `text` | YES |  |
| 27 | `assigned_lead_id` | `text` | YES |  |
| 28 | `assigned_lead_name` | `text` | YES |  |
| 29 | `forwarded_by` | `text` | YES |  |
| 30 | `forwarded_on` | `timestamp` | YES |  |

### Table `users` — columns

| # | Column | Type (udt) | Nullable | Default |
|---|--------|------------|----------|---------|
| 1 | `id` | `text` | NO |  |
| 2 | `email` | `text` | NO |  |
| 3 | `password` | `text` | NO |  |
| 4 | `firstName` | `text` | NO |  |
| 5 | `lastName` | `text` | NO |  |
| 6 | `role` | `UserRole` | NO | 'CANDIDATE'::"UserRole" |
| 7 | `avatar` | `text` | YES |  |
| 8 | `phone` | `text` | YES |  |
| 9 | `location` | `text` | YES |  |
| 10 | `bio` | `text` | YES |  |
| 11 | `isActive` | `bool` | NO | true |
| 12 | `lastLoginAt` | `timestamp` | YES |  |
| 13 | `createdAt` | `timestamp` | NO | CURRENT_TIMESTAMP |
| 14 | `updatedAt` | `timestamp` | NO |  |
| 15 | `emailVerified` | `bool` | NO | false |
| 16 | `login_preference` | `text` | NO | 'password'::text |
| 17 | `verification_token` | `text` | YES |  |
| 18 | `reset_token` | `text` | YES |  |
| 19 | `reset_token_expires` | `timestamp` | YES |  |
| 20 | `login_otp_expires` | `timestamp` | YES |  |
| 21 | `login_otp_hash` | `text` | YES |  |
| 22 | `submitting_to` | `text` | YES |  |

---

## 12. Candidate repository analysis

### Tables involved

| Table | Role |
|-------|------|
| `candidates` | **Primary** candidate repository (one row per candidate) |
| `submissions` | Links candidates to requirements/clients |
| `candidate_status_history` | Status change history **per submission** (not per candidate master) |
| `interviews` / `interview_rounds` | Interview history via submission |
| Filesystem `backend/uploads/resumes/` | Resume binary files referenced by `resume_url` |

Candidate master data is **not** spread across many tables for profile fields — it lives mainly in **`candidates`**. Related process data (submissions/interviews/status) is in child tables.

### Totals

| Metric | Value |
|--------|-------|
| Total candidates | **20,967** |
| Active (`is_active`) | 20,967 |
| Inactive | 0 |
| With `resume_url` | 4,487 |
| Without `resume_url` | 16,480 |
| With `created_by` (recruiter association) | 4,217 |
| Distinct creators | 21 |
| Earliest `created_at` | 2026-04-08 |
| Latest `created_at` | 2026-10-31 |
| Candidates with ≥1 submission | **980** |
| Candidates with no submissions | **19,987** |

### Key fields

- **IDs:** `id` (internal PK, often numeric-looking text / cuid-style), `candidate_ref` (human-readable, unique)
- **Contact:** `email` (unique, required), `phone`, `phone_normalized`
- **Profile:** `name`, `skills[]`, `technologies[]`, `education[]`, `total_experience`, `experience_label`, `current_location`, `preferred_location`, salaries, notice period, LinkedIn, notes, offer-in-hand fields
- **Status flag:** `is_active` (boolean on candidate; submission pipeline status is on `submissions.status`)
- **Resume:** `resume_url` (filename / relative reference — see Resume Storage)
- **Recruiter association:** `created_by` → `users.id`
- **Source:** `source_platform` / `source_platform_id`

### Source platform mix

| source_platform | Count |
|-----------------|-------|
| Excel Import | 15,881 |
| (null) | 3,058 |
| LinkedIn | 1,338 |
| Hot Vacancy | 593 |
| Resume Import | 97 |

### Duplicate identification (read-only findings)

| Check | Result |
|-------|--------|
| Duplicate emails | **0** (enforced by unique index) |
| Duplicate `phone_normalized` groups | **42** phone numbers shared by 2+ candidates |
| Same lower(name)+phone pairs | At least 10 pairs (examples: pavithra, selvam anbazhagan, …) |

> No records were merged or changed. Duplicates are reported for awareness only.

### Candidate ↔ submission ↔ interview linkage

- `candidates.id` ← `submissions.candidate_id`
- `submissions.id` ← `interviews.submission_id` and `interview_rounds.submission_id`
- `submissions.id` ← `candidate_status_history.submission_id`

---

## 13. Resume storage analysis

| Aspect | Finding |
|--------|---------|
| DB field | `candidates.resume_url` (`text`, nullable) |
| Pattern observed | Mostly **bare filenames** (e.g. `name_email-timestamp.pdf`), not full `http://` or `s3://` URLs |
| With resume_url | 4,487 / 20,967 (~21%) |
| Filesystem store | `/data/applications/recruiter_app/backend/uploads/resumes/` |
| Files on disk at analysis | **5,330** files (~**1.2 GB**) |
| MinIO | Configured in `.env` (`MINIO_BUCKET=recruiter-platform`) but **not reachable** during backup/analysis; live resumes are primarily on local disk |
| In PostgreSQL? | **No** — resume binaries are not BLOBs in the DB |

---

## 14. Requirements and clients

### Clients (`clients`) — 110 rows

- PK: `id` (e.g. `CLIENT-109`) via `generate_client_pk()`
- Important columns: `name`, `poc_name`, `poc_email`, `poc_phone`, `industry`, `location`, `is_active`, `client_code` (unique, currently **0 filled**)
- All 110 marked active
- Related: `requirements.client_id`, `submissions."clientId"`

### Requirements (`requirements`) — 1,799 rows

| Metric | Value |
|--------|-------|
| Total | 1,799 |
| Soft-deleted (`is_deleted`) | 0 |
| Distinct clients | 104 |

**Status mix (not deleted):** OPEN 1331, SUBMITTED 461, CLOSED 3, REJECTED 2, ASSIGNED 1, SELECTED 1  

**Assignment enum:** UNASSIGNED 1087, ASSIGNED 712  

**Important columns:** `requirement_id` (unique business code), `client_id`, role/location/skills/technologies, budgets, priority/status/assignment, SLA, email source fields, creator/assigner display names, `submissions_count`

**Related tables:** `requirement_assignments`, `requirement_activities`, `submissions`, `communication_logs`, `email_ingestion_events` (logical)

---

## 15. Submission history analysis (critical)

### Table: `submissions` — **1,036** rows

| Metric | Value |
|--------|-------|
| Earliest `submitted_on` | 2026-05-19 |
| Latest `submitted_on` | 2026-10-31 |
| Distinct candidates | 980 |
| Distinct requirements | 439 |
| Distinct clients (on submission `"clientId"`) | 54 |
| Distinct submitters | 20 |
| Rows with `submission_ref` | 1,036 (all unique) |
| Duplicate (candidate_id, requirement_id) pairs | **0** |

### Status distribution

| Status | Count |
|--------|-------|
| SUBMITTED_TO_CLIENT | 752 |
| SUBMITTED_TO_LEAD | 199 |
| SUBMITTED | 77 |
| REJECTED | 4 |
| SELECTED | 4 |
| INTERVIEW | 0 |

### Important columns

- IDs: `id` / `submission_ref` (e.g. `SUB-1092`)
- Links: `candidate_id`, `requirement_id`, `"clientId"`, `submitted_by`, `assigned_lead_id`, `forwarded_by` / `forwarded_on`
- Dates: `submitted_on`, `created_at`, `updated_at`, interview/selected/client decision dates
- Status: `status` (`SubmissionStatus`)
- Feedback / offer / SO number / email_sent flags

### Status history

- Table: `candidate_status_history` — **138** rows covering **135** distinct submissions
- Recent `new_status` values observed: SUBMITTED_TO_CLIENT (133), SELECTED (3), REJECTED (2)
- Also mirrored in `requirement_activities` actions such as `submission.status_changed` (144), `submission.forwarded_to_client` (133)

### Related interviews

| Source | Distinct submissions covered |
|--------|------------------------------|
| `interviews` (legacy) | 36 |
| `interview_rounds` | 32 |
| With status history | 135 |

---

## 16. Interview analysis

### Dual model (both present)

| Table | Rows | Notes |
|-------|------|-------|
| `interviews` | **45** | Legacy; has `recruiter_id`; rounds as text (`L1`/`L2`/`Final`) |
| `interview_rounds` | **40** | Newer; `round_type` enum; optional `legacy_interview_id` link |

### Legacy `interviews`

- Distinct submissions: 36; distinct recruiters: 10
- Status: Scheduled 33, Completed 12
- Round: L1 37, Final 6, L2 2
- Date range: 2026-05-21 → 2026-10-29

### `interview_rounds`

- Distinct submissions: 32
- Types: L1 33, FINAL 5, L2 2
- Status: Scheduled 31, Completed 9

Offers tables (`offer_letters`, `offer_management`) exist structurally but have **0** rows.

---

## 17. Recruiters / users and activity

### `users` — 26

| Role | Count | Active |
|------|-------|--------|
| LEAD | 18 | 18 |
| RECRUITER | 8 | 8 |
| ADMIN / CANDIDATE | 0 | — |

### Performance-related data locations (read-only map)

| Metric idea | Where it lives |
|-------------|----------------|
| Candidates created | `candidates.created_by` |
| Submissions made | `submissions.submitted_by` |
| Requirements assigned | `requirement_assignments.recruiter_id` |
| Interviews scheduled | `interviews.recruiter_id` |
| Activity / audit trail | `requirement_activities` (4,923 rows) |
| Status transitions | `candidate_status_history` |

Top candidate creators and top submitters were measured during analysis (LEAD users dominate). No performance numbers were modified.

### `requirement_assignments` — 1,044

- ACTIVE 1,003; REVOKED 41

### `requirement_activities` — 4,923

Top actions include CREATED, ASSIGNED, `submission.created`, status changes, interview.scheduled, and some security audit events.

### `email_ingestion_events` — 1,285

- CREATED 1,277; DEDUPED 8  
- Dedup via unique `idempotency_key`

---

## 18. Additional tables (summary)

| Table | Purpose | Rows | PK | Related |
|-------|---------|------|----|---------|
| `communication_logs` | Outbound/inbound communication audit | 0 | `id` | requirements, submissions |
| `offer_letters` | Offer letter documents/status | 0 | `id` | submissions, users |
| `offer_management` | Parallel offer record model | 0 | `id` | submissions |
| `email_ingestion_events` | Email→requirement automation ledger | 1,285 | `id` | logical → requirements |
| `candidate_status_history` | Submission status audit | 138 | `id` | submissions, users |
| `requirement_activities` | Requirement timeline / recruiter actions | 4,923 | `id` | requirements, users |
| `requirement_assignments` | Recruiter assignment history | 1,044 | `id` | requirements, users |

---

## 19. Safety attestation

During this analysis the following were **NOT** performed:

- No `INSERT` / `UPDATE` / `DELETE`
- No DDL / migrations / schema changes
- No application code changes
- No recruiter performance or status modifications
- No candidate merges
- No service restarts

Only `SELECT` / catalog queries and filesystem inspection of resume storage counts were used.

---

## 20. Appendix — sample live linkage (read-only)

Example of the core join path (latest submissions at analysis time):

| submission | candidate_ref | requirement_id | client | submitter |
|------------|---------------|----------------|--------|-----------|
| SUB-1092 | CAND-2026-10-31-030 | REQ-2026-10-31-002 | kallol | pavani.j@… |
| SUB-1091 | CAND-2026-10-31-025 | REQ-2026-10-30-003 | Kallol.Chakraborty@Ltts.com | sandhya.d@… |
| SUB-1090 | CAND-2026-10-31-023 | REQ-2026-10-30-003 | Kallol.Chakraborty@Ltts.com | pavani.j@… |

---

*End of V1 PostgreSQL Database Analysis document.*
