/**
 * Ensure every candidate has a unique numeric business id (e.g. "20834").
 * Continues from the highest reasonable id already in the DB (dump/restore safe).
 *
 * Run from repo root:
 *   node migrations/20261029_001_unique_candidate_ids.js
 */
const path = require('path');
const fs = require('fs');

(() => {
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]]) continue;
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
})();

const mongoose = require(path.join(__dirname, '..', 'backend', 'node_modules', 'mongoose'));

const MAX_REASONABLE = 9_999_999;

function parseSeq(raw) {
  const id = String(raw || '').trim();
  if (!id) return null;
  const m = id.match(/^CAND-(\d+)$/i) || id.match(/^(\d+)$/);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  if (!Number.isFinite(n) || n <= 0 || n > MAX_REASONABLE) return null;
  return n;
}

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const dbName = process.env.MONGODB_DB_NAME || 'metaforge_recruiter_v2';
  await mongoose.connect(uri, { dbName });
  const db = mongoose.connection.db;
  const candidates = db.collection('candidates');
  const counters = db.collection('counters');

  const orgIds = await candidates.distinct('orgId', { deletedAt: null });
  let rewritten = 0;
  let normalized = 0;

  for (const orgId of orgIds) {
    const rows = await candidates
      .find({ orgId, deletedAt: null })
      .project({ _id: 1, candidateId: 1 })
      .sort({ _id: 1 })
      .toArray();

    let maxSeq = 0;
    for (const row of rows) {
      const n = parseSeq(row.candidateId);
      if (n != null && n > maxSeq) maxSeq = n;
    }

    const assigned = new Set();
    for (const row of rows) {
      const current = String(row.candidateId || '').trim();
      const seq = parseSeq(current);
      const isDupOrJunk = seq == null || assigned.has(String(seq));
      if (!isDupOrJunk) {
        assigned.add(String(seq));
        if (/^CAND-\d+$/i.test(current)) {
          const plain = String(seq);
          if (plain !== current) {
            await candidates.updateOne({ _id: row._id }, { $set: { candidateId: plain } });
            normalized += 1;
          }
        }
        continue;
      }

      maxSeq += 1;
      const nextId = String(maxSeq);
      assigned.add(nextId);
      await candidates.updateOne({ _id: row._id }, { $set: { candidateId: nextId } });
      rewritten += 1;
    }

    const counterKey = `candidateId:${orgId.toString()}`;
    await counters.updateOne(
      { _id: counterKey },
      { $set: { seq: maxSeq, orgId } },
      { upsert: true },
    );
  }

  try {
    await candidates.createIndex(
      { orgId: 1, candidateId: 1 },
      {
        unique: true,
        partialFilterExpression: { deletedAt: null },
        name: 'uniq_org_candidateId_active',
      },
    );
  } catch (err) {
    console.warn('Index create skipped/failed:', err.message);
  }

  console.log(JSON.stringify({ db: dbName, orgs: orgIds.length, rewritten, normalized }, null, 2));
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
