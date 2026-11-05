/**
 * Wipe V2 business/test documents only.
 * Keeps: collections + indexes, organizations, roles_permissions,
 * and test login users (all roles). Does NOT drop schemas/collections.
 */
const path = require('path');
const mongoose = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mongoose'));

const KEEP_USER_EMAILS = new Set([
  'superadmin@metaforge.local',
  'admin@metaforge.local',
  'lead@metaforge.local',
  'recruiter@metaforge.local',
  'devteam@metaforge.local',
  'client@metaforge.local',
  // frontend demo chooser accounts (if present)
  'r.haines@talentflow.io',
  'd.park@talentflow.io',
  'harish.g@metaforgeit.com',
  'm.chen@talentflow.io',
  'dev.team@talentflow.io',
  'client@accenture.com',
]);

const CLEAR_COLLECTIONS = [
  'activity_logs',
  'ai_match_scores',
  'ai_parsing_jobs',
  'candidate_blacklist',
  'candidate_documents',
  'candidates',
  'client_submit_approvals',
  'clients',
  'counters',
  'daily_attendance_reports',
  'email_ingestion_events',
  'email_templates',
  'file_metadata',
  'interview_feedbacks',
  'interviews',
  'job_locks',
  'notifications',
  'offers',
  'recruiter_analytics',
  'recruiter_login_histories',
  'requirement_assignments',
  'requirement_histories',
  'requirements',
  'saved_searches',
  'submission_histories',
  'submissions',
  'teams',
  'user_audit_logs',
];

async function main() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB_NAME || 'metaforge_recruiter_v2';
  await mongoose.connect(uri, { dbName });
  const db = mongoose.connection.db;

  const report = { cleared: {}, usersDeleted: [], usersKept: [] };

  for (const name of CLEAR_COLLECTIONS) {
    const exists = (await db.listCollections({ name }).toArray()).length > 0;
    if (!exists) {
      report.cleared[name] = 'missing';
      continue;
    }
    const before = await db.collection(name).countDocuments();
    const res = await db.collection(name).deleteMany({});
    report.cleared[name] = { before, deleted: res.deletedCount };
  }

  const users = await db.collection('users').find({}).toArray();
  for (const u of users) {
    const email = String(u.email || '').toLowerCase();
    if (KEEP_USER_EMAILS.has(email)) {
      report.usersKept.push({ email, role: u.role, name: u.name });
    } else {
      await db.collection('users').deleteOne({ _id: u._id });
      report.usersDeleted.push({ email, role: u.role, name: u.name });
    }
  }

  const sampleCounts = {};
  for (const name of [
    'candidates',
    'clients',
    'requirements',
    'submissions',
    'users',
    'organizations',
    'roles_permissions',
    'teams',
  ]) {
    sampleCounts[name] = await db.collection(name).countDocuments();
  }

  const remainingUsers = await db
    .collection('users')
    .find({}, { projection: { email: 1, role: 1, name: 1, userId: 1 } })
    .toArray();

  console.log(
    JSON.stringify(
      {
        dbName,
        note: 'Collections/indexes preserved; documents cleared only',
        report,
        remainingUsers,
        sampleCounts,
      },
      null,
      2,
    ),
  );

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
