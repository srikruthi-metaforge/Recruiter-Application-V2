/** Clear partial ETL business docs; keep org, roles_permissions, and all users. */
const path = require('path');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));

const CLEAR = [
  'clients',
  'candidates',
  'candidate_documents',
  'requirements',
  'requirement_assignments',
  'requirement_histories',
  'submissions',
  'submission_histories',
  'interviews',
  'interview_feedbacks',
  'email_ingestion_events',
  'file_metadata',
  'counters',
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017', {
    dbName: process.env.MONGODB_DB_NAME || 'metaforge_recruiter_v2',
  });
  const db = mongoose.connection.db;
  const out = {};
  for (const name of CLEAR) {
    const before = await db.collection(name).countDocuments();
    const res = await db.collection(name).deleteMany({});
    out[name] = { before, deleted: res.deletedCount };
  }
  out.usersKept = await db.collection('users').countDocuments();
  out.orgs = await db.collection('organizations').countDocuments();
  console.log(JSON.stringify(out, null, 2));
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
