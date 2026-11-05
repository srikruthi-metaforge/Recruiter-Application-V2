/**
 * V1 PostgreSQL (Docker restore) → V2 MongoDB ETL
 * - Default: --dry-run (no Mongo writes)
 * - Apply: --apply (inserts into cleaned Mongo; keeps existing test logins)
 * Does NOT modify frontend/backend application source.
 */
const path = require('path');
const fs = require('fs');
const { Client } = require('pg');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));
const { ObjectId } = mongoose.Types;
const {
  ROLE_MAP,
  SUBMISSION_STAGE_MAP,
  REQUIREMENT_STATUS_MAP,
  REQUIREMENT_ASSIGNMENT_STATUS_MAP,
  PRIORITY_MAP,
  INTERVIEW_ROUND_MAP,
  INTERVIEW_MODE_MAP,
  mapOfferInHand,
  parseNumberLoose,
  parseNoticeDays,
  normalizePhone,
  normalizeEmail,
  LOAD_ORDER,
} = require('./mapping');

const args = new Set(process.argv.slice(2));
const DRY_RUN = !args.has('--apply');
const APPLY = args.has('--apply');

const PG = {
  host: process.env.V1_PG_HOST || '127.0.0.1',
  port: Number(process.env.V1_PG_PORT || 5433),
  user: process.env.V1_PG_USER || 'postgres',
  password: process.env.V1_PG_PASSWORD || 'v1restore',
  database: process.env.V1_PG_DATABASE || 'staffing_db_v1_restore',
};

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const MONGO_DB = process.env.MONGODB_DB_NAME || 'metaforge_recruiter_v2';

const KEEP_LOGIN_EMAILS = new Set([
  'superadmin@metaforge.local',
  'admin@metaforge.local',
  'lead@metaforge.local',
  'recruiter@metaforge.local',
  'devteam@metaforge.local',
  'client@metaforge.local',
  'r.haines@talentflow.io',
  'd.park@talentflow.io',
  'harish.g@metaforgeit.com',
  'm.chen@talentflow.io',
  'dev.team@talentflow.io',
  'client@accenture.com',
]);

function oid() {
  return new ObjectId();
}

async function pgAll(client, sql, params = []) {
  const res = await client.query(sql, params);
  return res.rows;
}

async function main() {
  console.log('=== V1 → V2 ETL ===');
  console.log(`Mode: ${APPLY ? 'APPLY (writes Mongo)' : 'DRY-RUN (no Mongo writes)'}`);
  console.log(`Postgres: ${PG.host}:${PG.port}/${PG.database}`);
  console.log(`Mongo: ${MONGO_URI} / ${MONGO_DB}`);
  console.log(`Load order: ${LOAD_ORDER.join(' → ')}`);

  const pg = new Client(PG);
  await pg.connect();

  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB });
  const db = mongoose.connection.db;

  const org = await db.collection('organizations').findOne({});
  if (!org) {
    throw new Error('No organization in Mongo — abort. Keep MetaForge org before ETL.');
  }
  const orgId = org._id;
  console.log(`Using org: ${org.name || org.slug} (${orgId})`);

  const keptUsers = await db.collection('users').find({}).toArray();
  console.log(`Existing V2 login users kept: ${keptUsers.length}`);

  // --- V1 counts ---
  const tables = [
    'users',
    'clients',
    'candidates',
    'requirements',
    'requirement_assignments',
    'requirement_activities',
    'submissions',
    'candidate_status_history',
    'interviews',
    'interview_rounds',
    'email_ingestion_events',
  ];
  const v1Counts = {};
  for (const t of tables) {
    const rows = await pgAll(pg, `SELECT COUNT(*)::int AS c FROM ${t}`);
    v1Counts[t] = rows[0].c;
  }
  console.log('\nV1 source counts:', v1Counts);

  // Risk scans
  const phoneDupes = await pgAll(
    pg,
    `SELECT COALESCE(NULLIF(phone_normalized,''), regexp_replace(COALESCE(phone,''),'\\D','','g')) AS p, COUNT(*)::int AS c
     FROM candidates
     WHERE COALESCE(phone,'') <> '' OR COALESCE(phone_normalized,'') <> ''
     GROUP BY 1 HAVING COUNT(*) > 1
     ORDER BY c DESC LIMIT 10`,
  );
  const missingCreatedBy = (
    await pgAll(pg, `SELECT COUNT(*)::int AS c FROM candidates WHERE created_by IS NULL`)
  )[0].c;
  const missingEmail = (
    await pgAll(pg, `SELECT COUNT(*)::int AS c FROM candidates WHERE email IS NULL OR trim(email)=''`)
  )[0].c;
  const usersNoEmail = (
    await pgAll(pg, `SELECT COUNT(*)::int AS c FROM users WHERE email IS NULL OR trim(email)=''`)
  )[0].c;

  console.log('\nRisk scan:');
  console.log(`  candidates missing created_by: ${missingCreatedBy}`);
  console.log(`  candidates missing email: ${missingEmail}`);
  console.log(`  users missing email: ${usersNoEmail}`);
  console.log(`  top phone-duplicate groups: ${phoneDupes.length} (showing up to 10)`);
  phoneDupes.slice(0, 5).forEach((r) => console.log(`    phone=${r.p} count=${r.c}`));

  // ID maps (legacy text → ObjectId)
  const userMap = new Map(); // v1 user id -> ObjectId
  const clientMap = new Map();
  const candidateMap = new Map();
  const requirementMap = new Map();
  const submissionMap = new Map();

  // Seed map for kept users by email (if V1 later matches)
  for (const u of keptUsers) {
    const em = normalizeEmail(u.email);
    if (em) userMap.set(`email:${em}`, u._id);
  }

  // Fallback recruiter = kept recruiter or lead
  const fallbackRecruiter =
    keptUsers.find((u) => String(u.role).toLowerCase() === 'recruiter') ||
    keptUsers.find((u) => String(u.role).toLowerCase() === 'lead') ||
    keptUsers[0];
  if (!fallbackRecruiter) throw new Error('No fallback V2 user for sourcedByRecruiterId');
  console.log(`Fallback recruiter: ${fallbackRecruiter.email} (${fallbackRecruiter._id})`);

  // -------- USERS --------
  // Prefer already-migrated V1 users (re-run safe)
  const alreadyMigratedUsers = await db
    .collection('users')
    .find(
      { legacyPostgresId: { $type: 'string', $gt: '' } },
      { projection: { _id: 1, legacyPostgresId: 1, email: 1 } },
    )
    .toArray();
  for (const u of alreadyMigratedUsers) {
    userMap.set(u.legacyPostgresId, u._id);
    if (u.email) userMap.set(`email:${normalizeEmail(u.email)}`, u._id);
  }

  const v1Users = await pgAll(
    pg,
    `SELECT id, email, password, "firstName", "lastName", role, avatar, phone, "isActive", "lastLoginAt", "createdAt", "updatedAt", location, bio
     FROM users ORDER BY id`,
  );
  const userDocs = [];
  let usersSkipped = 0;
  for (const u of v1Users) {
    const role = ROLE_MAP[u.role];
    if (!role) {
      usersSkipped++;
      continue;
    }
    const email = normalizeEmail(u.email);
    if (!email) {
      usersSkipped++;
      continue;
    }
    if (userMap.has(u.id)) {
      usersSkipped++;
      continue; // already migrated
    }
    if (KEEP_LOGIN_EMAILS.has(email) || userMap.has(`email:${email}`)) {
      // Map V1 id to existing kept user ObjectId when email matches
      const existingId = userMap.get(`email:${email}`);
      if (existingId) userMap.set(u.id, existingId);
      usersSkipped++;
      continue;
    }
    const _id = oid();
    userMap.set(u.id, _id);
    userMap.set(`email:${email}`, _id);
    userDocs.push({
      _id,
      orgId,
      userId: `v1-${u.id}`,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || email,
      email,
      passwordHash: u.password, // bcrypt; V2 auth migrates to argon2 on login
      role,
      teamId: null,
      clientId: null,
      avatarUrl: u.avatar || null,
      phone: u.phone || null,
      active: u.isActive !== false,
      capabilities: {},
      lastLoginAt: u.lastLoginAt || null,
      deletedAt: null,
      legacyPostgresId: u.id,
      legacy: { location: u.location || null, bio: u.bio || null, v1Role: u.role },
      schemaVersion: 1,
      createdAt: u.createdAt || new Date(),
      updatedAt: u.updatedAt || new Date(),
    });
  }
  console.log(`\nUsers to insert: ${userDocs.length} (skipped ${usersSkipped})`);

  // -------- CLIENTS --------
  const v1Clients = await pgAll(pg, `SELECT * FROM clients ORDER BY id`);
  const clientNameSeen = new Map(); // lower(name) -> count
  const clientDocs = v1Clients.map((c, i) => {
    const _id = oid();
    clientMap.set(c.id, _id);
    const baseName = String(c.name || `Client-${i + 1}`).trim() || `Client-${i + 1}`;
    const key = baseName.toLowerCase();
    const seen = clientNameSeen.get(key) || 0;
    clientNameSeen.set(key, seen + 1);
    const clientName = seen === 0 ? baseName : `${baseName} (${seen + 1})`;
    return {
      _id,
      orgId,
      clientId: c.client_code || `CLIENT-V1-${String(i + 1).padStart(4, '0')}`,
      clientName,
      domain: c.industry || 'Information Technology',
      tier: 'Tier-1',
      status: c.is_active === false ? 'Inactive' : 'Active',
      slaDays: 5,
      pocContacts: [
        {
          name: c.poc_name || 'POC',
          email: c.poc_email || '',
          phone: c.poc_phone || undefined,
        },
      ].filter((p) => p.email || p.name),
      accountLeadId: null,
      deliveryGapScore: 0,
      agreementsUrl: null,
      deletedAt: null,
      legacyPostgresId: c.id,
      legacy: {
        location: c.location || null,
        v1Id: c.id,
        originalClientName: baseName !== clientName ? baseName : null,
      },
      schemaVersion: 1,
      createdAt: c.created_at || new Date(),
      updatedAt: c.updated_at || new Date(),
    };
  });
  console.log(`Clients to insert: ${clientDocs.length}`);

  // -------- CANDIDATES --------
  const v1Candidates = await pgAll(pg, `SELECT * FROM candidates ORDER BY created_at`);
  const phoneSeen = new Map();
  const emailSeen = new Set();
  const candidateDocs = [];
  let candSkipped = 0;
  let phoneDeduped = 0;
  for (const c of v1Candidates) {
    let email = normalizeEmail(c.email);
    if (!email) {
      email = `missing+${String(c.id).replace(/[^a-zA-Z0-9]/g, '')}@legacy.invalid`;
    }
    if (emailSeen.has(email)) {
      email = `dup+${String(c.id).replace(/[^a-zA-Z0-9]/g, '')}@legacy.invalid`;
      candSkipped++; // still import with synthetic email
    }
    emailSeen.add(email);

    let phone = normalizePhone(c.phone_normalized || c.phone);
    if (!phone) phone = `000${String(candidateDocs.length + 1).padStart(7, '0')}`.slice(-10);
    if (phoneSeen.has(phone)) {
      phoneDeduped++;
      phone = `${phone}${phoneSeen.get(phone)}`.slice(0, 15);
      phoneSeen.set(normalizePhone(c.phone_normalized || c.phone), (phoneSeen.get(normalizePhone(c.phone_normalized || c.phone)) || 1) + 1);
    } else {
      phoneSeen.set(phone, 1);
    }

    const sourced =
      (c.created_by && userMap.get(c.created_by)) || fallbackRecruiter._id;

    const skills = [
      ...(Array.isArray(c.skills) ? c.skills : []),
      ...(Array.isArray(c.technologies) ? c.technologies : []),
    ]
      .map((s) => String(s || '').trim())
      .filter(Boolean);

    const _id = oid();
    candidateMap.set(c.id, _id);
    // Prefer stable unique business id from V1 PK (candidate_ref can collide / be non-unique).
    const candidateId = `V1-${String(c.id)}`.slice(0, 64);

    candidateDocs.push({
      _id,
      orgId,
      candidateId,
      name: c.name || email,
      email,
      phone,
      linkedInUrl: c.linkedin_url || null,
      currentCompany: c.current_company || null,
      qualification: c.highest_qualification || null,
      totalExperienceYears: parseNumberLoose(c.total_experience, 0),
      relevantExperienceYears: parseNumberLoose(c.relevant_experience, 0),
      currentCtc: parseNumberLoose(c.current_salary, 0),
      expectedCtc: parseNumberLoose(c.expected_salary, 0),
      noticePeriodDays: parseNoticeDays(c.notice_period, 30),
      currentLocation: c.current_location || null,
      preferredLocation: c.preferred_location || null,
      offerInHand: mapOfferInHand(c.offer_in_hand),
      interviewAvailability: c.available_for_interview || null,
      reasonForChange: c.reason_for_job_change || null,
      notes: c.notes || null,
      skills: [...new Set(skills.map((s) => s.toLowerCase()))].map((s) => s), // keep lower for dedupe then...
      resumeFileId: null,
      resumeFileName: c.resume_url ? path.basename(String(c.resume_url)) : null,
      sourcedByRecruiterId: sourced,
      status: c.is_active === false ? 'New' : 'New',
      deletedAt: c.is_active === false ? c.updated_at || new Date() : null,
      legacyPostgresId: c.id,
      legacy: {
        candidateRef: c.candidate_ref || null,
        education: c.education || null,
        technologies: c.technologies || null,
        sourcePlatform: c.source_platform || null,
        sourcePlatformId: c.source_platform_id || null,
        experienceLabel: c.experience_label || null,
        resumeUrl: c.resume_url || null,
        phoneNormalized: c.phone_normalized || null,
        offerInHandDetails: c.offer_in_hand_details || null,
        offerInHandAmount: c.offer_in_hand_amount || null,
        offerInHandCompany: c.offer_in_hand_company || null,
        createdByMissing: !c.created_by,
        skillsOriginal: c.skills || null,
      },
      schemaVersion: 1,
      createdAt: c.created_at || new Date(),
      updatedAt: c.updated_at || new Date(),
    });
  }
  // Fix skills casing: use original unique list properly
  for (const doc of candidateDocs) {
    const orig = [
      ...(Array.isArray(doc.legacy.skillsOriginal) ? doc.legacy.skillsOriginal : []),
      ...(Array.isArray(doc.legacy.technologies) ? doc.legacy.technologies : []),
    ]
      .map((s) => String(s || '').trim())
      .filter(Boolean);
    const seen = new Set();
    doc.skills = [];
    for (const s of orig) {
      const k = s.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      doc.skills.push(s);
    }
  }
  console.log(
    `Candidates to insert: ${candidateDocs.length} (phone collisions remapped: ${phoneDeduped}, synthetic-email cases: ${candSkipped + missingEmail})`,
  );

  // -------- REQUIREMENTS --------
  const v1Reqs = await pgAll(pg, `SELECT * FROM requirements ORDER BY created_at`);
  const v1Assign = await pgAll(pg, `SELECT * FROM requirement_assignments ORDER BY assigned_on`);
  const activeByReq = new Map();
  for (const a of v1Assign) {
    if (a.status !== 'ACTIVE') continue;
    if (!activeByReq.has(a.requirement_id)) activeByReq.set(a.requirement_id, []);
    const uid = userMap.get(a.recruiter_id);
    if (uid) activeByReq.get(a.requirement_id).push(uid);
  }

  const requirementDocs = [];
  for (const r of v1Reqs) {
    const clientOid = clientMap.get(r.client_id);
    if (!clientOid) continue;
    const _id = oid();
    requirementMap.set(r.id, _id);
    const assignees = [...new Set((activeByReq.get(r.id) || []).map(String))].map((id) => new ObjectId(id));
    const clientName =
      v1Clients.find((c) => c.id === r.client_id)?.name || 'Unknown';
    requirementDocs.push({
      _id,
      orgId,
      reqCode: r.requirement_id || r.id,
      title: r.role_title || r.requirement_id || 'Untitled',
      clientId: clientOid,
      clientName,
      priority: PRIORITY_MAP[r.priority] || 'Medium',
      status: REQUIREMENT_STATUS_MAP[r.status] || 'Open',
      assignmentStatus: REQUIREMENT_ASSIGNMENT_STATUS_MAP[r.assignment] || 'Unassigned',
      openings: r.open_positions || 1,
      submissionsCount: r.submissions_count || 0,
      interviewsCount: 0,
      placedCount: 0,
      budgetRange: {
        min: Number(r.yearly_budget_inr || r.overall_budget || 0) || 0,
        max: Number(r.yearly_budget_inr || r.overall_budget || 0) || 0,
        currency: r.budget_currency || 'INR',
      },
      budgetText: r.yearly_budget_inr
        ? `₹${r.yearly_budget_inr}`
        : r.overall_budget
          ? String(r.overall_budget)
          : null,
      assignedLeadId: null,
      assignedRecruiterIds: assignees,
      skillsRequired: [
        ...(Array.isArray(r.skills) ? r.skills : []),
        ...(Array.isArray(r.technologies) ? r.technologies : []),
      ]
        .map((s) => String(s || '').trim())
        .filter(Boolean),
      mandatorySkills: Array.isArray(r.skills) ? r.skills.filter(Boolean) : [],
      experienceRange: { min: 0, max: 0 },
      location: r.location || 'Hybrid',
      emailArrivedTime: r.created_at || new Date(),
      clientEmail: r.client_lead_poc || r.client_poc || null,
      toEmails: [],
      ccEmails: [],
      sourceMessageId: r.source_email_graph_message_id || null,
      sourceClientJdId: r.client_jd_id || null,
      sourceSubject: r.source_email_subject || null,
      idempotencyKey: r.source_email_internet_message_id || null,
      deletedAt: r.is_deleted ? r.deleted_at || new Date() : null,
      legacyPostgresId: r.id,
      legacy: {
        experienceRaw: r.experience || null,
        experienceLevel: r.experience_level || null,
        employmentType: r.employment_type || null,
        workMode: r.work_mode || null,
        noticePeriod: r.notice_period || null,
        slaDays: r.sla_days || null,
        demandType: r.demand_type || null,
        internalPoc: r.internal_poc || null,
        clientPoc: r.client_poc || null,
        clientLeadPoc: r.client_lead_poc || null,
        technologies: r.technologies || null,
        sourceMailbox: r.source_email_mailbox || null,
      },
      schemaVersion: 1,
      createdAt: r.created_at || new Date(),
      updatedAt: r.updated_at || new Date(),
    });
  }
  console.log(`Requirements to insert: ${requirementDocs.length}`);

  // -------- ASSIGNMENTS LEDGER --------
  const assignmentDocs = [];
  for (const a of v1Assign) {
    const reqOid = requirementMap.get(a.requirement_id);
    const recOid = userMap.get(a.recruiter_id);
    const byOid = userMap.get(a.assigned_by) || fallbackRecruiter._id;
    if (!reqOid || !recOid) continue;
    assignmentDocs.push({
      _id: oid(),
      orgId,
      requirementId: reqOid,
      recruiterId: recOid,
      assignedBy: byOid,
      assignedOn: a.assigned_on || a.created_at || new Date(),
      status: a.status || 'ACTIVE',
      notes: a.notes || null,
      legacyPostgresId: a.id,
      legacy: null,
      deletedAt: null,
      schemaVersion: 1,
      createdAt: a.created_at || new Date(),
      updatedAt: a.updated_at || new Date(),
    });
  }
  console.log(`Requirement assignments to insert: ${assignmentDocs.length}`);

  // -------- SUBMISSIONS --------
  const v1Subs = await pgAll(pg, `SELECT * FROM submissions ORDER BY submitted_on`);
  const submissionDocs = [];
  for (const s of v1Subs) {
    const candOid = candidateMap.get(s.candidate_id);
    const reqOid = requirementMap.get(s.requirement_id);
    const clientOid = clientMap.get(s.clientId) || clientMap.get(s.client_id);
    const recruiterOid = userMap.get(s.submitted_by) || fallbackRecruiter._id;
    if (!candOid || !reqOid || !clientOid) continue;
    const stageInfo = SUBMISSION_STAGE_MAP[s.status] || {
      stage: 'Submitted',
      leadApprovalStatus: 'Pending',
    };
    const _id = oid();
    submissionMap.set(s.id, _id);
    submissionDocs.push({
      _id,
      orgId,
      submissionId: s.submission_ref || s.id,
      candidateId: candOid,
      requirementId: reqOid,
      clientId: clientOid,
      recruiterId: recruiterOid,
      leadId: (s.assigned_lead_id && userMap.get(s.assigned_lead_id)) || null,
      stage: stageInfo.stage,
      leadApprovalStatus: stageInfo.leadApprovalStatus,
      matchScore: 0,
      submittedAt: s.submitted_on || s.created_at || new Date(),
      leadApprovedAt: null,
      clientForwardedAt: s.forwarded_on || null,
      rejectionReason: s.rejection_reason || null,
      deletedAt: null,
      legacyPostgresId: s.id,
      legacy: {
        v1Status: s.status,
        soNumber: s.so_number || null,
        clientFeedback: s.client_feedback || null,
        interviewDate: s.interview_date || null,
        interviewLocation: s.interview_location || null,
        interviewType: s.interview_type || null,
        forwardedBy: s.forwarded_by || null,
        offerInHand: s.offer_in_hand || null,
      },
      schemaVersion: 1,
      createdAt: s.created_at || new Date(),
      updatedAt: s.updated_at || new Date(),
    });
  }
  console.log(`Submissions to insert: ${submissionDocs.length}`);

  // -------- SUBMISSION HISTORIES --------
  const v1Hist = await pgAll(pg, `SELECT * FROM candidate_status_history ORDER BY created_at`);
  const submissionHistoryDocs = [];
  for (const h of v1Hist) {
    const subOid = submissionMap.get(h.submission_id);
    if (!subOid) continue;
    const mappedNew = SUBMISSION_STAGE_MAP[h.new_status]?.stage || h.new_status;
    const mappedOld = h.old_status
      ? SUBMISSION_STAGE_MAP[h.old_status]?.stage || h.old_status
      : null;
    submissionHistoryDocs.push({
      _id: oid(),
      orgId,
      submissionId: subOid,
      previousStage: mappedOld,
      newStage: mappedNew,
      performedBy: (h.changed_by_id && userMap.get(h.changed_by_id)) || fallbackRecruiter._id,
      notes: h.reason || null,
      legacyPostgresId: h.id,
      legacy: { metadata: h.metadata || null, v1Old: h.old_status, v1New: h.new_status },
      schemaVersion: 1,
      createdAt: h.created_at || new Date(),
      updatedAt: h.created_at || new Date(),
    });
  }
  console.log(`Submission histories to insert: ${submissionHistoryDocs.length}`);

  // -------- INTERVIEWS (prefer rounds, else legacy) --------
  const v1Rounds = await pgAll(pg, `SELECT * FROM interview_rounds ORDER BY scheduled_at`);
  const v1Interviews = await pgAll(pg, `SELECT * FROM interviews ORDER BY scheduled_at`);
  const interviewDocs = [];
  const feedbackDocs = [];
  const coveredLegacy = new Set();

  for (const r of v1Rounds) {
    const subOid = submissionMap.get(r.submission_id);
    if (!subOid) continue;
    const sub = submissionDocs.find((s) => String(s._id) === String(subOid));
    if (!sub) continue;
    if (r.legacy_interview_id) coveredLegacy.add(r.legacy_interview_id);
    const _id = oid();
    interviewDocs.push({
      _id,
      orgId,
      interviewId: r.id,
      submissionId: subOid,
      candidateId: sub.candidateId,
      requirementId: sub.requirementId,
      round: INTERVIEW_ROUND_MAP[r.round_type] || r.round_type || 'L1 Technical',
      dateTime: r.scheduled_at || new Date(),
      durationMinutes: 60,
      mode: INTERVIEW_MODE_MAP[String(r.mode || '').toUpperCase()] || r.mode || 'Online',
      meetingUrl: r.meeting_link || null,
      interviewerName: r.interviewer_name || 'TBD',
      interviewerEmail: r.interviewer_email || 'noreply@legacy.invalid',
      status: r.status || 'Scheduled',
      notes: r.notes || null,
      candidateEmail: null,
      candidatePhone: null,
      reminderSent: false,
      emailSent: false,
      whatsappSent: false,
      whatsappUrl: null,
      deletedAt: null,
      legacyPostgresId: r.id,
      legacy: {
        v1RoundId: r.id,
        v1InterviewId: r.legacy_interview_id || null,
        rating: r.rating,
        finalDecision: r.final_decision,
        feedback: r.feedback,
      },
      schemaVersion: 1,
      createdAt: r.created_at || new Date(),
      updatedAt: r.updated_at || new Date(),
    });
    if (r.feedback || r.rating != null || r.final_decision) {
      feedbackDocs.push({
        _id: oid(),
        orgId,
        interviewId: _id,
        overallScore: r.rating || 0,
        recommendation:
          String(r.final_decision || '').toUpperCase() === 'REJECTED'
            ? 'Rejected'
            : String(r.final_decision || '').toUpperCase() === 'SELECTED'
              ? 'Passed'
              : 'Hold',
        comments: r.feedback || null,
        legacyPostgresId: `${r.id}-feedback`,
        legacy: null,
        schemaVersion: 1,
        createdAt: r.updated_at || new Date(),
        updatedAt: r.updated_at || new Date(),
      });
    }
  }

  for (const iv of v1Interviews) {
    if (coveredLegacy.has(iv.id)) continue;
    const subOid = submissionMap.get(iv.submission_id);
    if (!subOid) continue;
    const sub = submissionDocs.find((s) => String(s._id) === String(subOid));
    if (!sub) continue;
    const _id = oid();
    interviewDocs.push({
      _id,
      orgId,
      interviewId: iv.id,
      submissionId: subOid,
      candidateId: sub.candidateId,
      requirementId: sub.requirementId,
      round: iv.round || 'L1 Technical',
      dateTime: iv.scheduled_at || new Date(),
      durationMinutes: 60,
      mode: INTERVIEW_MODE_MAP[String(iv.mode || '').toUpperCase()] || iv.mode || 'Online',
      meetingUrl: iv.meeting_link || null,
      interviewerName: 'TBD',
      interviewerEmail: 'noreply@legacy.invalid',
      status: iv.status || 'Scheduled',
      notes: iv.notes || null,
      deletedAt: null,
      legacyPostgresId: iv.id,
      legacy: {
        v1InterviewId: iv.id,
        recruiterId: iv.recruiter_id,
        rating: iv.rating,
        finalDecision: iv.final_decision,
        feedback: iv.feedback,
      },
      schemaVersion: 1,
      createdAt: iv.created_at || new Date(),
      updatedAt: iv.updated_at || new Date(),
    });
  }
  console.log(`Interviews to insert: ${interviewDocs.length} (+ feedback ${feedbackDocs.length})`);

  // -------- REQUIREMENT ACTIVITIES → histories --------
  const v1Acts = await pgAll(pg, `SELECT * FROM requirement_activities ORDER BY created_at`);
  const reqHistoryDocs = [];
  for (const a of v1Acts) {
    const reqOid = requirementMap.get(a.requirement_id);
    if (!reqOid) continue;
    reqHistoryDocs.push({
      _id: oid(),
      orgId,
      requirementId: reqOid,
      action: a.action || 'ACTIVITY',
      previousValue: null,
      newValue: a.metadata || null,
      performedBy: (a.actor_id && userMap.get(a.actor_id)) || fallbackRecruiter._id,
      reason: a.summary || null,
      legacyPostgresId: a.id,
      legacy: { summary: a.summary, metadata: a.metadata },
      schemaVersion: 1,
      createdAt: a.created_at || new Date(),
      updatedAt: a.created_at || new Date(),
    });
  }
  console.log(`Requirement histories to insert: ${reqHistoryDocs.length}`);

  // -------- EMAIL INGESTION EVENTS --------
  const v1Emails = await pgAll(pg, `SELECT * FROM email_ingestion_events ORDER BY created_at`);
  const emailDocs = v1Emails.map((e) => ({
    _id: oid(),
    orgId,
    idempotencyKey: e.idempotency_key,
    graphMessageId: e.graph_message_id || null,
    internetMessageId: e.internet_message_id || null,
    source: e.source || 'EMAIL_AUTOMATION',
    status: e.status || 'PENDING',
    errorMessage: e.error_message || null,
    requirementId: (e.requirement_pk && requirementMap.get(e.requirement_pk)) || null,
    requirementCode: e.requirement_code || null,
    payload: e.payload || null,
    legacyPostgresId: e.id,
    deletedAt: null,
    schemaVersion: 1,
    createdAt: e.created_at || new Date(),
    updatedAt: e.updated_at || new Date(),
  }));
  console.log(`Email ingestion events to insert: ${emailDocs.length}`);

  // Sample preview
  console.log('\nSample mapped candidate:', {
    name: candidateDocs[0]?.name,
    email: candidateDocs[0]?.email,
    candidateId: candidateDocs[0]?.candidateId,
    legacyPostgresId: candidateDocs[0]?.legacyPostgresId,
  });
  console.log('Sample mapped submission:', {
    submissionId: submissionDocs[0]?.submissionId,
    stage: submissionDocs[0]?.stage,
    legacyPostgresId: submissionDocs[0]?.legacyPostgresId,
  });

  const planPath = path.join(__dirname, 'dry-run-report.json');
  const report = {
    mode: APPLY ? 'apply' : 'dry-run',
    at: new Date().toISOString(),
    orgId: String(orgId),
    v1Counts,
    plannedInserts: {
      users: userDocs.length,
      clients: clientDocs.length,
      candidates: candidateDocs.length,
      requirements: requirementDocs.length,
      requirement_assignments: assignmentDocs.length,
      submissions: submissionDocs.length,
      submission_histories: submissionHistoryDocs.length,
      interviews: interviewDocs.length,
      interview_feedbacks: feedbackDocs.length,
      requirement_histories: reqHistoryDocs.length,
      email_ingestion_events: emailDocs.length,
    },
    risks: {
      missingCreatedBy,
      missingEmail,
      usersNoEmail,
      phoneDeduped,
      phoneDupeGroups: phoneDupes.length,
    },
    note: 'Resumes (file copy + file_metadata) are Step 4 — not in this ETL core load.',
  };
  fs.writeFileSync(planPath, JSON.stringify(report, null, 2));
  console.log(`\nWrote report: ${planPath}`);

  if (!APPLY) {
    console.log('\nDRY-RUN complete. No Mongo documents were written.');
    console.log('Next: Step 3 → run with --apply to load data (still no app code changes).');
    await pg.end();
    await mongoose.disconnect();
    return;
  }

  // -------- APPLY --------
  console.log('\nAPPLY: inserting into Mongo...');
  const insert = async (name, docs) => {
    if (!docs.length) return { name, inserted: 0, duplicates: 0 };
    try {
      const res = await db.collection(name).insertMany(docs, { ordered: false });
      return { name, inserted: res.insertedCount, duplicates: 0 };
    } catch (err) {
      if (err && (err.code === 11000 || err.writeErrors)) {
        const inserted = err.result?.insertedCount ?? err.insertedCount ?? 0;
        const duplicates = Array.isArray(err.writeErrors) ? err.writeErrors.length : 1;
        console.warn(`  warn ${name}: partial insert inserted=${inserted} dupErrors=${duplicates}`);
        return { name, inserted, duplicates, error: err.message };
      }
      throw err;
    }
  };

  const results = [];
  results.push(await insert('users', userDocs));
  results.push(await insert('clients', clientDocs));
  results.push(await insert('candidates', candidateDocs));
  results.push(await insert('requirements', requirementDocs));
  results.push(await insert('requirement_assignments', assignmentDocs));
  results.push(await insert('submissions', submissionDocs));
  results.push(await insert('submission_histories', submissionHistoryDocs));
  results.push(await insert('interviews', interviewDocs));
  if (feedbackDocs.length) results.push(await insert('interview_feedbacks', feedbackDocs));
  results.push(await insert('requirement_histories', reqHistoryDocs));
  results.push(await insert('email_ingestion_events', emailDocs));

  // candidateId counter
  const maxCandNum = candidateDocs.reduce((m, c) => {
    const n = parseInt(String(c.candidateId).replace(/\D/g, ''), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  await db.collection('counters').updateOne(
    { _id: `candidateId:${orgId}` },
    { $set: { seq: Math.max(maxCandNum, candidateDocs.length), orgId } },
    { upsert: true },
  );

  console.log('Insert results:', results);
  console.log('APPLY complete. Test logins preserved. Resumes still pending (Step 4).');

  await pg.end();
  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error('ETL failed:', e);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
