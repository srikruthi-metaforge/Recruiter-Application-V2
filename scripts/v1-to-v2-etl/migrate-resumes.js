/**
 * Step 4: Copy V1 resume files into V2 STORAGE_ROOT, create file_metadata,
 * link candidates.resumeFileId (+ optional candidate_documents).
 * Does not modify frontend/backend application source.
 */
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const mongoose = require(path.join(__dirname, '..', '..', 'backend', 'node_modules', 'mongoose'));
const { ObjectId } = mongoose.Types;

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
const MONGO_DB = process.env.MONGODB_DB_NAME || 'metaforge_recruiter_v2';
const V1_RESUMES_DIR =
  process.env.V1_RESUMES_DIR ||
  path.join(
    __dirname,
    '..',
    '..',
    'V1_postgre_backup',
    'staffing_db_full_2026-10-31_120514',
    'uploads',
    'resumes',
  );
const STORAGE_ROOT =
  process.env.STORAGE_ROOT ||
  path.join(__dirname, '..', '..', 'backend', 'storage', 'private');

const DRY_RUN = process.argv.includes('--dry-run');
const LIMIT = Number(process.env.RESUME_MIGRATE_LIMIT || 0) || 0;

const MIME = {
  '.pdf': 'application/pdf',
  '.doc': 'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.txt': 'text/plain',
  '.rtf': 'application/rtf',
};

function basenameSafe(resumeUrl) {
  const raw = String(resumeUrl || '').replace(/\\/g, '/');
  const base = path.basename(raw);
  return base && base !== '.' && base !== '..' ? base : '';
}

async function main() {
  console.log('=== Step 4: Resume migration ===');
  console.log(`Mode: ${DRY_RUN ? 'DRY-RUN' : 'APPLY'}`);
  console.log(`V1 resumes: ${V1_RESUMES_DIR}`);
  console.log(`STORAGE_ROOT: ${STORAGE_ROOT}`);

  if (!fs.existsSync(V1_RESUMES_DIR)) {
    throw new Error(`V1 resumes folder missing: ${V1_RESUMES_DIR}`);
  }
  fs.mkdirSync(STORAGE_ROOT, { recursive: true });

  await mongoose.connect(MONGO_URI, { dbName: MONGO_DB });
  const db = mongoose.connection.db;

  const org = await db.collection('organizations').findOne({});
  if (!org) throw new Error('No organization found');
  const orgId = org._id;
  const orgDir = path.join(STORAGE_ROOT, 'resumes', String(orgId).replace(/[^a-fA-F0-9]/g, ''));
  fs.mkdirSync(orgDir, { recursive: true });

  const fallbackUser =
    (await db.collection('users').findOne({ role: 'recruiter', deletedAt: null })) ||
    (await db.collection('users').findOne({ deletedAt: null }));
  if (!fallbackUser) throw new Error('No user for uploadedBy');

  const filter = {
    deletedAt: null,
    $or: [
      { 'legacy.resumeUrl': { $type: 'string', $gt: '' } },
      { resumeFileName: { $type: 'string', $gt: '' } },
    ],
  };
  const total = await db.collection('candidates').countDocuments(filter);
  console.log(`Candidates with resume reference: ${total}`);

  const cursor = db
    .collection('candidates')
    .find(filter)
    .project({
      _id: 1,
      name: 1,
      resumeFileId: 1,
      resumeFileName: 1,
      sourcedByRecruiterId: 1,
      legacy: 1,
      legacyPostgresId: 1,
    });

  let processed = 0;
  let linked = 0;
  let skippedAlready = 0;
  let missingFile = 0;
  let errors = 0;
  const missingSamples = [];

  while (await cursor.hasNext()) {
    if (LIMIT && processed >= LIMIT) break;
    const cand = await cursor.next();
    processed++;

    if (cand.resumeFileId) {
      skippedAlready++;
      continue;
    }

    const resumeUrl = cand.legacy?.resumeUrl || cand.resumeFileName || '';
    const fileName = basenameSafe(resumeUrl);
    if (!fileName) {
      missingFile++;
      continue;
    }

    const srcPath = path.join(V1_RESUMES_DIR, fileName);
    if (!fs.existsSync(srcPath)) {
      missingFile++;
      if (missingSamples.length < 10) missingSamples.push(fileName);
      continue;
    }

    if (DRY_RUN) {
      linked++;
      continue;
    }

    try {
      const stat = fs.statSync(srcPath);
      const ext = path.extname(fileName).toLowerCase() || '.bin';
      const opaqueName = `${crypto.randomUUID()}${ext}`;
      const destPath = path.join(orgDir, opaqueName);
      fs.copyFileSync(srcPath, destPath);
      try {
        fs.chmodSync(destPath, 0o600);
      } catch (_) {}

      const buffer = fs.readFileSync(destPath);
      const checksumSha256 = crypto.createHash('sha256').update(buffer).digest('hex');
      const storageKey = path
        .relative(STORAGE_ROOT, destPath)
        .split(path.sep)
        .join('/');
      const fileId = `FILE-V1-${Date.now()}-${processed}`;
      const uploadedBy = cand.sourcedByRecruiterId || fallbackUser._id;
      const fileMetaId = new ObjectId();

      await db.collection('file_metadata').insertOne({
        _id: fileMetaId,
        orgId,
        fileId,
        originalName: fileName,
        mimeType: MIME[ext] || 'application/octet-stream',
        sizeBytes: stat.size,
        storageProvider: 'LOCAL',
        bucketName: 'private-resumes',
        storageKey,
        checksumSha256,
        scanStatus: 'CLEAN',
        uploadedBy,
        deletedAt: null,
        legacyPostgresId: `resume:${fileName}`,
        legacy: {
          v1ResumeUrl: resumeUrl,
          v1SourcePath: srcPath,
          candidateLegacyPostgresId: cand.legacyPostgresId || null,
        },
        schemaVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await db.collection('candidates').updateOne(
        { _id: cand._id },
        {
          $set: {
            resumeFileId: fileMetaId,
            resumeFileName: fileName,
            updatedAt: new Date(),
          },
        },
      );

      await db.collection('candidate_documents').insertOne({
        _id: new ObjectId(),
        orgId,
        candidateId: cand._id,
        documentType: 'Resume',
        fileMetadataId: fileMetaId,
        isPrimaryResume: true,
        deletedAt: null,
        schemaVersion: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      linked++;
      if (linked % 500 === 0) {
        console.log(`  progress linked=${linked} processed=${processed} missing=${missingFile}`);
      }
    } catch (e) {
      errors++;
      if (errors <= 5) console.warn(`  error ${fileName}: ${e.message}`);
    }
  }

  const report = {
    mode: DRY_RUN ? 'dry-run' : 'apply',
    at: new Date().toISOString(),
    totalWithResumeRef: total,
    processed,
    linked,
    skippedAlready,
    missingFile,
    errors,
    missingSamples,
    storageRoot: STORAGE_ROOT,
    orgDir,
  };
  const reportPath = path.join(__dirname, 'resume-migrate-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log('\nResult:', report);
  console.log(`Wrote ${reportPath}`);

  await mongoose.disconnect();
}

main().catch(async (e) => {
  console.error(e);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
