/**
 * Additive V1-compatibility indexes only.
 * - Does NOT delete documents
 * - Does NOT drop existing V2 indexes
 * - Safe / idempotent createIndex calls
 *
 * Run from repo root (with migrate-mongo) or:
 *   node migrations/20261031_001_v1_compat_schema_indexes.js
 */
const fs = require('fs');
const path = require('path');

(() => {
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();

const COLLECTIONS_WITH_ORG_LEGACY = [
  'users',
  'clients',
  'candidates',
  'requirements',
  'requirement_histories',
  'requirement_assignments',
  'email_ingestion_events',
  'submissions',
  'submission_histories',
  'interviews',
  'interview_feedbacks',
  'file_metadata',
];

const PARTIAL = { legacyPostgresId: { $type: 'string', $gt: '' } };

async function ensureOrgLegacyIndex(db, name) {
  const col = db.collection(name);
  // Ensure collection exists without inserting data
  const existing = await db.listCollections({ name }).toArray();
  if (!existing.length) {
    await db.createCollection(name);
  }
  try {
    await col.createIndex(
      { orgId: 1, legacyPostgresId: 1 },
      {
        unique: true,
        name: 'uniq_org_legacyPostgresId',
        partialFilterExpression: PARTIAL,
      },
    );
    return { collection: name, index: 'uniq_org_legacyPostgresId', ok: true };
  } catch (err) {
    return { collection: name, index: 'uniq_org_legacyPostgresId', ok: false, error: err.message };
  }
}

async function ensureAssignmentIndexes(db) {
  const col = db.collection('requirement_assignments');
  const results = [];
  for (const [keys, opts] of [
    [{ orgId: 1, requirementId: 1, status: 1, assignedOn: -1 }, { name: 'org_req_status_assignedOn' }],
    [{ orgId: 1, recruiterId: 1, status: 1, assignedOn: -1 }, { name: 'org_recruiter_status_assignedOn' }],
  ]) {
    try {
      await col.createIndex(keys, opts);
      results.push({ index: opts.name, ok: true });
    } catch (err) {
      results.push({ index: opts.name, ok: false, error: err.message });
    }
  }
  return results;
}

async function ensureEmailIngestionIndexes(db) {
  const col = db.collection('email_ingestion_events');
  const results = [];
  const specs = [
    [
      { orgId: 1, idempotencyKey: 1 },
      { unique: true, name: 'uniq_org_email_ingestion_idempotencyKey' },
    ],
    [{ orgId: 1, graphMessageId: 1 }, { name: 'org_graphMessageId' }],
    [{ orgId: 1, status: 1, createdAt: -1 }, { name: 'org_status_createdAt' }],
  ];
  for (const [keys, opts] of specs) {
    try {
      await col.createIndex(keys, opts);
      results.push({ index: opts.name, ok: true });
    } catch (err) {
      results.push({ index: opts.name, ok: false, error: err.message });
    }
  }
  return results;
}

async function up(db) {
  const out = { legacyIndexes: [], assignmentIndexes: [], emailIndexes: [] };
  for (const name of COLLECTIONS_WITH_ORG_LEGACY) {
    out.legacyIndexes.push(await ensureOrgLegacyIndex(db, name));
  }
  out.assignmentIndexes = await ensureAssignmentIndexes(db);
  out.emailIndexes = await ensureEmailIngestionIndexes(db);
  return out;
}

async function down() {
  // Non-destructive policy: do not drop indexes automatically on down.
  return { skipped: true, reason: 'Additive migration; index drop omitted for safety' };
}

module.exports = {
  async up(db) {
    const result = await up(db);
    console.log(JSON.stringify(result, null, 2));
  },
  async down(db) {
    console.log(JSON.stringify(await down(db), null, 2));
  },
};

// Allow direct execution without migrate-mongo CLI
if (require.main === module) {
  const mongoose = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mongoose'));
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB_NAME || 'metaforge_recruiter_v2';
  (async () => {
    await mongoose.connect(uri, { dbName });
    const result = await up(mongoose.connection.db);
    console.log(JSON.stringify({ database: dbName, ...result }, null, 2));
    await mongoose.disconnect();
  })().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
