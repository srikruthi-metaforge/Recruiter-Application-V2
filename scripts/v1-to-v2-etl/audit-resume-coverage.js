/**
 * Audit V1→V2 resume mapping coverage and UI/API field readiness.
 */
const path = require('path');
const fs = require('fs');
const { Client } = require('pg');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));

const SAMPLE_IDS = ['V1-21019'];

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017', { dbName: 'metaforge_recruiter_v2' });
  const db = mongoose.connection.db;

  const totalCandidates = await db.collection('candidates').countDocuments({});
  const withResumeId = await db.collection('candidates').countDocuments({ resumeFileId: { $ne: null } });
  const withResumeName = await db.collection('candidates').countDocuments({
    resumeFileName: { $type: 'string', $gt: '' },
  });
  const withLegacyUrl = await db.collection('candidates').countDocuments({
    'legacy.resumeUrl': { $type: 'string', $gt: '' },
  });
  const legacyUrlNoFileId = await db.collection('candidates').countDocuments({
    resumeFileId: null,
    'legacy.resumeUrl': { $type: 'string', $gt: '' },
  });
  const fileMetaCount = await db.collection('file_metadata').countDocuments({});
  const resumeMetaCount = await db.collection('file_metadata').countDocuments({
    legacyPostgresId: { $regex: /^resume:/ },
  });

  // Broken links: resumeFileId set but file_metadata missing
  const linked = await db
    .collection('candidates')
    .find({ resumeFileId: { $ne: null } }, { projection: { candidateId: 1, name: 1, resumeFileId: 1, resumeFileName: 1 } })
    .limit(5000)
    .toArray();
  let brokenMeta = 0;
  let brokenDisk = 0;
  const storageRoot = path.join(__dirname, '..', '..', 'backend', 'storage', 'private');
  for (const c of linked.slice(0, 500)) {
    const f = await db.collection('file_metadata').findOne({ _id: c.resumeFileId });
    if (!f) {
      brokenMeta++;
      continue;
    }
    const disk = path.join(storageRoot, f.storageKey || '');
    if (!fs.existsSync(disk)) brokenDisk++;
  }

  // Sample specific candidates
  const samples = [];
  for (const id of SAMPLE_IDS) {
    const c = await db.collection('candidates').findOne({ candidateId: id });
    if (!c) {
      samples.push({ candidateId: id, found: false });
      continue;
    }
    const f = c.resumeFileId ? await db.collection('file_metadata').findOne({ _id: c.resumeFileId }) : null;
    const disk = f?.storageKey ? path.join(storageRoot, f.storageKey) : null;
    samples.push({
      candidateId: c.candidateId,
      name: c.name,
      resumeFileId: c.resumeFileId ? String(c.resumeFileId) : null,
      resumeFileName: c.resumeFileName || null,
      legacyResumeUrl: c.legacy?.resumeUrl || null,
      fileMetaExists: !!f,
      diskExists: disk ? fs.existsSync(disk) : false,
      // What sanitizeCandidate / mapCandidate would expose
      apiWouldReturn: {
        resumeFileId: c.resumeFileId ? String(c.resumeFileId) : null,
        resumeFileName: c.resumeFileName || null,
      },
    });
  }

  // Candidates with resumeFileName but null resumeFileId (name-only, no download)
  const nameOnly = await db.collection('candidates').countDocuments({
    resumeFileId: null,
    resumeFileName: { $type: 'string', $gt: '' },
  });

  // Distinct legacy resume URLs vs linked
  const legacyDistinct = await db.collection('candidates').aggregate([
    { $match: { 'legacy.resumeUrl': { $type: 'string', $gt: '' } } },
    { $group: { _id: '$legacy.resumeUrl' } },
    { $count: 'n' },
  ]).toArray();

  // V1 postgres counts
  let v1 = null;
  try {
    const pg = new Client({
      host: '127.0.0.1',
      port: 5433,
      user: 'postgres',
      password: 'v1restore',
      database: 'staffing_db_v1_restore',
    });
    await pg.connect();
    const totalV1 = await pg.query('SELECT COUNT(*)::int AS n FROM candidates');
    const withUrl = await pg.query(
      `SELECT COUNT(*)::int AS n FROM candidates WHERE resume_url IS NOT NULL AND TRIM(resume_url) <> ''`,
    );
    const distinctUrl = await pg.query(
      `SELECT COUNT(DISTINCT resume_url)::int AS n FROM candidates WHERE resume_url IS NOT NULL AND TRIM(resume_url) <> ''`,
    );
    const bala = await pg.query(
      `SELECT id, name, resume_url FROM candidates WHERE id::text = '21019' OR name ILIKE '%Bala Reddy%' LIMIT 5`,
    );
    v1 = {
      totalCandidates: totalV1.rows[0].n,
      withResumeUrl: withUrl.rows[0].n,
      distinctResumeUrls: distinctUrl.rows[0].n,
      balaSample: bala.rows,
    };
    await pg.end();
  } catch (e) {
    v1 = { error: String(e.message || e) };
  }

  // V1 files on disk
  const v1Dir = path.join(
    __dirname,
    '..',
    '..',
    'V1_postgre_backup',
    'staffing_db_full_2026-10-31_120514',
    'uploads',
    'resumes',
  );
  let v1FilesOnDisk = 0;
  if (fs.existsSync(v1Dir)) {
    v1FilesOnDisk = fs.readdirSync(v1Dir).filter((f) => fs.statSync(path.join(v1Dir, f)).isFile()).length;
  }

  const report = await db.collection('candidates').findOne(
    { resumeFileId: { $ne: null } },
    { projection: { candidateId: 1, name: 1, resumeFileName: 1 } },
  );

  console.log(
    JSON.stringify(
      {
        mongo: {
          totalCandidates,
          withResumeId,
          withResumeName,
          withLegacyUrl,
          legacyUrlNoFileId,
          nameOnlyNoFileId: nameOnly,
          fileMetaCount,
          resumeMetaCount,
          distinctLegacyUrls: legacyDistinct[0]?.n || 0,
          sampleLinkedOk: linked.length,
          brokenMetaInFirst500Linked: brokenMeta,
          brokenDiskInFirst500Linked: brokenDisk,
          exampleLinked: report,
        },
        v1,
        v1FilesOnDisk,
        samples,
        coveragePct: totalCandidates
          ? Number(((withResumeId / totalCandidates) * 100).toFixed(2))
          : 0,
        ofThoseWithLegacyUrlLinkedPct: withLegacyUrl
          ? Number((((withLegacyUrl - legacyUrlNoFileId) / withLegacyUrl) * 100).toFixed(2))
          : 0,
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
